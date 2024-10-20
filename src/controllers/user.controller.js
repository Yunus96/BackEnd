import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import { Email } from "../models/email.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import axios from "axios";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

//Sign Up controller
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { email, username, password } = req.body

    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    //const avatarLocalPath = req.files?.avatar[0]?.path;

    const user = await User.create({
        email, 
        password,
        username: username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


//Log in controller
const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const {email, password} = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }
    
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
    // }

    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

//logout user functionality
const logoutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    console.log(req.user)
    return res.json(req.user)
})


//creating refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const fetchEmails = asyncHandler(async (_, res)=>{
    try {
        const resp = await axios.get('https://flipkart-email-mock.vercel.app/')
        const data = resp.data
        const emailArray = Object.entries(data)[0]
        const actualArray = emailArray.find(element => Array.isArray(element))

        for(let i=0; i < actualArray.length; i++){
            const emailObject = actualArray[i]
            const idValue = Object.values(emailObject)[0]
            const isIdAvailable = await Email.findOne({id: idValue})
            const name = Object.entries(emailObject)[1][1].name

            if(isIdAvailable === null){
                const email = await Email.create({
                    id : idValue, 
                    read: false,
                    unread: true,
                    favourite: false,
                    name: name,
                    avatar: `https://ui-avatars.com/api/?name=${name}&size=128&background=e45065&color=ffffff&length=1&rounded=true`
                })
            }
        }

        const emailStatusData = await Email.find();
        const mergedResults = []; // Array to hold merged results

        for(let i=0; i < actualArray.length; i++){
            const array1 = actualArray[i]

            const array2 = emailStatusData[i]

            const mergedArray = Object.assign({},array1,array2)
            mergedResults.push(mergedArray); // Add mergedArray to the results
        }

        // function to convert unix time milisecond to human readable
        function formatUnixTime(unixTime) {
        //const date = new Date(emailSenderDetail.date * 1000) // Convert seconds to milliseconds
        const date = unixTime.toString().length === 10 ? new Date(unixTime * 1000) : new Date(unixTime);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
    
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? String(hours).padStart(2, '0') : '12'; // The hour '0' should be '12'
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    }
        const sortedResult = mergedResults.map(
            ({ id, from, date, subject, short_description, _doc : {read, unread, favourite, avatar }}) => ({ id, from, date: formatUnixTime(date), subject, short_description, read, unread, favourite, avatar  })
        )
       return res.json(sortedResult)   

    } catch (error) {
        console.log(error)
        throw new ApiError(500, "Something went wrong while fetching emails")
    }
})

const fetchEmaildetail = asyncHandler(async (req, res) => {
try {
    const emailBodyRequest = await axios.get(`https://flipkart-email-mock.vercel.app/?id=${req.params.id}`)
    const emailSender = await axios.get(`https://flipkart-email-mock.vercel.app`)
    const emailSenderDetail = emailSender.data.list.find(item => item.id === req.params.id)
    console.log(emailSenderDetail)
    //logic to get only email body without id
   
    //1. email body object
    const emailBody = emailBodyRequest.data.body

    //getting date and subject
    var unixTime = emailSenderDetail.date
    //2. human readable date
    let readableDate = formatUnixTime(unixTime)
    //3. email subject
    let subject = emailSenderDetail.subject

    // function to convert unix time milisecond to human readable
    function formatUnixTime(unixTime) {
        //const date = new Date(emailSenderDetail.date * 1000) // Convert seconds to milliseconds
        const date = unixTime.toString().length === 10 ? new Date(unixTime * 1000) : new Date(unixTime);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
    
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? String(hours).padStart(2, '0') : '12'; // The hour '0' should be '12'
    
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    }

    //code to get avatar and status of favourite
    const id = req.params.id
    const {favourite, avatar} = await Email.findOne({id})    

    const data = {
        id: req.params.id,
        avatar,
        readableDate,
        subject,
        favourite,
        emailBody
    }
    return res.status(200).json(new ApiResponse(200, data, "Email details fetched successfully")) 
} catch (error) {
    throw new ApiError(500, "Something went wrong while fetching email detail")
}
})


const markAsFavourite = asyncHandler(async (req, res) => {
        try {
                const id = req.params.id

                const email = await Email.findOne({ id });   
                
                // Toggle the favourite status
                const newFavouriteStatus = !email.favourite;

                const result = await Email.findOneAndUpdate({id}, 
                    {
                        $set:
                        {favourite: newFavouriteStatus}
                    }, 
                    {
                        returnDocument : 'after'
                    }
                )

                if (result === null) {
                    return res.status(404).json(new ApiResponse(404, result, "id not found"))
                }

                return res.status(200).json(new ApiResponse(200, result, "add to favourite successfully"))  

        } catch (error) {
            throw new ApiError(500, "Something went wrong failed to mark as favourite")
        }
    } 
)

const rocAnalyticData = asyncHandler(async (req, res) => {
    
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    fetchEmails,
    fetchEmaildetail,
    markAsFavourite,
    rocAnalyticData,
    getCurrentUser
}
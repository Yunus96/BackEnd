import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken,
    fetchEmails,
    fetchEmaildetail,
    markAsFavourite,
    rocAnalyticData,
    getCurrentUser
} from "../controllers/user.controller.js"

const router = Router()

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)
router.route("/all").get(fetchEmails)
router.route("/:id").get(markAsFavourite)
router.route("/detail/:id").get(fetchEmaildetail)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route('/user').get(getCurrentUser)
router.route("/analytics").get(verifyJWT, rocAnalyticData)

export default router
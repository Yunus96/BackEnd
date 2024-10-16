import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken,
    fetchEmails,
    markAsFavourite
} from "../controllers/user.controller.js"

const router = Router()

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)


//secured routes
router.route("/logout").post(  logoutUser)
router.route("/all").get(fetchEmails)
router.route("/:id").get(markAsFavourite)

export default router
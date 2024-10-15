import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken
} from "../controllers/user.controller.js"

const router = Router()

router.route("/login").post(loginUser)
router.route("/register").post(registerUser)


//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
export default router
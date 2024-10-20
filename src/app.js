import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/getcurrent", userRouter)
app.use("/api/v1/emails", userRouter)
app.use("/api/v1/email/", userRouter)
app.use('/api/v1/favourite', userRouter)
app.use("/api/v1/roc", userRouter)

export { app }
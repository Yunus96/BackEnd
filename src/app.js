import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import path from "path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({
    origin: "https://scintillating-gnome-7bea21.netlify.app",
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend', 'dist')))


//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/getcurrent", userRouter)
app.use("/api/v1/emails", userRouter)
app.use("/api/v1/email/", userRouter)
app.use('/api/v1/favourite', userRouter)
app.use("/api/v1/roc", userRouter)

app.get("/", (req, res)=>{
    app.use(express.static(path.resolve(__dirname,'frontend', "dist")))
    res.sendFile(path.resolve(__dirname,'frontend', "dist", "index.html"))

})
export { app }
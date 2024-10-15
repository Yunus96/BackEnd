import mongoose, {Schema} from "mongoose";

const analyticSchema = new Schema({
    day: {
        type: String,
    },
    age: {
        type: String,
    },
    gender: {
        type: String,
    }
})

export const Analytic = mongoose.model("Analytic", emailSchema)
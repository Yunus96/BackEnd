import mongoose, {Schema} from "mongoose";

const emailSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    from: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    short_description: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    }
})

export const Email = mongoose.model("Email", emailSchema)
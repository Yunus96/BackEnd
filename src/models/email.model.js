import mongoose, {Schema} from "mongoose";

const emailSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    read: {
        type: Boolean,
        required: true,
        default: false
    },
    unread: {
        type: Boolean,
        required: true,
        default: true
    },
    favourite: {
        type: Boolean,
        required: true,
        default: false
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
},
{
    timestamps: true
})

export const Email = mongoose.model("Email", emailSchema)
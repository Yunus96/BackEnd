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
        default: false
    },
    unread: {
        type: Boolean,
        default: true
    },
    favourite: {
        type: Boolean,
        default: false
    },
    name: {
        type: String
    },
    avatar: {
        type: String,
    }
},
{
    timestamps: true
})

export const Email = mongoose.model("Email", emailSchema)
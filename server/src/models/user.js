import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    user_type: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: "",
    },
    recent_viewed_posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Posts",
        },
    ],
},

    { timestamps: true }

)

const Users = mongoose.model("Users", usersSchema);

export default Users;
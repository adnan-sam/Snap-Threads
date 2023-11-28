import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    parentId: {
        type: String
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    likedBy: {
        type: [String], 
        default: [],
    },
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;

// Original Thread (Parent)
//     -> Thread Comment 1 (Children)
//     -> Thread Comment 2 (Children)
//     -> Thread Comment 3 (Children)
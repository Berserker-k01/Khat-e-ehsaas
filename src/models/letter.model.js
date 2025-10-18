// src/models/letter.model.js
const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Yeh tumhara awesome "sections" wala idea hai!
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [ // Hum yahan categories fix kar sakte hain
            'miss-me',
            'angry-at-me',
            'need-motivation',
            'feel-lonely',
            'just-because'
        ]
    },
    content: {
        text: { type: String, required: true },
        imageUrl: { type: String, default: null },
    },
    isOpened: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Letter = mongoose.model('Letter', letterSchema);

module.exports = Letter;
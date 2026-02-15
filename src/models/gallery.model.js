// src/models/gallery.model.js
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    uploaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        default: '',
    },
    // Pour stocker les likes/réactions
    isLiked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;

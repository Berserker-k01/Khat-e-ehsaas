// src/routes/gallery.routes.js
const express = require('express');
const { protectAPI } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
    uploadImage,
    getImages,
    deleteImage,
    toggleLike
} = require('../controllers/gallery.controller');

const router = express.Router();

// Upload une image (avec multer middleware)
router.post('/upload', protectAPI, upload.single('image'), uploadImage);

// Récupérer toutes les images du couple
router.get('/', protectAPI, getImages);

// Supprimer une image
router.delete('/:imageId', protectAPI, deleteImage);

// Liker/unliker une image
router.patch('/:imageId/like', protectAPI, toggleLike);

module.exports = router;

// src/controllers/gallery.controller.js
const Gallery = require('../models/gallery.model');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs');

// Créer/uploader une nouvelle image
const uploadImage = async (req, res) => {
    const { caption } = req.body;
    const uploaderId = req.user._id;

    try {
        const uploader = await User.findById(uploaderId);
        if (!uploader.partnerId) {
            return res.status(400).json({ message: "Vous devez être connecté(e) à un partenaire pour partager des images." });
        }

        // Vérifier qu'un fichier a été uploadé
        if (!req.file) {
            return res.status(400).json({ message: "Aucune image n'a été sélectionnée." });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const newImage = new Gallery({
            uploaderId,
            partnerId: uploader.partnerId,
            imageUrl,
            caption: caption || '',
        });

        await newImage.save();
        res.status(201).json({ message: "Image partagée avec succès!", image: newImage });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors du partage de l'image.", error: error.message });
    }
};

// Récupérer toutes les images du couple
const getImages = async (req, res) => {
    const userId = req.user._id;
    const partnerId = req.user.partnerId;

    if (!partnerId) return res.status(200).json([]);

    try {
        const images = await Gallery.find({
            $or: [
                { uploaderId: userId, partnerId: partnerId },
                { uploaderId: partnerId, partnerId: userId }
            ]
        })
            .populate('uploaderId', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des images.", error: error.message });
    }
};

// Supprimer une image
const deleteImage = async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user._id;

    try {
        const image = await Gallery.findById(imageId);

        if (!image) {
            return res.status(404).json({ message: "Image non trouvée." });
        }

        // Vérifier que l'utilisateur est bien l'auteur de l'image
        if (image.uploaderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Vous ne pouvez supprimer que vos propres images." });
        }

        // Supprimer le fichier physique
        const imagePath = path.join(__dirname, '../../public', image.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Gallery.findByIdAndDelete(imageId);
        res.status(200).json({ message: "Image supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression.", error: error.message });
    }
};

// Ajouter/retirer un like
const toggleLike = async (req, res) => {
    const { imageId } = req.params;

    try {
        const image = await Gallery.findById(imageId);
        if (!image) {
            return res.status(404).json({ message: "Image non trouvée." });
        }

        image.isLiked = !image.isLiked;
        await image.save();

        res.status(200).json({ message: "Like mis à jour.", isLiked: image.isLiked });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du like.", error: error.message });
    }
};

module.exports = { uploadImage, getImages, deleteImage, toggleLike };

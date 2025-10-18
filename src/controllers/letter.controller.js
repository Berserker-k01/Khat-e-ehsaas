const Letter = require('../models/letter.model');
const User = require('../models/user.model');

const createLetter = async (req, res) => {
    const { category, text } = req.body;
    const authorId = req.user._id;

    try {
        const author = await User.findById(authorId);
        if (!author.partnerId) {
            return res.status(400).json({ message: "You must be connected to a partner to send a letter." });
        }
        const newLetter = new Letter({
            authorId,
            recipientId: author.partnerId,
            category,
            content: { text }
        });
        await newLetter.save();
        res.status(201).json({ message: "Letter saved successfully!", letter: newLetter });
    } catch (error) {
        res.status(500).json({ message: "Error while creating letter.", error: error.message });
    }
};

const getLetters = async (req, res) => {
    const userId = req.user._id;
    const partnerId = req.user.partnerId;
    if (!partnerId) return res.status(200).json([]);
    try {
        const letters = await Letter.find({
            $or: [
                { authorId: userId, recipientId: partnerId },
                { authorId: partnerId, recipientId: userId }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(letters);
    } catch (error) {
        res.status(500).json({ message: "Error fetching letters.", error: error.message });
    }
};

module.exports = { createLetter, getLetters };
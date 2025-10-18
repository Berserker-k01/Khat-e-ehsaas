// src/controllers/auth.controller.js
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const signupUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    try {
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: "Username already taken." });
        }
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ 
            message: "User created successfully!",
            user: { id: newUser._id, username: newUser.username, connectionCode: newUser.connectionCode }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during signup.", error: error.message });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username: username.toLowerCase() });
        if (user && (await user.matchPassword(password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            
            // Partner ka data bhi populate karo agar hai toh
            await user.populate('partnerId', 'username');

            res.status(200).json({
                message: "Login successful!",
                user: {
                    id: user._id, // NOTE: Check karo aapke model mein 'id' hai ya '_id'
                    username: user.username,
                    connectionCode: user.connectionCode,
                    partnerId: user.partnerId ? user.partnerId._id : null,
                    partner: user.partnerId ? { username: user.partnerId.username } : null
                },
                token: token
            });
        } else {
            res.status(401).json({ message: "Invalid username or password." });
        }
    } catch (error) {
        res.status(500).json({ message: "Login mein kuch problem aa gayi.", error: error.message });
    }
};

const connectPartner = async (req, res) => {
    const { partnerCode } = req.body;
    const currentUser = req.user; // Yeh protectAPI middleware se aata hai
    const { io, onlineUsers } = req; // Yeh app.js se middleware ke through aata hai

    try {
        const partner = await User.findOne({ connectionCode: partnerCode.toUpperCase() });
        if (!partner) return res.status(404).json({ message: "Partner not found with this code." });
        if (currentUser.id === partner.id) return res.status(400).json({ message: "You cannot connect with yourself." });
        if (currentUser.partnerId || partner.partnerId) return res.status(400).json({ message: "One of you is already connected." });

        // Dono ko connect karo
        currentUser.partnerId = partner._id;
        partner.partnerId = currentUser._id;
        await currentUser.save();
        await partner.save();
        
        // Dono users ka updated data (partner ke naam ke saath) fetch karo
        const updatedUserA = await User.findById(currentUser._id).populate('partnerId', 'username');
        const updatedUserB = await User.findById(partner._id).populate('partnerId', 'username');
        
        // ** YEH HAI AUTOMATIC CONNECTION KA LOGIC **
        // User B (jo connect hua hai) ko real-time update bhejo
        const partnerSocketId = onlineUsers.get(partner._id.toString());
        if (partnerSocketId) {
            io.to(partnerSocketId).emit('partnerConnected', {
                message: `${currentUser.username} has connected with you!`,
                // Hum User B ka poora updated object bhej rahe hain
                partner: updatedUserB
            });
        }
        
        // User A (jisne code daala) ko normal HTTP response bhejo
        res.status(200).json({
            message: "Connection successful!",
            user: updatedUserA // User A ka updated object
        });
    } catch (error) {
        res.status(500).json({ message: "Connection error.", error: error.message });
    }
};

// Yeh function dashboard.js ko partner ka naam dikhane mein help karta hai
const getPartnerDetails = async (req, res) => {
    try {
        const partner = await User.findById(req.params.id).select('username');
        if (!partner) {
            return res.status(404).json({ message: 'Partner not found' });
        }
        res.status(200).json({ partner });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { signupUser, loginUser, connectPartner, getPartnerDetails };
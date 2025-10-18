// src/routes/auth.routes.js
const express = require('express');
const { protectAPI } = require('../middleware/auth.middleware');
const { 
    signupUser, 
    loginUser, 
    connectPartner, 
    getPartnerDetails // Yeh zaroori hai
} = require('../controllers/auth.controller');
const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/connect', protectAPI, connectPartner);

// Yeh route dashboard.js ko partner ka naam fetch karne mein help karta hai
router.get('/partner/:id', protectAPI, getPartnerDetails);

module.exports = router;
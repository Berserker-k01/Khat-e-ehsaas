const express = require('express');
const router = express.Router();
const { protectAPI } = require('../middleware/auth.middleware');
const { createLetter, getLetters } = require('../controllers/letter.controller');

router.post('/new', protectAPI, createLetter);
router.get('/', protectAPI, getLetters);

module.exports = router;
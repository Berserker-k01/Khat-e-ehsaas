const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('signup', { title: 'Join the Connection' });
});
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Join the Connection' });
});
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login to Continue' });
});
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Your Dashboard' });
});
router.get('/letters', (req, res) => {
    res.render('letters', { title: 'Your Letters' });
});
router.get('/write-letter', (req, res) => {
    res.render('write-letter', { title: 'Write a New Letter' });
});

module.exports = router;
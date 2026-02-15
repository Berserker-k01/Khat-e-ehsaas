const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('signup', { title: 'Rejoignez la Connexion' });
});
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Rejoignez la Connexion' });
});
router.get('/login', (req, res) => {
    res.render('login', { title: 'Connexion' });
});
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Votre Tableau de bord' });
});
router.get('/letters', (req, res) => {
    res.render('letters', { title: 'Vos Lettres' });
});
router.get('/write-letter', (req, res) => {
    res.render('write-letter', { title: 'Écrire une Lettre' });
});
router.get('/gallery', (req, res) => {
    res.render('gallery', { title: 'Notre Galerie' });
});

module.exports = router;
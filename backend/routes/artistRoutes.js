const express = require('express');
const router = express.Router();
const { protect, admin, organizer } = require('../middleware/auth');
const { createArtist, getAllArtists, uploadArtistImage, updateArtist, deleteArtist, rateArtist, aiSearchArtist } = require('../controllers/artistController');

router.post('/upload', protect, admin, uploadArtistImage);
router.post('/', protect, admin, createArtist);
router.get('/', getAllArtists);
router.get('/ai-search', protect, organizer, aiSearchArtist);
router.put('/:id', protect, admin, updateArtist);
router.delete('/:id', protect, admin, deleteArtist);
router.post('/:id/rate', protect, rateArtist);

module.exports = router;

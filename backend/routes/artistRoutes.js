const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { protect, admin, organizer } = require('../middleware/auth');
const { createArtist, getAllArtists, uploadArtistImage, updateArtist, deleteArtist, rateArtist, aiSearchArtist } = require('../controllers/artistController');
=======
const { protect, admin } = require('../middleware/auth');
const { createArtist, getAllArtists, uploadArtistImage, updateArtist, deleteArtist, rateArtist } = require('../controllers/artistController');
>>>>>>> hasini_dev

router.post('/upload', protect, admin, uploadArtistImage);
router.post('/', protect, admin, createArtist);
router.get('/', getAllArtists);
<<<<<<< HEAD
router.get('/ai-search', protect, organizer, aiSearchArtist);
=======
>>>>>>> hasini_dev
router.put('/:id', protect, admin, updateArtist);
router.delete('/:id', protect, admin, deleteArtist);
router.post('/:id/rate', protect, rateArtist);

module.exports = router;

const Artist = require('../models/Artist');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the directory exists
const uploadDir = path.join(__dirname, '../../frontend/src/pages/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'artist-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('image');

exports.uploadArtistImage = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return just the filename since they will be served from /pages/images statically
    res.json({ filename: req.file.filename });
  });
};

exports.createArtist = async (req, res) => {
  try {
    const { name, contactNumber, image, songs } = req.body;

    if (!name || !contactNumber || !image) {
      return res.status(400).json({ message: 'Name, contact number, and image are required' });
    }

    const artist = await Artist.create({
      name,
      contactNumber,
      image,
      songs: songs || []
    });

    res.status(201).json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find({}).sort('-createdAt');
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateArtist = async (req, res) => {
  try {
    const { name, contactNumber, image, songs } = req.body;
    const artist = await Artist.findById(req.params.id);

    if (artist) {
      artist.name = name || artist.name;
      artist.contactNumber = contactNumber || artist.contactNumber;
      artist.image = image || artist.image;
      artist.songs = songs || artist.songs;

      const updatedArtist = await artist.save();
      res.json(updatedArtist);
    } else {
      res.status(404).json({ message: 'Artist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);

    if (artist) {
      await artist.deleteOne();
      res.json({ message: 'Artist removed' });
    } else {
      res.status(404).json({ message: 'Artist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rateArtist = async (req, res) => {
  try {
    const { rating } = req.body;
    const artist = await Artist.findById(req.params.id);

    if (artist) {
      const alreadyRated = artist.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyRated) {
        alreadyRated.val = rating;
      } else {
        artist.ratings.push({
          user: req.user._id,
          val: rating
        });
      }

      artist.averageRating =
        artist.ratings.reduce((acc, item) => item.val + acc, 0) / artist.ratings.length;

      await artist.save();
      res.status(201).json(artist);
    } else {
      res.status(404).json({ message: 'Artist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

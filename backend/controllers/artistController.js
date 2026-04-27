const Artist = require('../models/Artist');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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
    const { summary } = req.query;
    let query = Artist.find({});
    
    if (summary === 'true') {
      // Exclude ratings array but include its count using a virtual or projection
      // In this case, we'll manually map it or use a projection if possible.
      // Since it's an array, we can't easily get the length in select() without aggregation.
      // So we'll fetch it but map it to keep the response small.
      const artists = await Artist.find({}).select('-ratings').lean().sort('-createdAt');
      
      // If we want the count, we need to handle it. 
      // For now, let's just use lean() and select() to minimize data.
      // Most pages only use averageRating anyway.
      res.json(artists);
      return;
    }

    const artists = await query.lean().sort('-createdAt');
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
    const ratingValue = Number(rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const artist = await Artist.findById(req.params.id);

    if (artist) {
      const alreadyRated = artist.ratings.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyRated) {
        alreadyRated.val = ratingValue;
      } else {
        artist.ratings.push({
          user: req.user._id,
          val: ratingValue
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

exports.aiSearchArtist = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Artist name is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is not configured.' });
    }

    // Using the verified working model name
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Search for artist details for the name: "${name}". 
    Provide the information in the following JSON format:
    {
      "name": "Artist Name",
      "contactNumber": "A hypothetical or general contact number if available, otherwise 'Not available'",
      "songs": ["Song 1", "Song 2", "Song 3"],
      "description": "Short bio"
    }
    Only return the JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the text response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ message: 'Failed to parse AI response' });
    }
    
    const artistDetails = JSON.parse(jsonMatch[0]);
    res.json(artistDetails);
  } catch (error) {
    console.error('AI Search Error:', error);
    res.status(500).json({ 
      message: 'AI search failed', 
      details: error.message
    });
  }
};

exports.getArtistAnalytics = async (req, res) => {
  try {
    // Use MongoDB aggregation for heavy analytical processing
    const artistsAnalytics = await Artist.aggregate([
      {
        $project: {
          name: 1,
          image: 1,
          averageRating: 1,
          totalVotes: { $size: "$ratings" },
          ratingBreakdown: {
            $arrayToObject: {
              $map: {
                input: [1, 2, 3, 4, 5],
                as: "star",
                in: {
                  k: { $toString: "$$star" },
                  v: {
                    $size: {
                      $filter: {
                        input: "$ratings",
                        as: "r",
                        cond: { $eq: ["$$r.val", "$$star"] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $sort: { averageRating: -1 } }
    ]);

    const totalArtists = artistsAnalytics.length;
    const totalRatings = artistsAnalytics.reduce((sum, a) => sum + a.totalVotes, 0);
    const topArtist = artistsAnalytics.length > 0 ? artistsAnalytics[0] : null;

    res.json({
      summary: { 
        totalArtists, 
        totalRatings, 
        topArtist: topArtist ? { name: topArtist.name, averageRating: topArtist.averageRating } : null 
      },
      artists: artistsAnalytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

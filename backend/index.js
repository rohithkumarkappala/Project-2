import express from 'express';
import mongoose from 'mongoose';
import MainSchema from './models/user.model.js';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Clarifai from 'clarifai';

dotenv.config();

const app = express();
const port = 6969;

// Update CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// mongoose.connect(process.env.MONGO, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 50000,
//   socketTimeoutMS: 45000,
// }).then(() => {
//   console.log('Connected to MongoDB')
// }).catch((err) => {
//   console.log(err)
// });

// dotenv.config(); // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Atlas Connected!");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

connectDB();



// const clarifaiApp = new Clarifai.App({
//   apiKey: "e9efa0d0c6864a698e22dfa77ec3148e", // Replace with your Clarifai API Key
//   });
  
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       const uploadPath = '/tmp'; // Writable directory in serverless environments
//       cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
//   });
  
// const upload = multer({ storage });
function calculateDistance(lat1, lon1, lat2, lon2) {
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return null;
  }

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
}

app.get('/restaurants-by-cuisine', async (req, res) => {
  try {
    const { cuisine, page = 1, limit = 6, latitude, longitude, maxDistance = 50 } = req.query;

    if (!cuisine) {
      return res.status(400).json({ message: 'Cuisine query parameter is required.' });
    }

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Base pipeline
    const pipeline = [
      { $unwind: "$restaurants" },
      {
        $match: {
          "restaurants.restaurant.cuisines": { 
            $regex: new RegExp(cuisine, 'i') 
          }
        }
      },
      {
        $project: {
          _id: 0,
          id: "$restaurants.restaurant.id",
          name: "$restaurants.restaurant.name",
          cuisines: "$restaurants.restaurant.cuisines",
          location: "$restaurants.restaurant.location",
          user_rating: "$restaurants.restaurant.user_rating",
          featured_image: "$restaurants.restaurant.featured_image",
        }
      }
    ];

    // Get all matching documents first
    const documents = await MainSchema.aggregate(pipeline);

    // Calculate distances in JavaScript instead of MongoDB
    let result = documents.map(doc => {
      let distance = null;
      if (latitude && longitude && doc.location?.latitude && doc.location?.longitude) {
        distance = calculateDistance(
          latitude,
          longitude,
          doc.location.latitude,
          doc.location.longitude
        );
      }
      return { ...doc, distance };
    });

    // Apply distance filtering if coordinates are provided
    if (latitude && longitude) {
      result = result.filter(restaurant => 
        restaurant.distance !== null && 
        restaurant.distance <= parseFloat(maxDistance)
      );
      result.sort((a, b) => a.distance - b.distance);
    }

    // Get total before pagination
    const total = result.length;

    // Apply pagination
    const paginatedResult = result.slice(skip, skip + pageSize);

    if (paginatedResult.length === 0) {
      return res.status(404).json({ 
        message: latitude && longitude 
          ?` No restaurants found within ${maxDistance}km of your location` 
          : 'No restaurants found for the given cuisine'
      });
    }

    return res.status(200).json({
      total_results: total,
      current_page: pageNumber,
      total_pages: Math.ceil(total / pageSize),
      data: paginatedResult
    });

  } catch (err) {
    console.error('Error fetching restaurants:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/restaurant/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await MainSchema.aggregate([
      { $unwind: "$restaurants" },
      {
        $match: {
          "restaurants.restaurant.id": id
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    return res.status(200).json(result[0].restaurants.restaurant);
  } catch (err) {
    console.error('Error fetching restaurant details:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

const parseFilters = (req, res, next) => {
  try {
    const filters = {};
    
    // Parse price range
    if (req.query.priceRange) {
      filters.priceRange = req.query.priceRange.split(',').map(Number);
    }

    // Parse rating
    if (req.query.rating) {
      filters.minRating = parseFloat(req.query.rating);
    }

    // Store parsed filters in request object
    req.filters = filters;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid filter parameters" });
  }
};

// Middleware to build MongoDB query from filters
const buildQuery = (req, res, next) => {
  try {
    const queryObj = {};

    if (req.filters) {
      // Add price range filter
      if (req.filters.priceRange) {
        queryObj['restaurants.restaurant.price_range'] = {
          $gte: req.filters.priceRange[0],
          $lte: req.filters.priceRange[1]
        };
      }

      // Add rating filter
      if (req.filters.minRating) {
        queryObj['restaurants.restaurant.user_rating.aggregate_rating'] = {
          $gte: req.filters.minRating
        };
      }
    }

    // Store the built query in request object
    req.queryObj = queryObj;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Error building query" });
  }
};





// Initialize Clarifai
const clarifaiApp = new Clarifai.App({
  apiKey: "e9efa0d0c6864a698e22dfa77ec3148e", // Replace with your Clarifai API Key
});

// **Multer Memory Storage (No Disk)**
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/api/analyze-image",
  upload.single("image"),
  parseFilters,
  buildQuery,  
  async (req, res) => {
    try {
      console.log("Received request for image analysis");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded."
        });
      }

      console.log("File uploaded in memory:", req.file);

      // Convert image buffer to Base64
      const imageBase64 = req.file.buffer.toString("base64");

      console.log("Image converted to Base64");

      // Send image to Clarifai API
      const clarifaiResponse = await clarifaiApp.models.predict(
        Clarifai.FOOD_MODEL,
        { base64: imageBase64 }
      );

      console.log("Clarifai response received:", clarifaiResponse);

      if (!clarifaiResponse.outputs || clarifaiResponse.outputs.length === 0) {
        throw new Error("Invalid response from Clarifai API");
      }

      // Define cuisine-related terms
      const cuisineTerms = {
        'pizza': true, 'sushi': true, 'burger': true, 'pasta': true,
        'chinese': true, 'indian': true, 'mexican': true, 'italian': true,
        'thai': true, 'japanese': true
      };

      // Extract most relevant cuisine tag
      const searchTags = clarifaiResponse.outputs[0].data.concepts
        .filter(concept => concept.value > 0.85)
        .filter(concept => {
          const nonCuisineTerms = [
            'dish', 'food', 'meal', 'plate', 'dinner', 'lunch', 'breakfast',
            'sauce', 'cheese', 'vegetable', 'meat', 'dough', 'crust', 'pie',
            'pastry', 'frozen', 'ham', 'ingredient', 'tomato', 'salami',
            'pepperoni', 'mozzarella'
          ];
          return !nonCuisineTerms.includes(concept.name.toLowerCase()) &&
            (cuisineTerms[concept.name.toLowerCase()] || false);
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 1)
        .map(concept => concept.name);

      if (searchTags.length === 0) {
        const dishTag = clarifaiResponse.outputs[0].data.concepts
          .filter(concept => concept.value > 0.95)
          .sort((a, b) => b.value - a.value)
          .slice(0, 1)
          .map(concept => concept.name);
        
        searchTags.push(dishTag[0]);
      }

      const searchConditions = searchTags.flatMap(tag => [
        { "restaurants.restaurant.cuisines": { $regex: tag, $options: "i" } },
        { "restaurants.restaurant.name": { $regex: tag, $options: "i" } }
      ]);

      // ✅ Fix: Ensure queryObj is properly initialized before usage
// ✅ Ensure filters are applied along with cuisine-based search
let queryObj = req.queryObj || {}; 

const finalQuery = {
  $and: [
    queryObj, // Apply price & rating filters
    { $or: searchConditions } // Match detected cuisine
  ]
};

const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

// Retrieve restaurants matching the cuisine and filters
const result = await MainSchema.aggregate([
  { $unwind: "$restaurants" },
  { $match: finalQuery },
  { $skip: skip },
  { $limit: limit }
]);

console.log("Query executed successfully", result);

// Get total count for pagination
const total = await MainSchema.aggregate([
  { $unwind: "$restaurants" },
  { $match: finalQuery },
  { $count: "total" }
]);

if (result.length > 0) {
  res.json({
    success: true,
    searchTags,
    result: result.map(r => r.restaurants.restaurant),
    totalPages: Math.ceil((total[0]?.total || 0) / limit),
    currentPage: page
  });
} else {
  res.json({
    success: false,
    searchTags,
    message: "No restaurants found matching the image"
  });
}


    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({
        success: false,
        message: "Image processing failed.",
        error: error.message
      });
    }
  }
);




// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



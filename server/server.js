// Package Imports
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import {v2 as cloudinary} from 'cloudinary';
import multer from 'multer';

// Schema Imports
import Photo from "./schemas/PhotoSchema.js";

// Environment Variables
dotenv.config();
const PORT = process.env.PORT || 3003;

// NODE JS SERVER SETUP ##################################################
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.mongodb.net/db?retryWrites=true&w=majority`
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB successfully");
});

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Temporary memory storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.send('Yup, we are up and running :)');
});

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  try {
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${req.file.buffer.toString('base64')}`, {
      folder: "demo",
      upload_preset: 'ml_default'
    });
    const photo = new Photo({ url: result.url });
    await photo.save();
    res.status(201).json(photo);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to upload image", error });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) res.status(404).json({ message: "Photo not found" });
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Package Imports
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Schema Imports
import Invite from "./schemas/InviteSchema.js";
import Photo from "./schemas/PhotoSchema.js";
import Registry from "./schemas/RegistrySchema.js";
import Vendors from "./schemas/VendorsSchema.js";

// Environment Variables
dotenv.config();
const PORT = process.env.PORT || 3003;

// ############################### NODE JS SERVER SETUP ###############################
const app = express();
app.use(express.json());

const allowedOrigins = ['http://localhost:3000', 'https://nick-and-tash-wedding.web.app'];
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('The CORS policy for this site does not allow access from the specified origin.'), false);
    }
    return callback(null, true);
  }
}));

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.mongodb.net/db?retryWrites=true&w=majority`
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB successfully");
});

// Connect to Cloudinary (store images and retrieve URLs)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Temporary memory storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Used for security purposes
// const verifyToken = (adminRequired = false) => (req, res, next) => {
//   const token = req.headers.authorization;
//   if (!token) return res.status(401).json({ message: "Unauthorized: Token not provided." });

//   jwt.verify(token, SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized: Invalid token." });
//     }

//     if (adminRequired && !decoded.isAdmin) {
//       return res.status(403).json({ message: "Access denied: Admin privileges required!" });
//     }

//     req.user = decoded;
//     next();
//   });
// };

// Routes
app.get('/', (req, res) => {
  res.send('Yup, we are up and running :)');
});

// ############################### Security Routes ###############################
app.get('/api/check-invite/:id', async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) {
      res.json({ isValid: false });
    } else {
      res.json({ isValid: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking invite validity", error });
  }
});


/* 
  TODO: Add security to all routes by verifying they are:
    1. Admin
    2. Invited guests
*/
// ############################### Invite/RSVP Routes ###############################
app.get('/api/all-invites', async (req, res) => {
  try {
    const allInvites = await Invite.find();
    res.json(allInvites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/invites/:id', async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    res.json(invite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/invites/:id', async (req, res) => {
  const { id } = req.params;
  const { guests } = req.body;

  try {
    const updatedInvite = await Invite.findByIdAndUpdate(
      id,
      { $set: { guests: guests, hasRSVPd: true, givenPlusOne: false } },
      { new: true }
    );
    if (!updatedInvite) return res.status(404).json({ message: "Invite not found. Failed to update invite." });
    res.json(updatedInvite);
  } catch (error) {
    res.status(400).json({ message: "Failed to update invite", error });
  }
});

app.post('/api/invites', async (req, res) => {
  const { guests, givenPlusOne } = req.body;
  const invite = new Invite({
    guests: guests,
    givenPlusOne: givenPlusOne,
    hasRSVPd: false
  });

  try {
    const newInvite = await invite.save();
    res.status(201).json(newInvite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/invites/:id', async (req, res) => {
  try {
    const invite = await Invite.findByIdAndDelete(req.params.id);
    if (!invite) return res.status(404).json({ message: "Invite not found" });
    res.status(200).json({ message: "Invite deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ############################### Photo Routes ###############################
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload-photo', upload.single('file'), async (req, res) => {
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

// ############################### Registry Routes ###############################
app.get('/api/registry', async (req, res) => {
  try {
    const items = await Registry.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/registry', async (req, res) => {
  const { item, isBought } = req.body;
  const newItem = new Registry({ item, isBought });

  try {
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: "Failed to add item to registry", error });
  }
});

app.put('/api/registry/:item', async (req, res) => {
  const { item } = req.params;
  const { isBought } = req.body;

  try {
    const updatedItem = await Registry.findOneAndUpdate({ item: item }, { isBought }, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: "Registry item not found. Failed to update item." });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: "Failed to update registry item", error });
  }
});

app.delete('/api/registry/:item', async (req, res) => {
  const { item } = req.params;

  try {
    const deletedItem = await Registry.findOneAndDelete({ item: item });
    if (!deletedItem) {
      return res.status(404).json({ message: "Registry item not found. Failed to delete item." });
    }
    res.status(200).json({ message: "Registry item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ############################### Vendor Routes ###############################
app.get('/api/vendors', async (req, res) => {
  try {
    const items = await Vendors.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  const { role, name } = req.body;
  const newVendor = new Vendors({ role, name });

  try {
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(400).json({ message: "Failed to add Vendor to database", error });
  }
});

app.put('/api/vendors/:previousName', async (req, res) => {
  const { previousName } = req.params;
  const { name, role } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;

    const updatedVendor = await Vendors.findOneAndUpdate(
      { name: previousName },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found. Failed to update vendor." });
    }
    res.json(updatedVendor);
  } catch (error) {
    res.status(400).json({ message: "Failed to update vendor.", error });
  }
});

app.delete('/api/vendors/:role', async (req, res) => {
  const { role } = req.params;

  try {
    const deletedVendor = await Vendors.findOneAndDelete({ role: role });
    if (!deletedVendor) {
      return res.status(404).json({ message: "Vendor not found. Failed to delete vendor." });
    }
    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

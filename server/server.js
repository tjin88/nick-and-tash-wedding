// Package Imports
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Server } from 'socket.io';
import http from 'http';
import ics from 'ics';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// Schema Imports
import { Invite, Event, WEDDING_LOCATIONS, RSVP_STATUSES } from "./schemas/InviteSchema.js";
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

// ############################### Event Routes ###############################
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/events/:location', async (req, res) => {
  try {
    const events = await Event.find({ location: req.params.location });
    if (!events || !events.length) return res.status(404).json({ message: "No events found for this location" });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  const eventData = req.body;
  const event = new Event(eventData);

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
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

app.get('/api/rsvp-summary', async (req, res) => {
  try {
    const allInvites = await Invite.find();
    
    const summary = {
      Yes: [],
      No: [],
      "Not Responded": []
    };
    
    allInvites.forEach(invite => {
      if (!invite.hasRSVPd) {
        invite.guests.forEach(guest => {
          const fullName = guest.lastName 
            ? `${guest.firstName} ${guest.lastName}` 
            : guest.firstName;

          const guestInfo = {
            name: fullName,
            inviteId: invite._id,
            status: guest.attendingStatus,
            location: invite.invitedLocation
          };
          
          summary["Not Responded"].push(guestInfo);
        });
      } else {
        invite.guests.forEach(guest => {
          const fullName = guest.lastName 
            ? `${guest.firstName} ${guest.lastName}` 
            : guest.firstName;
          
          const guestInfo = {
            name: fullName,
            inviteId: invite._id,
            status: guest.attendingStatus,
            location: invite.invitedLocation
          };
          
          if (guest.attendingStatus === RSVP_STATUSES.NOT_ATTENDING) {
            summary.No.push(guestInfo);
          } else if (
            guest.attendingStatus === RSVP_STATUSES.CANADA || 
            guest.attendingStatus === RSVP_STATUSES.AUSTRALIA || 
            guest.attendingStatus === RSVP_STATUSES.BOTH
          ) {
            summary.Yes.push(guestInfo);
          } else {
            // Edge case (If some person's status is PENDING but hasRSVPd is true)
            summary["Not Responded"].push(guestInfo);
          }
        });
      }
    });
    
    // Could sort the lists alphabetically by name if desired?
    // ['Yes', 'No', 'Not Responded'].forEach(category => {
    //   summary[category].sort((a, b) => a.name.localeCompare(b.name));
    // });
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error generating RSVP summary", error });
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
  const { guests, invitedLocation, numGuestsOnBus, numGuestsMorningBreakfast, guestAccommodationAddress, guestAccommodationLocalName } = req.body;

  try {
    // Validate RSVP status for each guest
    const invite = await Invite.findById(id);
    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    // Validate each guest's RSVP status
    for (const guest of guests) {
      if (!invite.isValidRSVPStatus(guest.attendingStatus)) {
        return res.status(400).json({
          message: `Invalid RSVP status for ${guest.firstName}. They can only RSVP to events they're invited to.`
        });
      }
    }

    const shouldResetPlusOne = guests.length > invite.guests.length;

    // Prepare update object
    const updateData = {
      guests,
      hasRSVPd: true,
      rsvpSubmittedAt: new Date(),
      invitedLocation,
      givenPlusOne: shouldResetPlusOne ? false : invite.givenPlusOne
    };

    // Only update bus and breakfast fields if they are provided in the request
    if (numGuestsOnBus !== undefined) {
      updateData.numGuestsOnBus = numGuestsOnBus;
    }
    if (numGuestsMorningBreakfast !== undefined) {
      updateData.numGuestsMorningBreakfast = numGuestsMorningBreakfast;
    }
    if (guestAccommodationAddress !== undefined) {
      updateData.guestAccommodationAddress = guestAccommodationAddress;
    }
    if (guestAccommodationLocalName !== undefined) {
      updateData.guestAccommodationLocalName = guestAccommodationLocalName;
    }

    const updatedInvite = await Invite.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.json(updatedInvite);
  } catch (error) {
    res.status(400).json({ message: "Failed to update invite", error });
  }
});

// app.put('/api/invites/update-invite/:id', async (req, res) => {
//   const { id } = req.params;
//   const { guests, invitedLocation, givenPlusOne } = req.body;

//   try {
//     const invite = await Invite.findById(id);
//     if (!invite) {
//       return res.status(404).json({ message: "Invite not found" });
//     }

//     const updatedInvite = await Invite.findByIdAndUpdate(
//       id,
//       { 
//         $set: { 
//           guests,
//           hasRSVPd: invite.hasRSVPd,
//           rsvpSubmittedAt: new Date(),
//           invitedLocation,
//           givenPlusOne: givenPlusOne ? givenPlusOne : invite.givenPlusOne
//         }
//       },
//       { new: true }
//     );

//     res.json(updatedInvite);
//   } catch (error) {
//     res.status(400).json({ message: "Failed to update invite", error });
//   }
// });

app.post('/api/invites', async (req, res) => {
  // const { guests, givenPlusOne, invitedLocation, rsvpDeadline } = req.body;
  const { guests, givenPlusOne, invitedLocation } = req.body;

  const invite = new Invite({
    guests,
    givenPlusOne,
    invitedLocation,
    // rsvpDeadline,
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
    const location = req.query.location;
    const query = location ? { location } : {};
    const photos = location === "Both Australia and Canada" ? await Photo.find() : await Photo.find(query);
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/upload-photos', upload.array('files', 200), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }
  if (req.files.length > 200) {
    return res.status(400).json({ message: "You can only upload up to 200 files at a time." });
  }
  
  try {
    const now = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const month = monthNames[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    
    // Convert to 12-hour format
    let hour = now.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // 0 should be 12
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const username = req.body.username || 'user';
    
    // Helper function to determine file type and MIME type
    const getFileInfo = (file) => {
      const mimeType = file.mimetype;
      const isVideo = mimeType.startsWith('video/');
      const isImage = mimeType.startsWith('image/');
      
      if (!isVideo && !isImage) {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
      
      return {
        isVideo,
        isImage,
        mimeType,
        dataUrl: `data:${mimeType};base64,${file.buffer.toString('base64')}`
      };
    };
    
    const uploadPromises = req.files.map(async (file, index) => {
      try {
        // Get file information
        const fileInfo = getFileInfo(file);
        
        // Create unique ID
        const uniqueId = `nnjin_wedding_${month}_${day}_${year}_${hour}-${minute}-${second}-${ampm}_${username}_${index + 1}`;
        
        // Configure upload options based on file type
        const uploadOptions = {
          folder: "demo",
          upload_preset: 'ml_default',
          public_id: uniqueId
        };
        
        // Add resource_type for videos
        if (fileInfo.isVideo) {
          uploadOptions.resource_type = 'video';
        }
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(fileInfo.dataUrl, uploadOptions);
        
        // Save to database (you might want to create a separate model for videos)
        const mediaItem = new Photo({ 
          url: result.url, 
          location: req.body.location || '',
          mediaType: fileInfo.isVideo ? 'video' : 'image', // Add this field to your schema
          uploadedAt: new Date()
        });
        
        await mediaItem.save();
        return mediaItem;
        
      } catch (fileError) {
        console.error(`Error processing file ${index + 1}:`, fileError);
        throw new Error(`Failed to process file ${index + 1}: ${fileError.message}`);
      }
    });

    const savedMedia = await Promise.all(uploadPromises);
    
    // Emit updates for real-time functionality
    savedMedia.forEach(item => {
      io.emit('photo-updated', { 
        url: item.url, 
        location: item.location,
        mediaType: item.mediaType 
      });
    });

    res.status(201).json({ 
      message: `Successfully uploaded ${savedMedia.length} files`,
      media: savedMedia 
    });
    
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ 
      message: "Failed to upload files", 
      error: error.message 
    });
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
    io.emit('registry-item-added', { key: newItem.item, isBought: newItem.isBought });
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
    io.emit('registry-updated', { key: item, isBought: isBought });
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
    io.emit('registry-item-deleted', item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ############################### Vendor Routes ###############################
app.get('/api/vendors', async (req, res) => {
  try {
    const location = req.query.location;
    const query = location ? { location } : {};
    const vendors = await Vendors.find(query);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/vendors', async (req, res) => {
  const { role, name, location, contact } = req.body;
  const newVendor = new Vendors({ 
    role, 
    name, 
    location,
    contact 
  });

  try {
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(400).json({ message: "Failed to add Vendor to database", error });
  }
});

app.put('/api/vendors/:previousName', async (req, res) => {
  const { previousName } = req.params;
  const { role, name, location, contact } = req.body;

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (location) updateData.location = location;
    if (contact) updateData.contact = contact;

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

// This is currently for Canada only!
app.get('/api/download-ics/:id', async (req, res) => {
  try {
    const invite = await Invite.findById(req.params.id);
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    // TODO: This sometimes shows up as 5 - 12, and sometimes 1 - 8 ...
    const eventObj = {
      start_datetime: "2025-08-23 22:00:00",
      end_datetime: "2025-08-24 00:00:00",
      location: "Sheraton Parkway Toronto North Hotel & Suites, 600 Hwy 7, Richmond Hill, ON L4B 1B2",
      eventName: "Nicholas & Natasha's Wedding",
      description: "Join us to celebrate Nicholas and Natasha's Wedding Reception!\n\nLink to invite: https://nick-and-tash-wedding.web.app/invite/" + invite._id,
    };

    // Convert start and end datetime to UTC format for ICS
    const start = format(new Date(eventObj.start_datetime), "yyyyMMdd'T'HHmmss'Z'");
    const end = format(new Date(eventObj.end_datetime), "yyyyMMdd'T'HHmmss'Z'");
    const dtstamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'"); // current UTC timestamp

    const uid = uuidv4(); // Generate unique UID for the event

    // Define the ICS data
    const event = {
      start: [2025, 8, 23, 21, 0],  // 5 PM EST = 21:00 UTC
      end: [2025, 8, 24, 4, 0],     // 12 AM EST = 04:00 UTC next day
      title: eventObj.eventName,
      description: eventObj.description,
      location: eventObj.location,
      url: `https://nick-and-tash-wedding.web.app/invite/${invite._id}`,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      transp: 'OPAQUE',
      alarms: [
        {
          action: 'display',
          trigger: { minutes: -120 }, // 2 hours before the event
          description: `Reminder: ${eventObj.eventName}`
        }
      ],
      uid: uid,
      // dtstamp: dtstamp
    };

    // Generate the ICS file content
    ics.createEvent(event, (error, value) => {
      if (error) {
        return res.status(500).json({ message: "Error generating ICS file", error });
      }

      // Set headers to download the ICS file
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="nick-and-tash-canada-wedding.ics"');
      res.send(value);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TODO: Re-adjust this for Australia!
app.get('/api/download-australia-ics/', async (req, res) => {
  try {
    const eventObj = {
      start_datetime: "2025-10-11 15:00:00", // 3 PM AEST
      end_datetime: "2025-10-11 23:00:00",   // 11 PM AEST
      location: "Tiffany's Maleny, 409 Mountain View Road, Maleny QLD 4552",
      eventName: "Nicholas & Natasha's 🇦🇺 Wedding",
      description: "Join us to celebrate Nicholas and Natasha's Wedding!",
    };

    // Convert start and end datetime to UTC format for ICS
    // AEST is UTC+10
    const start = format(new Date(eventObj.start_datetime), "yyyyMMdd'T'HHmmss'Z'");
    const end = format(new Date(eventObj.end_datetime), "yyyyMMdd'T'HHmmss'Z'");
    const dtstamp = format(new Date(), "yyyyMMdd'T'HHmmss'Z'"); // current UTC timestamp

    const uid = uuidv4(); // Generate unique UID for the event

    // Define the ICS data
    // Note: Times need to be in UTC
    // 3 PM AEST = 05:00 UTC
    // 11 PM AEST = 13:00 UTC
    const event = {
      start: [2025, 10, 11, 5, 0],    // 3 PM AEST = 05:00 UTC
      end: [2025, 10, 11, 13, 0],     // 11 PM AEST = 13:00 UTC
      title: eventObj.eventName,
      description: eventObj.description,
      location: eventObj.location,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      transp: 'OPAQUE',
      alarms: [
        {
          action: 'display',
          trigger: { minutes: -120 }, // 2 hours before the event
          description: `Reminder: ${eventObj.eventName}`
        }
      ],
      uid: uid,
      // dtstamp: dtstamp
    };

    // Generate the ICS file content
    ics.createEvent(event, (error, value) => {
      if (error) {
        return res.status(500).json({ message: "Error generating ICS file", error });
      }

      // Set headers to download the ICS file
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename="nick-and-tash-australia-wedding.ics"');
      res.send(value);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://nick-and-tash-wedding.web.app', 'http://localhost:3000'],
    methods: ["GET", "POST"],
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

import mongoose from 'mongoose';
import { WEDDING_LOCATIONS } from "./InviteSchema.js";

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  jpgUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    enum: [WEDDING_LOCATIONS.CANADA, WEDDING_LOCATIONS.AUSTRALIA, WEDDING_LOCATIONS.BOTH],
    default: WEDDING_LOCATIONS.CANADA,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true,
    default: "Guest"
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    required: true
  }
});

export default mongoose.model('Photo', photoSchema);
import mongoose from 'mongoose';
import { WEDDING_LOCATIONS } from "./InviteSchema.js";

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  location: {
    type: String,
    enum: [WEDDING_LOCATIONS.CANADA, WEDDING_LOCATIONS.AUSTRALIA],
    default: WEDDING_LOCATIONS.BOTH,
    required: true
  }
});

export default mongoose.model('Photo', photoSchema);
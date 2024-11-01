import mongoose from 'mongoose';
import { WEDDING_LOCATIONS } from "./InviteSchema.js";

const vendorsSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    enum: [WEDDING_LOCATIONS.CANADA, WEDDING_LOCATIONS.AUSTRALIA, WEDDING_LOCATIONS.BOTH],
    default: WEDDING_LOCATIONS.BOTH,
    required: true
  },
  contact: {
    email: String,
    phone: String
  }
});

export default mongoose.model('Vendors', vendorsSchema);
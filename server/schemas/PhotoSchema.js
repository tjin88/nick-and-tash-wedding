import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Photo', photoSchema);
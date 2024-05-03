import mongoose from 'mongoose';

const vendorsSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  }
});

export default mongoose.model('Vendors', vendorsSchema);
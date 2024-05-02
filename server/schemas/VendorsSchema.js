import mongoose from 'mongoose';

const vendorsSchema = new mongoose.Schema({
  role: String,
  name: String
});

export default mongoose.model('Vendors', vendorsSchema);
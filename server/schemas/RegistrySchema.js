import mongoose from 'mongoose';

const registrySchema = new mongoose.Schema({
  item: String,
  isBought: Boolean
});

export default mongoose.model('Registry', registrySchema);
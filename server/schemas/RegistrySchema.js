import mongoose from 'mongoose';

const registrySchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  isBought: Boolean
});

export default mongoose.model('Registry', registrySchema);
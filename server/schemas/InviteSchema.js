import mongoose from 'mongoose';

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dietaryRequirements: {
    type: String,
    default: ''
  }
});

const inviteSchema = new mongoose.Schema({
  guests: [personSchema],
  hasRSVPd: {
    type: Boolean,
    default: false
  },
  givenPlusOne: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('Invite', inviteSchema);
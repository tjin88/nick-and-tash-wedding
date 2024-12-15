import mongoose from 'mongoose';

const LOCATIONS = {
  CANADA: 'Canada',
  AUSTRALIA: 'Australia',
  BOTH: 'Both Australia and Canada'
};

const RSVP_STATUS = {
  PENDING: '',
  CANADA: 'Canada Only',
  AUSTRALIA: 'Australia Only',
  BOTH: 'Both Australia and Canada',
  NOT_ATTENDING: 'Not Attending'
};

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    // required: true
  },
  dietaryRequirements: {
    type: String,
    default: ''
  },
  attendingStatus: {
    type: String,
    enum: Object.values(RSVP_STATUS),
    default: RSVP_STATUS.PENDING
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
  },
  invitedLocation: {
    type: String,
    enum: Object.values(LOCATIONS),
    default: LOCATIONS.CANADA
  },
  // rsvpDeadline: {
  //   canada: {
  //     type: Date,
  //     required: function() {
  //       return this.invitedLocation === LOCATIONS.CANADA || 
  //              this.invitedLocation === LOCATIONS.BOTH;
  //     }
  //   },
  //   australia: {
  //     type: Date,
  //     required: function() {
  //       return this.invitedLocation === LOCATIONS.AUSTRALIA || 
  //              this.invitedLocation === LOCATIONS.BOTH;
  //     }
  //   }
  // },
  rsvpSubmittedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

inviteSchema.methods.canRSVPTo = function(location) {
  if (this.invitedLocation === LOCATIONS.BOTH) return true;
  return this.invitedLocation === location;
};

inviteSchema.methods.isValidRSVPStatus = function(status) {
  if (status === RSVP_STATUS.NOT_ATTENDING) return true;
  // if (status === RSVP_STATUS.NOT_ATTENDING || status === RSVP_STATUS.PENDING) return true;
  if (this.invitedLocation === LOCATIONS.BOTH) return true;
  if (this.invitedLocation === LOCATIONS.CANADA) {
    return status === RSVP_STATUS.CANADA;
  }
  if (this.invitedLocation === LOCATIONS.AUSTRALIA) {
    return status === RSVP_STATUS.AUSTRALIA;
  }
  return false;
};

const eventSchema = new mongoose.Schema({
  location: {
    type: String,
    enum: [LOCATIONS.CANADA, LOCATIONS.AUSTRALIA],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    name: String,
    address: String,
    googleMapsLink: String
  },
  schedule: [{
    time: String,
    description: String
  }]
});

export const Event = mongoose.model('Event', eventSchema);
export const Invite = mongoose.model('Invite', inviteSchema);
export const WEDDING_LOCATIONS = LOCATIONS;
export const RSVP_STATUSES = RSVP_STATUS;
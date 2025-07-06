import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Invite } from '../schemas/InviteSchema.js';

// Load environment variables
dotenv.config();

async function migrateInviteFields() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_CLUSTER}.mongodb.net/db?retryWrites=true&w=majority`
    );
    
    console.log('Connected to MongoDB successfully');
    
    // Find all invites that don't have the new fields
    const invitesToUpdate = await Invite.find({
      $or: [
        { numGuestsOnBus: { $exists: false } },
        { numGuestsMorningBreakfast: { $exists: false } },
        { guestAccommodationAddress: { $exists: false } },
        { guestAccommodationLocalName: { $exists: false } }
      ]
    });
    
    console.log(`Found ${invitesToUpdate.length} invites to update`);
    
    if (invitesToUpdate.length === 0) {
      console.log('No invites need migration. All invites already have the required fields.');
      return;
    }
    
    // Update all invites that are missing the new fields
    const updateResult = await Invite.updateMany(
      {
        $or: [
          { numGuestsOnBus: { $exists: false } },
          { numGuestsMorningBreakfast: { $exists: false } },
          { guestAccommodationAddress: { $exists: false } },
          { guestAccommodationLocalName: { $exists: false } }
        ]
      },
      {
        $set: {
          numGuestsOnBus: -1,               // -1 means "not responded yet"
          numGuestsMorningBreakfast: -1,    // -1 means "not responded yet"
          guestAccommodationAddress: '',    // "" means "not responded yet"
          guestAccommodationLocalName: ''   // "" means "not responded yet"
        }
      }
    );
    
    console.log(`Migration completed! Updated ${updateResult.modifiedCount} invites.`);
    
    // Additional migration: Ensure all guests have dietaryRequirements field
    const guestUpdateResult = await Invite.updateMany(
      { "guests.dietaryRequirements": { $exists: false } },
      {
        $set: {
          "guests.$[].dietaryRequirements": ""
        }
      }
    );
    
    console.log(`Updated ${guestUpdateResult.modifiedCount} invites to add missing dietaryRequirements fields to guests.`);
    
    // Verify the migration
    const verifyCount = await Invite.countDocuments({
      numGuestsOnBus: { $exists: true },
      numGuestsMorningBreakfast: { $exists: true },
      guestAccommodationAddress: { $exists: true },
      guestAccommodationLocalName: { $exists: true }
    });
    
    const totalCount = await Invite.countDocuments();
    
    console.log(`Verification: ${verifyCount}/${totalCount} invites now have the required fields.`);
    
    if (verifyCount === totalCount) {
      console.log('✅ Migration successful! All invites now have the required fields.');
    } else {
      console.log('⚠️  Some invites may still be missing fields. Please check manually.');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

// Run the migration
migrateInviteFields(); 
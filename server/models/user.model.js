import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Ensure this matches your signup field
  name: { type: String, required: true },
});

// Add password comparison method
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Add null checks
  if (!candidatePassword || !this.password) {
    throw new Error("Missing password for comparison");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);

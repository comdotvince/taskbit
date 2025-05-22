import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true },
  name: String,
  createdAt: { type: Date, default: Date.now },
});

// Method to compare input password with hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

export const User = mongoose.model("User", userSchema);

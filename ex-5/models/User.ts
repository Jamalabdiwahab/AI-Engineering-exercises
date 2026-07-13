import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  favorite_genre: String,
});

export const User =
  mongoose.models.User ||
  mongoose.model("User", UserSchema);
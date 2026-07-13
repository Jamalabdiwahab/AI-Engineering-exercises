import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  movie_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
  rating: Number,
  comment: String,
  date: Date,
});

export const Review =
  mongoose.models.Review ||
  mongoose.model("Review", ReviewSchema);
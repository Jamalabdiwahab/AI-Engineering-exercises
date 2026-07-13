import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: String,
    year: Number,
    genre: String,
    rating: Number,
    director: String,
    description: String,
})

export const Movie =
  mongoose.models.Movie ||
  mongoose.model("Movie", movieSchema);


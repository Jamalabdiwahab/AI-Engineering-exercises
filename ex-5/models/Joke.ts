import mongoose from "mongoose";

const jokeSchema = new mongoose.Schema({
  joke: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: "dad",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Joke =
  mongoose.models.Joke ||
  mongoose.model("Joke", jokeSchema);
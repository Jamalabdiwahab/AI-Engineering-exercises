import "dotenv/config";
import mongoose from "mongoose";
import { Movie } from "@/models/Movie";
import { User } from "@/models/User";
import { Review } from "@/models/Review";

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);

  console.log("Connected to MongoDB");

  // Clear old data
  await Movie.deleteMany({});
  await User.deleteMany({});
  await Review.deleteMany({});

  // -------------------------
  // Movies
  // -------------------------
  const movies = await Movie.insertMany([
    {
      title: "Interstellar",
      year: 2014,
      genre: "Sci-Fi",
      rating: 8.7,
      director: "Christopher Nolan",
      description: "A team travels through a wormhole to save humanity.",
    },
    {
      title: "Inception",
      year: 2010,
      genre: "Sci-Fi",
      rating: 8.8,
      director: "Christopher Nolan",
      description: "A thief enters dreams to steal secrets.",
    },
    {
      title: "The Dark Knight",
      year: 2008,
      genre: "Action",
      rating: 9.0,
      director: "Christopher Nolan",
      description: "Batman faces the Joker.",
    },
    {
      title: "Avatar",
      year: 2009,
      genre: "Adventure",
      rating: 7.9,
      director: "James Cameron",
      description: "Humans explore Pandora.",
    },
    {
      title: "Titanic",
      year: 1997,
      genre: "Romance",
      rating: 7.9,
      director: "James Cameron",
      description: "A love story aboard the Titanic.",
    },
    {
      title: "The Matrix",
      year: 1999,
      genre: "Sci-Fi",
      rating: 8.7,
      director: "The Wachowskis",
      description: "A hacker discovers reality is a simulation.",
    },
    {
      title: "John Wick",
      year: 2014,
      genre: "Action",
      rating: 7.5,
      director: "Chad Stahelski",
      description: "An ex-hitman seeks revenge.",
    },
    {
      title: "The Godfather",
      year: 1972,
      genre: "Crime",
      rating: 9.2,
      director: "Francis Ford Coppola",
      description: "The Corleone crime family saga.",
    },
    {
      title: "Forrest Gump",
      year: 1994,
      genre: "Drama",
      rating: 8.8,
      director: "Robert Zemeckis",
      description: "The extraordinary life of Forrest Gump.",
    },
    {
      title: "Spider-Man: No Way Home",
      year: 2021,
      genre: "Action",
      rating: 8.2,
      director: "Jon Watts",
      description: "Spider-Man faces villains from other universes.",
    },
  ]);

  // -------------------------
  // Users
  // -------------------------
  const users = await User.insertMany([
    {
      name: "Alice",
      email: "alice@example.com",
      age: 24,
      favorite_genre: "Sci-Fi",
    },
    {
      name: "Bob",
      email: "bob@example.com",
      age: 31,
      favorite_genre: "Action",
    },
    {
      name: "Charlie",
      email: "charlie@example.com",
      age: 28,
      favorite_genre: "Drama",
    },
    {
      name: "Diana",
      email: "diana@example.com",
      age: 35,
      favorite_genre: "Adventure",
    },
    {
      name: "Ethan",
      email: "ethan@example.com",
      age: 22,
      favorite_genre: "Crime",
    },
  ]);

  // -------------------------
  // Reviews
  // -------------------------
  await Review.insertMany([
    {
      movie_id: movies[0]._id,
      user_id: users[0]._id,
      rating: 10,
      comment: "One of the greatest sci-fi movies ever.",
      date: new Date(),
    },
    {
      movie_id: movies[0]._id,
      user_id: users[1]._id,
      rating: 9,
      comment: "Amazing visuals and story.",
      date: new Date(),
    },
    {
      movie_id: movies[1]._id,
      user_id: users[2]._id,
      rating: 10,
      comment: "Mind-blowing concept.",
      date: new Date(),
    },
    {
      movie_id: movies[2]._id,
      user_id: users[3]._id,
      rating: 10,
      comment: "Best Batman movie ever.",
      date: new Date(),
    },
    {
      movie_id: movies[3]._id,
      user_id: users[4]._id,
      rating: 8,
      comment: "Beautiful world-building.",
      date: new Date(),
    },
    {
      movie_id: movies[4]._id,
      user_id: users[0]._id,
      rating: 9,
      comment: "Classic romance.",
      date: new Date(),
    },
    {
      movie_id: movies[5]._id,
      user_id: users[1]._id,
      rating: 10,
      comment: "Changed science fiction forever.",
      date: new Date(),
    },
    {
      movie_id: movies[6]._id,
      user_id: users[2]._id,
      rating: 8,
      comment: "Awesome action scenes.",
      date: new Date(),
    },
    {
      movie_id: movies[7]._id,
      user_id: users[3]._id,
      rating: 10,
      comment: "Masterpiece of cinema.",
      date: new Date(),
    },
    {
      movie_id: movies[9]._id,
      user_id: users[4]._id,
      rating: 9,
      comment: "A fun superhero movie.",
      date: new Date(),
    },
  ]);

  console.log("Database seeded successfully!");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
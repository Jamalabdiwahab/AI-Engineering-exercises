import "dotenv/config";
import { connectDB } from "@/lib/mongodb";
import { Joke } from "@/models/Joke";
import { Movie } from "@/models/Movie";
import { Review } from "@/models/Review";
import { User } from "@/models/User";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data));
}

export const POST = async (req: Request) => {

    const { messages }:{ messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: openai("gpt-4o-mini"),
        messages: await convertToModelMessages(messages),
        tools:{
            database: tool({
                description: "search for movies, users, and reviews in the database",
                inputSchema: z.object({
                    action: z.enum(["moviesByGenre","moviesAboveRating","usersAboveAge","countMoviesByGenre","movieReviews",]),
                    genre: z.string().nullable().optional(),
                    rating: z.number().nullable().optional(),
                    age: z.number().nullable().optional(),
                    title:z.string().nullable().optional(),
                }),
                execute: async ({ action, genre, rating, age,title }) => {

                    console.log("TOOL INPUT:",{action,genre,rating,age,title});
                    await connectDB();

                    switch (action) {
                        case "moviesByGenre":
                            if (!genre) throw new Error("Genre is required for moviesByGenre");
                            const moviesByGenre = await Movie.find({ genre: {
                                $regex: new RegExp(`^${genre}$`,"i")
                            } }).lean();
                            return {
                                success: true,
                                metadata: {
                                    count: moviesByGenre.length,
                                },
                                results: serialize(moviesByGenre),
                            };
                        case "moviesAboveRating":
                            if (rating === undefined) throw new Error("Rating is required for moviesAboveRating");
                            const moviesAboveRating = (await Movie.find({ rating: { $gt: rating } }).lean());
                            return {
                                success: true,
                                metadata: {
                                    count: moviesAboveRating.length,
                                },
                                results: serialize(moviesAboveRating),
                            };
                        case "usersAboveAge":
                            if (age === undefined) throw new Error("Age is required for usersAboveAge");
                            const usersAboveAge = await User.find({ age: { $gt: age } }).lean();
                            return {
                                success: true,
                                metadata: {
                                    count: usersAboveAge.length,
                                },
                                results: serialize(usersAboveAge),
                            };
                        case "countMoviesByGenre":
                            if (!genre) throw new Error("Genre is required for countMoviesByGenre");
                            const count = await Movie.aggregate([
                                {
                                    $group: {
                                        _id: "$genre",
                                        count: { $sum: 1 }
                                    }
                                }
                            ]);
                            return {
                                success: true,
                                metadata: {
                                    genre,
                                },
                                results: serialize(count.find(c => c._id === genre) || {
                                    _id: genre,
                                    count: 0,
                                }),
                            };
                        case "movieReviews":
                            if (!title) {
                                throw new Error("Movie title is required.");
                            }

                            const movie = await Movie.findOne({
                                title:{ $regex: title, $options: "i"},
                            }).limit(5).lean();

                            if(!movie){
                                return {
                                    sucess:false,
                                    message:"Movie not found."
                                }
                            }

                            const reviews = await Review.find({
                                movie_id: movie._id
                            }).lean();

                            return{
                                success:true,
                                metadata: {
                                    movie: movie.title,
                                    totalReviews: reviews.length,
                                },
                                results: serialize(reviews)
                            }
                    }
                }
            }),
            movieSearch: tool({
                description: "search movie details",
                inputSchema: z.object({
                    title: z.string(),
                    year: z.number().optional(),
                }),
                execute: async ({ title, year }) => {
                    const apiKey = process.env.OMDB_API_KEY;
                    
                    if (!apiKey) throw new Error("OMDB_API_KEY is not set in environment variables");
                    
                    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${title}`;
                    
                    const response = await fetch(url);
                    
                    if (!response.ok) {
                        throw new Error(`OMDB API request failed with status ${response.status}`);
                    }
                   
                    const data = await response.json();
                    if(data.Response==="False"){
                        return{
                            success:false,
                            message:data.Error
                        }
                    }

                    return{
                        success:true,
                        movie:data
                    }
                }
            }),
            joke: tool({
                description: "Get a random dad joke",
                inputSchema: z.object({}),
                execute: async () => {

                    try {
                        const response = await fetch("https://icanhazdadjoke.com/", {
                            headers: { "Accept": "application/json" }
                        });
    
                        const data = await response.json();
                        await Joke.create({
                            joke: data.joke,
                            category: "dad",
                        });
                        return data.joke;
                    } catch (error) {
                        const jokes = await Joke.aggregate([
                            {
                                $sample:{size:1}
                            }
                        ]);

                        return jokes[0]?.joke ?? "No jokes available."; 
                    }
                }
            }),
            recommendMovies: tool({

                description:"Recommend movies",
                inputSchema:z.object({
                    genre:z.string()
                }),
                execute:async({genre})=>{

                    await connectDB();

                    const movies=await Movie.find({
                        genre
                    }).limit(5);

                    return movies;
                }

            })
        },
        stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse();
}
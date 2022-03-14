/* eslint-disable no-underscore-dangle */
const { initializeApp } = require("firebase/app");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const path = require("path");
const fs = require("fs");
const firebaseConfig = require("../../utils/firebaseConfig");
const Movie = require("../../database/models/Movie");

const fireBaseApp = initializeApp(firebaseConfig);
const storage = getStorage(fireBaseApp);

const getMovies = async (req, res, next) => {
  const search = req.query.s;
  const movies = await Movie.find({
    Title: { $regex: search, $options: "m" },
  }).select("Title Type Poster Year");
  if (movies.length < 1) {
    const error = new Error("No movies found");
    error.code = 404;
    error.message = "No movies found";
    next(error);
    return;
  }
  res.json(movies);
};

const deleteMovie = async (req, res, next) => {
  const { movieId } = req.params;
  try {
    await Movie.findByIdAndDelete(movieId);
    res.json({ message: "Movie deleted" });
  } catch (error) {
    error.code = 404;
    error.message = "We couldn't find the movie you requested to delete";
    next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const { body } = req;

    const oldFileName = path.join("uploads", req.file.filename);
    const newFileName = path.join("uploads", req.body.Title);
    fs.rename(oldFileName, newFileName, (error) => {
      if (error) {
        next(error);
      }
    });
    fs.readFile(newFileName, async (error, file) => {
      if (error) {
        next(error);
      } else {
        const storageRef = ref(storage, body.Title);
        await uploadBytes(storageRef, file);
        const firebaseFileURL = await getDownloadURL(storageRef);
        body.Poster = firebaseFileURL;
        await Movie.create(body);

        res.status(201).json({
          movie: {
            Title: body.Title,
            Year: body.Year,
            Type: body.Type,
            Poster: body.Poster,
          },
          message: "Movie created",
        });
      }
    });
  } catch (error) {
    fs.unlink(path.join("uploads", req.file.filename), () => {
      error.code = 400;
      next(error);
    });

    error.message = "We couldn't create the movie";
    error.code = 400;
    next(error);
  }
};

module.exports = { getMovies, deleteMovie, createMovie };

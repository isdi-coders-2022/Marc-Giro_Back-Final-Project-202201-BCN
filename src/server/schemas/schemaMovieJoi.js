const { Joi } = require("express-validation");

const schemaMovieJoi = {
  body: Joi.object({
    Title: Joi.string().required(),
    Year: Joi.string().required(),
    Runtime: Joi.string().required(),
    Genre: Joi.string(),
    Type: Joi.string().required(),
    Director: Joi.string().required(),
    Writer: Joi.string().required(),
    Actors: Joi.string().required(),
    Plot: Joi.string().required(),
    Poster: Joi.string(),
  }),
};

module.exports = schemaMovieJoi;

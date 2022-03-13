const Joi = require("joi");

const schemaMovieJoi = Joi.object({
  Title: Joi.string().required(),
  Year: Joi.string().alphanum().required(),
  Runtime: Joi.string().number().required(),
  Genre: Joi.string(),
  Type: Joi.string().required(),
  Director: Joi.string().required(),
  Writer: Joi.string().required(),
  Actors: Joi.string().required(),
  Plot: Joi.string().required(),
  Poster: Joi.string(),
});

export default schemaMovieJoi;
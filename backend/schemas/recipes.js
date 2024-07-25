import Joi from 'joi';

export const recipeSchema = Joi.object({
  title: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).required(),
  instructions: Joi.array().items(Joi.string()).required(),
  image: Joi.string(),
  createdAt: Joi.date().required()
});
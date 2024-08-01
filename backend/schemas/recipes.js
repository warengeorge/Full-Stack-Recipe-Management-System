import Joi from 'joi';

export const recipeSchema = Joi.object({
  title: Joi.string().required(),
  ingredients: Joi.array().items(Joi.string()).required(),
  instructions: Joi.array().items(Joi.string()).required(),
  image: Joi.any().allow()
});

export const updateRecipeSchema = Joi.object({
  title: Joi.string(),
  ingredients: Joi.array().items(Joi.string()),
  instructions: Joi.array().items(Joi.string()),
  image: Joi.any().allow()
});
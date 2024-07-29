import Recipe from '../models/recipes.js';
import redis from 'redis';
import { recipeSchema, updateRecipeSchema } from '../schemas/recipes.js';
import { uploadImage } from '../utils/awsUploads.js';

const redisClient = redis.createClient();
const redisConnected = await redisClient.connect();
if (redisConnected) {
  console.log('Connected to Redis');
} else {
  console.error('Error connecting to Redis');
}

// Get a list of paginated recipes
const getRecipes = async (req, res) => {
  /* #swagger.tags = ['Recipes'] */
  /* #swagger.description = 'Get a list of paginated recipes' */
  /* #swagger.parameters['page'] = { description: 'Page number', type: 'integer' } */
  /* #swagger.parameters['limit'] = { description: 'Number of items per page', type: 'integer' } */
  /* #swagger.responses[200] = { description: 'List of recipes' } */
  /* #swagger.responses[500] = { description: 'Server error' } */
  /*#swagger.summary = 'Get a list of paginated recipes' */
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;

  try {
    if (!redisConnected) {
      const recipes = await Recipe.find().sort({ createdAt: -1 }).skip(start).limit(limit).exec();
      if (!recipes) {
        return res.status(404).send('Recipes not found');
      }
      return res.status(200).json(recipes);
    }
    // Fetch recipe IDs from Redis
    const recipeIds = await redisClient.lRange('recipes', start, start + limit - 1);

    const recipes = [];
    const redisRecipeMap = new Map();

    // Fetch recipes from Redis
    for (const id of recipeIds) {
      const recipe = await redisClient.get(id);
      if (recipe) {
        const parsedRecipe = JSON.parse(recipe);
        recipes.push(parsedRecipe);
        redisRecipeMap.set(id, parsedRecipe);
      }
    }

    // Fetch recipes from MongoDB excluding those already in Redis
    const mongoRecipes = await Recipe.find({ _id: { $nin: Array.from(redisRecipeMap.keys()) } })
      .sort({ createdAt: -1 })
      .skip(start)
      .limit(limit)
      .exec();

    for (const mongoRecipe of mongoRecipes) {
      const recipeId = mongoRecipe._id.toString();
      const recipe = JSON.stringify(mongoRecipe);

      // Cache the fetched recipes in Redis
      await redisClient.set(recipeId, recipe);
      recipes.push(mongoRecipe);
    }

    // Ensure no duplicates
    const uniqueRecipes = Array.from(new Set(recipes.map(r => r._id.toString())))
      .map(id => recipes.find(r => r._id.toString() === id));

    return res.status(200).json(uniqueRecipes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Get a single recipe by ID
const getRecipe = async (req, res) => {
  /* #swagger.tags = ['Recipes'] */
  /* #swagger.description = 'Get a single recipe by ID' */
  /* #swagger.parameters['id'] = { description: 'Recipe ID', type: 'string' } */
  /* #swagger.responses[200] = { description: 'Recipe details' } */
  /* #swagger.responses[404] = { description: 'Recipe not found' } */
  /* #swagger.responses[500] = { description: 'Server error' } */
  /*#swagger.summary = 'Get a single recipe by ID' */

  const { id } = req.params;
  try {
    if (!redisConnected) {
      const recipe = await Recipe.findById(id).exec();
      if (!recipe) {
        return res.status(404).send('Recipe not found');
      }
      return res.json(recipe);
    }
    let recipe = await redisClient.get(id);
    if (!recipe) {
      const mongoRecipe = await Recipe.findById(id).exec();
      if (mongoRecipe) {
        recipe = JSON.stringify(mongoRecipe);
        await redisClient.set(id, recipe);
      } else {
        return res.status(404).send('Recipe not found');
      }
    }
    return res.json(JSON.parse(recipe));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

// Create a new recipe
const createRecipe = async (req, res) => {
  /* #swagger.tags = ['Recipes'] */
  /* #swagger.description = 'Create a new recipe' */
  /* #swagger.parameters['body'] = { description: 'Recipe details', type: 'object' } */
  /* #swagger.responses[201] = { description: 'Created recipe' } */
  /* #swagger.responses[400] = { description: 'Invalid recipe details' } */
  /* #swagger.responses[500] = { description: 'Server error' } */
  /*#swagger.summary = 'Create a new recipe' */

  const { error, value } = recipeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const title = await Recipe.findOne({ title: value.title }).exec();
    if (title) { return res.status(400).send('Recipe already exists'); }

    const recipe = new Recipe(value);

    const savedRecipe = await recipe.save();
    const id = savedRecipe._id.toString();
    await redisClient.set(id, JSON.stringify(savedRecipe));
    await redisClient.lPush('recipes', id);

    // Upload image to S3
    if (req.file) {
      const imageUrl = await uploadImage(id, req.file);
      recipe.image = imageUrl;
      await recipe.save();
    }

    return res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update a recipe by ID
const updateRecipe = async (req, res) => {
  /* #swagger.tags = ['Recipes'] */
  /* #swagger.description = 'Update a recipe by ID' */
  /* #swagger.parameters['id'] = { description: 'Recipe ID', type: 'string' } */
  /* #swagger.parameters['body'] = { description: 'Recipe details', type: 'object' } */
  /* #swagger.responses[200] = { description: 'Updated recipe' } */
  /* #swagger.responses[404] = { description: 'Recipe not updated' } */
  /* #swagger.responses[500] = { description: 'Server error' } */
  /*#swagger.summary = 'Update a recipe by ID' */

  const { error, value } = updateRecipeSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const id = req.params.id;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, value, { new: true }).exec();
    if (updatedRecipe) {
      await redisClient.set(id, JSON.stringify(updatedRecipe));
      return res.status(200).json(updatedRecipe);
    } else {
      return res.status(404).send('Recipe not updated');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete a recipe by ID
const deleteRecipe = async (req, res) => {
  /* #swagger.tags = ['Recipes'] */
  /* #swagger.description = 'Delete a recipe by ID' */
  /* #swagger.parameters['id'] = { description: 'Recipe ID', type: 'string' } */
  /* #swagger.responses[200] = { description: 'Recipe deleted' } */
  /* #swagger.responses[404] = { description: 'Recipe not found' } */
  /* #swagger.responses[500] = { description: 'Server error' } */
  /*#swagger.summary = 'Delete a recipe by ID' */

  const id = req.params.id;
  try {
    const result = await redisClient.del(id);
    if (result) {
      await redisClient.lRem('recipes', 0, id);
      await Recipe.findByIdAndDelete(id).exec();
      return res.send('Recipe deleted');
    } else {
      return res.status(404).send('Recipe not found');
    }
    // const result = await Recipe.findByIdAndDelete(id).exec();
    // if (result) {
    //   await redisClient.del(id);
    //   return res.send('Recipe deleted');
    // } else {
    //   return res.status(404).send('Recipe not found');
    // }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
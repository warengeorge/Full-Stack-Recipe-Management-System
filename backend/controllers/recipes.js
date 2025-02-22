import Recipe from '../models/recipes.js';
import { recipeSchema, updateRecipeSchema } from '../schemas/recipes.js';
import { uploadImage } from '../utils/awsUploads.js';
import redisConnection from '../config/redis.js';


const redisClient = await redisConnection();

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

    // return paginated recipes
    return res.status(200).json({ uniqueRecipes, totalPages: Math.ceil(uniqueRecipes.length / limit) });

  } catch (error) {
    console.error('Error fetching recipes:', error);
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
    return res.status(200).json({ data: JSON.parse(recipe) });
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
    // Check if a recipe with the same title already exists
    const existingRecipe = await Recipe.findOne({ title: value.title }).exec();
    if (existingRecipe) {
      console.log('Recipe already exists with title:', value.title);
      return res.status(400).json({ message: 'Recipe already exists' });
    }

    const { image, ...fields } = value;
    const newRecipe = new Recipe(fields);

    // Save the new recipe to the database
    const savedRecipe = await newRecipe.save();
    const recipeId = savedRecipe._id.toString();

    // Upload image to S3 if file is provided
    if (req.file) {
      try {
        const imageUrl = await uploadImage(recipeId, req.file);
        savedRecipe.image = imageUrl;
        await savedRecipe.save();
      } catch (uploadError) {
        await Recipe.findByIdAndDelete(recipeId);
        return res.status(400).json({ message: 'Error uploading image, recipe not saved' });
      }
    }

    // Cache the saved recipe in Redis
    await redisClient.set(recipeId, JSON.stringify(savedRecipe));
    await redisClient.lPush('recipes', recipeId);

    return res.status(201).json({ data: savedRecipe });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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
      return res.status(200).json({ data: updatedRecipe });
    }
    return res.status(404).send('Recipe not updated');
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
      return res.status(200).send('Recipe deleted');
    }

    return res.status(404).send('Recipe not found');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export default {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};
import Recipe from '../models/recipes.js';
import redis from 'redis';
import { recipeSchema, updateRecipeSchema } from '../schemas/recipes.js';
import { uploadImage } from '../utils/awsUploads.js';

const redisClient = redis.createClient();
const redisConnected = await redisClient.connect();
if (redisConnected) {
  console.log('Connected to Redis');
}

// Get a list of paginated recipes
const getRecipes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;

  try {
    const recipeIds = await redisClient.lRange('recipes', start, start + limit - 1);
    const recipes = [];
    for (const id of recipeIds) {
      let recipe = await redisClient.get(id);
      if (!recipe) {
        const mongoRecipe = await Recipe.findById(id).exec();
        if (mongoRecipe) {
          recipe = JSON.stringify(mongoRecipe);
          await setAsync(id, recipe);
        }
      }
      if (recipe) {
        recipes.push(JSON.parse(recipe));
      }
    }
    return res.status(200).json(recipes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
} 

// Get a single recipe by ID
const getRecipe = async (req, res) => {
  const { id } = req.params;
  try {
    let recipe = await redisClient.get(id);
    if (!recipe) {
      const mongoRecipe = await Recipe.findById(id).exec();
      if (mongoRecipe) {
        recipe = JSON.stringify(mongoRecipe);
        await setAsync(id, recipe);
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
  const { error, value } = recipeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const recipe = new Recipe(value);
  try {
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
  const id = req.params.id;
  try {
    const result = await Recipe.findByIdAndDelete(id).exec();
    if (result) {
      await redisClient.del(id);
      return res.send('Recipe deleted');
    } else {
      return res.status(404).send('Recipe not found');
    }
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
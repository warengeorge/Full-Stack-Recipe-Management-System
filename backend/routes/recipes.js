import { Router } from 'express';
import { upload } from "../utils/awsUploads.js";
import RecipeController from '../controllers/recipes.js';

const router = Router();

router.get('/', RecipeController.getRecipes);
router.get('/:id', RecipeController.getRecipe);
router.post('/',  upload.single('file'), RecipeController.createRecipe);
router.put('/:id', RecipeController.updateRecipe);
router.delete('/:id', RecipeController.deleteRecipe);

export default router;
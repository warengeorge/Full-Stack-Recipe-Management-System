import { Schema, model } from 'mongoose';

const recipeSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  ingredients: {
    type: [String],
    required: true
  },
  instructions: {
    type: [String],
    required: true
  },
  image: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export default model('Recipe', recipeSchema);
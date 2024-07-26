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
  }
}, {
  timestamps: true
});

export default model('Recipe', recipeSchema);
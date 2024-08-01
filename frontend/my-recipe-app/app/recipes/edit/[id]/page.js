"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/app/components/Navigation';

function EditRecipe() {
  const router = useRouter();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const base_url = process.env.BASE_URL || `http://localhost:9000`;
      const res = await axios.get(`${base_url}/api/recipes/${id}`);
      const recipe = res.data.data;

      setTitle(recipe.title);
      setIngredients(recipe.ingredients.join('\n'));
      setInstructions(recipe.instructions.join('\n'));
      // setImage(recipe.image);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      setError('Failed to fetch recipe');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    instructions.split('\n').forEach((instruction, index) => {
      formData.append(`instructions[${index}]`, instruction);
    });
    ingredients.split('\n').forEach((ingredient, index) => {
      formData.append(`ingredients[${index}]`, ingredient);
    });
    formData.append('file', image);

    try {
      const base_url = process.env.BASE_URL || `http://localhost:9000`;
            const res = await axios.put(`${base_url}/api/recipes/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.status !== 200) {
                // This will activate the closest ⁠ error.js ⁠ Error Boundary
                throw new Error('Failed to fetch data');
            }
            setSuccess('Recipe created successfully');
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to create recipe')
        } finally {
            setLoading(false);
        }
    };

  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setImage(file);
  };

  return (
    <div>
      <Navigation />
      <div className="container mx-auto my-20">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-1/2 mx-auto"
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            name="title"
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <textarea
            placeholder="Ingredients (separate by new lines)"
            value={ingredients}
            name="ingredients"
            onChange={(e) => setIngredients(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <textarea
            placeholder="Instructions (separate by new lines)"
            value={instructions}
            name="instructions"
            onChange={(e) => setInstructions(e.target.value)}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="file"
            onChange={handleImage}
            className="p-2 border border-gray-300 rounded"
          />
          {image && typeof image === 'string' && (
            <img src={image} alt="Recipe" className="mt-4" />
          )}
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
        </form>
      </div>
    </div>
  );
}

export default EditRecipe;

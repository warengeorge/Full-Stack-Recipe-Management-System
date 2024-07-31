"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navigation from '@/app/components/Navigation';

// Create a new recipe
function Page() {
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const base_url = process.env.BASE_URL || `http://localhost:9000`;
            const res = await axios.post(`${base_url}/api/recipes`, {
                title,
                image,
                ingredients: ingredients.split("\n"),
                instructions: instructions.split('\n'),
            });
            if (res.statusText !== 'OK') {
                // This will activate the closest ⁠ error.js ⁠ Error Boundary
                throw new Error('Failed to fetch data');
            }
            console.log(res);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleImage = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await axios.post(`${process.env.BASE_URL}/api/recipes/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.statusText !== 'OK') {
                // This will activate the closest ⁠ error.js ⁠ Error Boundary
                throw new Error('Failed to fetch data');
            }
            setImage(res.data.url);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
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
                        placeholder="Ingredients"
                        value={ingredients}
                        name="ingredients"
                        onChange={(e) => setIngredients(e.target.value)}
                        className="p-2 border border-gray-300 rounded"
                    />
                    <textarea
                        placeholder="Instructions"
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
                    <button
                        type="submit"
                        className="p-2 bg-blue-500 text-white rounded"
                    >
                        {loading ? 'Loading...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Page;
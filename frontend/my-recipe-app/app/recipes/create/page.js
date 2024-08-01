"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navigation from '@/app/components/Navigation';

// Create a new recipe
function Page() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [image, setImage] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        instructions.split('\n').forEach((instruction, index) => {
            formData.append(`instructions[${index}]`, instruction);
        });
        ingredients.split('\n').forEach((ingredient, index) => {
            formData.append(`ingredients[${index}]`, ingredient);
        });
        if (image) {
            formData.append('file', image);
        }


        try {
            const base_url = process.env.BASE_URL || `http://localhost:9000`;
            const res = await axios.post(`${base_url}/api/recipes`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (res.status === 200) {
                router.replace('/');
            }
            console.log(res);
            setLoading(true);
        } catch (error) {
            console.error('Error fetching data:', error);
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
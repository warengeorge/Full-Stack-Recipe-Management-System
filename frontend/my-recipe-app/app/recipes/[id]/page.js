"use client"

import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';

function Details() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:9000/api/recipes/${id}`);
        if (res.statusText != 'OK') {
          // This will activate the closest `error.js` Error Boundary
          throw new Error('Failed to fetch data');
        }
        setRecipe(res?.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  return (
    <div>
      <Navigation />
    <div className="container mx-auto my-20">
      <div className="flex border-2 border-gray-300 cursor-pointer hover:border-black p-4">
        {/* Image Section on the Left */}
        <div className="relative w-[50%] h-[500px] mr-8">
          <Image
            src={recipe?.image}
            layout="fill"
            objectFit="cover"
            alt="recipe Image"
          />
          
        </div>

        {/* Information Section on the Right */}
        <div className="w-[50%]">
        <button
            href={`/recipes/${recipe?._id}/`}
            type="submit"
            className="p-2 bg-blue-500 text-white rounded"
          >
            {loading ? 'Loading...' : 'Edit'}
          </button>
          <button
            type="submit"
            className="p-2 bg-red-500 text-white rounded"
          >
            {loading ? 'Loading...' : 'Delete'}
          </button>
          <h1 className="bg-white py-4 text-gray-500 font-semibold text-2xl text-center mb-4">
            {recipe?.title}
          </h1>


          {/* Ingredients Card */}
          <div className="bg-white p-4 mb-4 border border-gray-300 rounded">
            <h2 className="text-xl font-semibold mb-2">Ingredients:</h2>
            <ol className="list-decimal pl-4">
              {recipe?.ingredients.map((step, index) => (
                <li key={index} className="mb-2">{step}</li>
              ))}
            </ol>
          </div>

          {/* Steps Card */}
          <div className="bg-white p-4 mb-4 border border-gray-300 rounded">
            <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
            <ol className="list-decimal pl-4">
              {recipe?.instructions.map((step, index) => (
                <li key={index} className="mb-2">{step}</li>
              ))}
            </ol>
          </div>
        </div>       
      </div>
    </div>
    </div>
  );
}

export default Details;
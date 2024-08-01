"use client"

import Image from 'next/image';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import Link from 'next/link';

function Details() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const base_url = process.env.BASE_URL || 'http://localhost:9000';
        const res = await axios.get(`${base_url}/api/recipes/${id}`);
        setRecipe(res.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch recipe details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base_url = process.env.BASE_URL || 'http://localhost:9000';
      const res = await axios.delete(`${base_url}/api/recipes/${id}`);
      if (res.status === 200) {
        router.replace('/');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError('Failed to delete recipe');
    } finally {
      setLoading(false);
    }
  };

  const imageLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center">{error}</div>;
  }

  return (
    <div>
      <Navigation />
      <div className="flex justify-center items-center min-h-screen px-4">
        <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row border-2 border-gray-300 p-4 hover:border-black cursor-pointer">
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 h-64 md:h-[500px] mb-4 md:mb-0 md:mr-8">
              {recipe?.image && (
                <Image loader={imageLoader} src={recipe.image} layout="fill" objectFit="cover" alt="recipe image" />
              )}
            </div>

            {/* Information Section */}
            <div className="w-full md:w-1/2">
              <div className="flex flex-row gap-2 items-center">
                <Link href={`/recipes/edit/${recipe?._id}/`}
                    className="p-2 bg-blue-500 text-white rounded mb-4"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  type="button"
                  className="p-2 bg-red-500 text-white rounded mb-4"
                >
                  Delete
                </button>
              </div>
              <h1 className="text-gray-500 font-semibold text-2xl text-center mb-4">
                {recipe?.title}
              </h1>

              {/* Ingredients Card */}
              <div className="bg-white p-4 mb-4 border border-gray-300 rounded">
                <h2 className="text-xl font-semibold mb-2">Ingredients:</h2>
                <ol className="list-decimal pl-4">
                  {recipe?.ingredients && recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="mb-2">{ingredient}</li>
                  ))}
                </ol>
              </div>

              {/* Instructions Card */}
              <div className="bg-white p-4 mb-4 border border-gray-300 rounded">
                <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
                <ol className="list-decimal pl-4">
                  {recipe?.instructions && recipe.instructions.map((instruction, index) => (
                    <li key={index} className="mb-2">{instruction}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;

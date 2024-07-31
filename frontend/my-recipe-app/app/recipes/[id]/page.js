"use client"

import Image from 'next/image';
import axios from 'axios';
import { useParams } from 'next/navigation';
// import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import Link from 'next/link';

function Details() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  // const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const base_url = process.env.BASE_URL || 'http://localhost:9000';
        const res = await axios.get(`${base_url}/api/recipes/${id}`);
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

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const base_url = `http://localhost:9000` || process.env.BASE_URL;
      const res = await axios.delete(`${base_url}/api/recipes/${id}`);
      if (res.statusText != 'OK') {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data');
      }
      console.log(res);
      setLoading(false);
      // router.push('/');

    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }

  const imageLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  }

  return (
    <div>
      <Navigation />
    <div className="container mx-auto my-20">
      <div className="flex border-2 border-gray-300 cursor-pointer hover:border-black p-4">
        {/* Image Section on the Left */}
        <div className="relative w-[50%] h-[500px] mr-8">
          <Image loader={imageLoader} src={recipe?.image} width={350} height={250} alt='recipe image'/>
        </div>

        {/* Information Section on the Right */}
        <div className="w-[50%]">
        <Link
            href={`/recipes/edit/${recipe?._id}/`}
            type="submit"
            className="p-2 bg-blue-500 text-white rounded"
          >
            {loading ? 'Loading...' : 'Edit'}
          </Link>
          <button
          onClick={handleDelete}
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
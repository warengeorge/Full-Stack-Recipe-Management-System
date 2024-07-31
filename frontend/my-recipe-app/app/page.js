"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from './components/Card';
import Navigation from './components/Navigation';

function Page() {
  const [name, setName] = useState('beef');
  const [data, setData] = useState(null);
  const[loading,setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

console.log({ENV: process.env.BASE_URL})
  useEffect(() => {
    setLoading(true)
    const fetchData = async (page) => {
      try {
        const base_url = process.env.BASE_URL || 'http://localhost:9000';
        const res = await axios.get(`${base_url}/api/recipes?page=${page}`);
        console.log(res)
        if (res.statusText != 'OK') {
          // This will activate the closest `error.js` Error Boundary
          throw new Error('Failed to fetch data');
        }
        console.log(res.data)
        setData(res?.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false)
    };

    fetchData();
  }, [name]);

  return (
    <div>

      <Navigation />
      <div className='flex items-center justify-center p-10'>
        <div className='flex flex-wrap flex-col lg:flex-row items-center gap-5'>
          {
            loading && <h1 className='text-2xl font-semibold text-center mx-4 text-gray-500'>Loading...</h1>
          }
          {
            !loading &&  
            <>
            {data?.map((recipe) => (
              <Card key={recipe.idrecipe} recipe={recipe} />
            ))}
            </>
          }
          
        </div>
      </div>

    </div>
  );
}

export default Page;
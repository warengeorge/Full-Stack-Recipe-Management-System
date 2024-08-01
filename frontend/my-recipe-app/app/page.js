"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from './components/Card';
import Navigation from './components/Navigation';
import Pagination from './components/Pagination';

function Page({ searchParams }) {
  const page = searchParams['page'] || 1;
  const per_page = searchParams['per_page'] || 10;
  const [data, setData] = useState(null);
  const[loading,setLoading] = useState(false);

  const start = (page - 1) * per_page; // 0, 10, 20, 30, ...
  const end = start + per_page; // 10, 20, 30, 40, ...

  const entries = data?.uniqueRecipes.slice(start, end);
  const totalPages = data?.totalPages;

  useEffect(() => {
    setLoading(true)
    const fetchData = async (page) => {
      try {
        const base_url = process.env.BASE_URL || 'http://localhost:9000';
        const res = await axios.get(`${base_url}/api/recipes?page=${page}`);
        console.log('res', res);
        setData(res?.data);
        console.log('data', res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false)
    };

    fetchData();
  }, [page]);

  console.log('totalPages', totalPages);  
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
            {entries?.map((recipe) => (
              <Card key={recipe.idrecipe} recipe={recipe} />
            ))}
            </>
          }
        </div>
      </div>
      <div className='flex justify-center'>
      <Pagination
            totaPages={totalPages}
            hasNextPage={end < data?.uniqueRecipes.length}
            hasPrevPage={start > 0}
          />
      </div>
    </div>
  );
}

export default Page;
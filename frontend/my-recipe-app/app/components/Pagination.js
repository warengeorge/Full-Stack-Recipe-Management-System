"use client"

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


const Pagination = (
  {
    totalPages,
    hasNextPage,
    hasPrevPage,
  }
) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') || 1;
  const per_page = 10;

  return (
    <div className='flex gap-2'>
      <button
        className='bg-blue-500 text-white p-1'
        disabled={!hasPrevPage}
        onClick={() => {
          router.replace(`/?page=${(page) - 1}&per_page=${per_page}`)
        }}>
        prev page
      </button>

      <div>
        {page} / 10
      </div>

      <button
        className='bg-blue-500 text-white p-1'
        disabled={!hasNextPage}
        onClick={() => {
          router.replace(`/?page=${(page) + 1}&per_page=${per_page}`)
        }}>
        next page
      </button>
    </div>
  )
};

export default Pagination;
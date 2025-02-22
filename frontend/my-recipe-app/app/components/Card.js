import Image from 'next/image'
import Link from 'next/link'
import React from 'react'


function Card({recipe}) {

  const imageLoader = ({src, width, quality}) => {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  return (
    <Link href={`/recipes/${recipe?._id}`}>
    <div className='max-w-sm border-2 border-gray-300 cursor-pointer hover:border-black'>
        <Image loader={imageLoader} src={recipe?.image} width={320} height={320} alt='recipe image'/>
        <h1 className='bg-white py-4 text-gray-500 font-semibold text-2xl text-center'>{recipe?.title}</h1> 
    </div>
    </Link>
  )
}

export default Card
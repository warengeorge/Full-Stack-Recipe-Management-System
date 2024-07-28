'use client'

import React, { useState } from 'react';
import { FaRegTrashCan } from "react-icons/fa6";
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

const RecipeForm = () => {

  const { data: session } = useSession();

  const initialFormData = {
    recipeName: '',
    ingredients: [''],
    steps: [''],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e, index, type) => {
    const { value } = e.target;
    const updatedData = { ...formData };

    if (type === 'ingredients') {
      updatedData.ingredients[index] = value;
    } else if (type === 'steps') {
      updatedData.steps[index] = value;
    } else {
      updatedData.recipeName = value;
    }

    setFormData(updatedData);
  };

  const handleAddInput = (type) => {
    const updatedData = { ...formData };

    if (type === 'ingredients') {
      updatedData.ingredients.push('');
    } else if (type === 'steps') {
      updatedData.steps.push('');
    }

    setFormData(updatedData);
  };

  const handleRemoveInput = (index, type) => {
    const updatedData = { ...formData };

    if (type === 'ingredients') {
      updatedData.ingredients.splice(index, 1);
    } else if (type === 'steps') {
      updatedData.steps.splice(index, 1);
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(session);
    console.log(session?.user);
    let authorName = session?.user?.name;
    let id = session?.user?.id;
    let recipeName = formData.recipeName;
    let ingredients = formData.ingredients;
    let steps = formData.steps;

    try {
        fetch('/api/add-post', { 
            method: 'POST', 
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ authorName, id, recipeName, ingredients, steps })
        })
        setFormData(initialFormData);
        toast.success('Recipe Submitted!');
        setSuccess(true);  
    } catch (error) {
        console.error(error);
        toast.error('Oops! Something went wrong...');
    }
  };

  if (success) {
    return (
      <div className='flex flex-col items-center pt-4'>
        <h1 className='text-5xl font-semibold text-center mb-4'>Sounds Yummy!</h1>
        <h4 className='text-lg font-semibold text-center'>You&apos;ll see a pending submission on your Home Page. If you close it, it will reappear once admin approves or declines it.</h4>
      </div>
    )
  } else {
      return (
        <div className='min-w-[300px] max-w-screen-sm mx-auto p-2 pt-4'>
          <h1 className="text-3xl text-center font-semibold mb-5">Let&apos;s Make a Recipe!</h1>
          <form className='shadow-md rounded-md bg-white p-4' onSubmit={handleSubmit}>
            <div className='mb-5'>
                <div className='mt-[2.5rem] mb-2'>
                  <input
                    type="text"
                    value={formData.recipeName}
                    onChange={(e) => handleInputChange(e, null, 'name')}
                    className='focus:border-b-2 focus:border-slate-400 rounded-none w-full text-3xl font-bold px-1 outline-none'
                    placeholder='Recipe Name'
                    required
                  />
                </div>
              </div>
            <div className='flex flex-col'>
              <label className='text-lg font-medium mt-5'>Ingredients</label>
              {formData.ingredients.map((ingredient, index) => (
                <div className='my-1 flex' key={index}>
                  <span className='text-lg me-2'>&bull;</span>
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleInputChange(e, index, 'ingredients')}
                    className={`${index === formData.ingredients.length - 1 && index === 0 ? 'border-b-2 border-slate-400' : 'focus:border-b-2 focus:border-slate-400'} rounded-none w-full text-lg px-1 outline-none`}
                    placeholder='E.g. 2 Lbs Chicken Breast'
                  />
                  {index > 0 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveInput(index, 'ingredients')}
                      className='ml-2 hover:text-red-400 transition-all duration-150'
                      >
                      <FaRegTrashCan className='text-xl' />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => handleAddInput('ingredients')}
                className='self-center border border-slate-700 rounded-md hover:border-green-500 transition-all duration-150 px-3 py-1 mt-2'>
                Add +
              </button>
            </div>

            <div className='flex flex-col'>
              <label className='text-lg font-medium'>Steps</label>
              {formData.steps.map((step, index) => (
                <div className='flex my-2 content-start' key={index}>
                  <span className='text-lg me-2'>{index + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleInputChange(e, index, 'steps')}
                    className={`${index === formData.ingredients.length - 1 && index === 0 ? 'border-b-2 border-slate-400' : 'focus:border-b-2 focus:border-slate-400'} rounded-none w-full text-lg px-1 outline-none`}
                    placeholder='E.g. Chop broccoli into florets'
                  />
                  {index > 0 && (
                    <button
                    type="button" 
                    onClick={() => handleRemoveInput(index, 'steps')}
                    className='ml-2 hover:text-red-400 transition-all duration-150'>
                      <FaRegTrashCan className='text-xl' />
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => handleAddInput('steps')}
                className='self-center border border-slate-700 rounded-md hover:border-green-500 transition-all duration-150 px-3 py-1 my-2'>
                Add +
              </button>
            </div>
            
            <div className='flex justify-end'>
              <button 
                type="submit"
                className='bg-sky-300 p-2 rounded shadow-md text-lg lg:text-xl hover:bg-sky-400 ml-1 transition-all duration-150'>
                  Submit
              </button>
            </div>
          </form>
        </div>
      );
    }
};

export default RecipeForm;
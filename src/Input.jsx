import React, { useState } from 'react';
import useAuth from './useAuth';
import axios from 'axios';
import { PSongcard } from './PSongcard';
import { Songcard } from './Songcard'; 

export const Input = ({ code }) => {
  const [content, setContent] = useState('');
  const [songs, setSongs] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [submit, setSubmit] = useState(false);
  const accessToken = useAuth(code);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmit(true); 
    try {
      const response = await axios.post('http://localhost:3001/createFeed', {
        accessToken,
        content,
      });
      console.log('Response:', response.data);
      setSongs(response.data); 
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmit(false);
    }
  }

  const handleClick = () => {
    setClicked(!clicked);
  }

  return (
    <>
      {songs ? (
        <PSongcard songs={songs} /> 
      ) : clicked ? (
        <Songcard code={code} />
      ) : (
        <>
        <div  className='flex items-center justify-center flex-col h-screen gap-10'>
          <form onSubmit={handleSubmit}>
            <div className='flex  flex-row'>
            <label className='flex items-center justify-center flex-col'>
              personalized feed:
              <input className = 'bg-slate-200 w-full'
                type="text" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
              />
            </label>
            <input type="submit" value="enter"  className = 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded' />
            </div>
          </form>
          {submit && (
            <div>Please wait while we generate your feed...</div>
          )}
          <div>
            OR
          </div>
          <button className = 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded' onClick={handleClick}>
            generate feed from your recommendations
          </button>
          </div>
        </>
      )}
    </>
  );
}

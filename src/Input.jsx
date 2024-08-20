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
          <form onSubmit={handleSubmit}>
            <label>
              Personalized feed:
              <input 
                type="text" 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
              />
            </label>
            <input type="submit" value="Submit" />
          </form>
          {submit && (
            <div>Please wait while we generate your recommendations...</div>
          )}
          <div onClick={handleClick}>
            or generate feed from your recommendations
          </div>
        </>
      )}
    </>
  );
}

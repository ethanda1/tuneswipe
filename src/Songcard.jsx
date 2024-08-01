import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import spotifyWebApi from 'spotify-web-api-node';
import Player from  './Player';
export const Songcard = ({ code }) => {
  const accessToken = useAuth(code);
  const [recommendations, setRecommendations] = useState([]);
  const spotifyApi = new spotifyWebApi({
    clientId: '6223f4e8625a427a83463c0ac5848388',
  });

  const getRecommendations = async () => {
    if (!accessToken) return;

    try {
      spotifyApi.setAccessToken(accessToken);
      const topTracks = await spotifyApi.getMyTopTracks({ limit: 5 });
      const seedTracks = topTracks.body.items.map(track => track.id);

      const response = await spotifyApi.getRecommendations({
        seed_tracks: seedTracks,
        limit: 100,
      });

      setRecommendations(response.body.tracks);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      getRecommendations();
    }
  }, [accessToken]);

  const [I, setI] = useState(0);
  const handleClick = () => {
    if (I == 99){
      getNewRecommendations();
    }
    setI((i) => (i + 1) % recommendations.length);
  };

  const getNewRecommendations = () => {
    setRecommendations([]);
    getRecommendations();
    setI(0);
    console.log('New Recommendations')
  };



  const currentTrack = recommendations[I];
  const imageUrl = currentTrack?.album?.images?.[0]?.url; 
  const previewUrl = currentTrack?.preview_url;
  console.log(I)
  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='aspect-[9/16] w-full max-w-xs rounded-3xl flex flex-col items-center pt-7'>
        {recommendations.length > 0 && (
          <div key={currentTrack.id} className='w-full h-full bg-white p-4 mb-4 rounded-lg shadow-md relative'>
            {imageUrl && (
              <img src={imageUrl} alt={currentTrack.name} className='w-full h-auto rounded-lg' />
            )}
            <div className='mt-4 text-lg font-semibold'>{currentTrack.name}</div>
            <div className='text-gray-600'>
              {currentTrack.artists.map(artist => artist.name).join(', ')}
            </div>
            <div className='overflow-hidden h-10 relative'>
            <audio controls src={previewUrl} className='mt-4'>
                Your browser does not support the audio element.
              </audio>
            </div>
            <img src = 'public\360_F_520196054_Uy8LwGHzlqAQWEG3rMICCfaSZuAzXTF2.jpg' onClick={handleClick} className='absolute w-10 right-10 bottom-10'>
            </img>
            <img src = 'public\126504.png' onClick={handleClick} className='absolute w-8 left-10 bottom-10'>
            </img>
          </div>
        )}
      </div>
    </div>
  );
};

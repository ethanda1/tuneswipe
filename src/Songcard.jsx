import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import spotifyWebApi from 'spotify-web-api-node';
import Player from './Player';

export const Songcard = ({ code }) => {
  const accessToken = useAuth(code);
  const [recommendations, setRecommendations] = useState([]);
  const [index, setIndex] = useState(0);
  const spotifyApi = new spotifyWebApi({
    clientId: CLIENT_ID,
  });

  useEffect(() => {
    if (accessToken) {
      const getRecommendations = async () => {
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

      getRecommendations();
    }
  }, [accessToken]);

  useEffect(() => {
    if (recommendations.length > 0 && !recommendations[index]?.preview_url) {
      setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
    }
  }, [index, recommendations]);

  const handleClick = () => {
    if (index === 99) {
      setRecommendations([]);
      getRecommendations();
    }
    setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  };

  const currentTrack = recommendations[index];
  const imageUrl = currentTrack?.album?.images?.[0]?.url;
  const previewUrl = currentTrack?.preview_url;

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="aspect-[9/16] w-full max-w-xs rounded-3xl flex flex-col items-center pt-7">
        {recommendations.length > 0 && (
          <div key={currentTrack.id} className="w-full h-full bg-white p-4 mb-4 rounded-lg shadow-md relative">
            {imageUrl && (
              <img src={imageUrl} alt={currentTrack.name} className="w-full h-auto rounded-lg" />
            )}
            <div className="mt-4 text-lg font-semibold">{currentTrack.name}</div>
            <div className="text-gray-600">
              {currentTrack.artists.map(artist => artist.name).join(', ')}
            </div>
            <div className="flex flex-col items-center justify-content">
              <div className="flex flex-col text-xs items-center justify-center"></div>
              {previewUrl ? (
                <>
                  <h1>30 second preview</h1>
                  <audio controls src={previewUrl} autoPlay className="pt-2" loop>
                    Your browser does not support the audio element.
                  </audio>
                </>
              ) : (
                <div>This song does not have playback</div>
              )}
            </div>
            <img
              src="public/360_F_520196054_Uy8LwGHzlqAQWEG3rMICCfaSZuAzXTF2.jpg"
              onClick={handleClick}
              className="absolute w-10 right-6 bottom-6"
              alt="Next"
            />
            <img
              src="public/126504.png"
              onClick={handleClick}
              className="absolute w-8 left-6 bottom-6"
              alt="Next"
            />
          </div>
        )}
      </div>
    </div>
  );
};

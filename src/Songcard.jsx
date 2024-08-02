import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import spotifyWebApi from 'spotify-web-api-node';
import Player from './Player';

export const Songcard = ({ code }) => {
  const accessToken = useAuth(code);
  const [recommendations, setRecommendations] = useState([]);
  const [index, setIndex] = useState(0);
  const [likedSongs, setLikedSongs] = useState([]);
  const [clickedLike, setClickedLike] = useState(false);
  const spotifyApi = new spotifyWebApi({
    clientId: import.meta.env.CLIENT_ID,
  });

  useEffect(() => {
    const storedRecommendations = localStorage.getItem('recommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
    } else if (accessToken) {
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
          localStorage.setItem('recommendations', JSON.stringify(response.body.tracks));
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

  const handleClickLike = () => {
    setLikedSongs((prevLikedSongs) => [...prevLikedSongs, recommendations[index]]);
    setClickedLike(true);
    setTimeout(() => setClickedLike(false), 1000);

    setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  };

  const handleClick = () => {
    setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  };

  const createPlaylist = async () => {
    try {
      spotifyApi.setAccessToken(accessToken);
      const user = await spotifyApi.getMe();
      const playlist = await spotifyApi.createPlaylist(user.body.id, {
        name: 'TuneSwipe Liked Songs',
        description: 'Playlist created with liked songs from TuneSwipe',
        public: false,
      });
    } catch (error) {
      console.log('error creating playlist:', error);
    }
  };

  const [clicked, setClicked] = useState(false);
  const handleClicked = () => {
    setClicked(!clicked);
  };

  const currentTrack = recommendations[index];
  const imageUrl = currentTrack?.album?.images?.[0]?.url;
  const previewUrl = currentTrack?.preview_url;
  const songUrl = currentTrack?.external_urls?.spotify;

  return (
    <div className="flex items-center justify-center h-screen bg-gray relative">
      <div className='absolute left-10 top-10 z-50 shadow-md text-black bg-white font-semibold py-2 px-4 rounded w-auto ' >
        <div 
          className={`text-2xl hover:animate-pulse ${clicked ? 'mb-5 border-b-2 border-black' : ''}`}
          onClick={handleClicked}
        >
          Liked Songs
        </div>
        {clicked && (
          likedSongs.map((track, idx) => (
            <div key={idx}>
              <a href={track.uri} className='hover:animate-pulse'>
                <div className='z-50'>{track.name} <span className='font-normal'>by</span> {track.artists.map(artist => artist.name).join(', ')}</div>
              </a>
            </div>
          ))
        )}
      </div>

      <div className={`aspect-[9/16] w-full max-w-xs rounded-3xl flex flex-col items-center relative pt-7 z-0 transition ease-in-out ${clickedLike ? 'bg-red-400' : ''}`}>
        {recommendations.length > 0 && (
          <div key={currentTrack.id} className="w-full h-full bg-white p-4 mb-4 rounded-lg shadow-xl relative">
            {songUrl ? (
              <a href={songUrl} target="_blank" rel="noopener noreferrer">
                <div className='hover:scale-110 transition ease-in-out duration-1000 hover:bg-gray-100 p-5'>
                  {imageUrl && (
                    <img src={imageUrl} alt={currentTrack.name} className="w-full h-auto rounded-lg" />
                  )}
                  <div className="mt-4 text-lg font-semibold">{currentTrack.name}</div>
                  <div className="text-gray-600">
                    {currentTrack.artists.map(artist => artist.name).join(', ')}
                  </div>
                </div>
              </a>
            ) : (
              <div>
                {imageUrl && (
                  <img src={imageUrl} alt={currentTrack.name} className="w-full h-auto rounded-lg" />
                )}
                <div className="mt-4 text-lg font-semibold">{currentTrack.name}</div>
                <div className="text-gray-600">
                  {currentTrack.artists.map(artist => artist.name).join(', ')}
                </div>
              </div>
            )}
            <div className="flex flex-col items-center justify-content">
              <div className="flex flex-col text-xs items-center justify-center"></div>
              {previewUrl ? (
                <>
                  <audio controls src={previewUrl} autoPlay className="absolute bottom-20" loop>
                    Your browser does not support the audio element.
                  </audio>
                </>
              ) : (
                <div>This song does not have playback</div>
              )}
            </div>
            <img
              src="/av85f1b171d762037fe92.png"
              onClick={handleClick}
              className="absolute w-10 right-6 bottom-6 hover:scale-110 transition ease-in-out duration-300"
              alt="Next"
            />
            <img
              src="/360_F_520196054_Uy8LwGHzlqAQWEG3rMICCfaSZuAzXTF2.jpg"
              onClick={handleClickLike}
              className="absolute w-10 left-6 bottom-6 hover:scale-110 transition ease-in-out duration-300"
              alt="Like"
            />
          </div>
        )}
      </div>
    </div>
  );
};

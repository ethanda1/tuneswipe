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
    setTimeout(() => {
      setClickedLike(false);
      setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
    }, 1000);
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

      
      <div className="aspect-[9/16] w-full max-w-xs rounded-xl flex flex-col items-center relative pt-7 z-0">
        {recommendations.length > 0 && (
          <div className="w-full h-full p-4 mb-4 rounded-xl shadow-xl relative z-10">
            <div className={`absolute inset-0 bg-red-400 opacity-0 transition-opacity duration-300 rounded-xl ${clickedLike ? 'opacity-50' : ''}`}></div>
            {songUrl ? (
              <a href={songUrl} target="_blank" rel="noopener noreferrer" className="block relative z-20">
                <div className="hover:scale-110 transition ease-in-out duration-1000 hover:bg-gray-100 p-5 text-nowrap overflow-hidden">
                  {imageUrl && (
                    <img src={imageUrl} alt={currentTrack.name} className="w-full h-auto rounded-lg text-nowrap overflow-hidden" />
                  )}
                  <div className="mt-4 text-lg font-semibold text-nowrap overflow-hidden ">{currentTrack.name}</div>
                  <div className="text-gray-600 text-nowrap overflow-hidden">
                    {currentTrack.artists.map(artist => artist.name).join(', ')}
                  </div>
                </div>
              </a>
            ) : (
              <div className="relative z-20">
                {imageUrl && (
                  <img src={imageUrl} alt={currentTrack.name} className="w-full h-auto rounded-lg" />
                )}
                <div className="mt-4 text-lg font-semibold">{currentTrack.name}</div>
                <div className="text-gray-600">
                  {currentTrack.artists.map(artist => artist.name).join(', ')}
                </div>
              </div>
            )}
            <div className="flex flex-col items-center justify-content relative z-20">
              <div className="flex flex-col text-xs items-center justify-center"></div>
              {previewUrl ? (
                <audio controls src={previewUrl} autoPlay className="absolute top-5 bg-transparent" loop>
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div>This song does not have playback</div>
              )}
            </div>
            <img
              src="/av85f1b171d762037fe92.png"
              onClick={handleClick}
              className="absolute w-10 right-6 bottom-6 hover:scale-110 transition ease-in-out duration-300 z-20"
              alt="Next"
            />
            <img
              src="/heart-logo-png-transparent.png"
              onClick={handleClickLike}
              className={`absolute w-10 left-6 bottom-6 hover:scale-110 transition-scale ease-in-out duration-300 z-20 ${clickedLike ? 'scale-150' : ''}`}
              alt="Like"
            />
          </div>
        )}
      </div>
    </div>
  );
};
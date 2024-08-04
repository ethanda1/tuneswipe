import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import SpotifyWebApi from 'spotify-web-api-node';
import Player from './Player';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useSwipeable } from 'react-swipeable';

export const Songcard = ({ code }) => {
  const accessToken = useAuth(code);
  const [recommendations, setRecommendations] = useState([]);
  const [index, setIndex] = useState(0);
  const [likedSongs, setLikedSongs] = useState([]);
  const [clickedLike, setClickedLike] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const spotifyApi = new SpotifyWebApi({
    clientId: import.meta.env.VITE_CLIENT_ID,
  });

  const open = Boolean(anchorEl);

  const handleClickDash = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const storedRecommendations = localStorage.getItem('recommendations');
    if (storedRecommendations) {
      setRecommendations(JSON.parse(storedRecommendations));
    } else if (accessToken) {
      const getRecommendations = async () => {
        try {
          spotifyApi.setAccessToken(accessToken);
          const topTracks = await spotifyApi.getMyTopTracks({ limit: 10 });
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
  }, [accessToken, spotifyApi]);

  useEffect(() => {
    if (recommendations.length > 0 && !recommendations[index]?.preview_url) {
      setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
    }
  }, [index, recommendations]);

  const handleClickLike = async () => {
    if (likedSongs.includes(recommendations[index])) return;

    const updatedLikedSongs = [...likedSongs, recommendations[index]];
    setLikedSongs(updatedLikedSongs);

    if ((updatedLikedSongs.length) % 5 === 0 && index < 100 && updatedLikedSongs.length < 100) {
      const seedTracks = updatedLikedSongs.map(track => track.id);
      try {
        spotifyApi.setAccessToken(accessToken);
        const response = await spotifyApi.getRecommendations({
          seed_tracks: seedTracks.join(','),  
          limit: 100,
        });

        setClickedLike(true);
        setTimeout(() => {
          setRecommendations(response.body.tracks);
          setIndex(0);
        }, 1000);

        localStorage.setItem('recommendations', JSON.stringify(response.body.tracks));
      } catch (error) {
        console.error('Error getting new recommendations:', error);
      }
    } else {
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
      }, 1000);
    }
  
    setClickedLike(true);
    setTimeout(() => {
      setClickedLike(false);
    }, 1000);
  };

  const handleClick = () => {
    setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  };

  const handleClicked = () => {
    setClicked(!clicked);
  };

  const handleSwipeLeft = () => {
    setIndex((prevIndex) => (prevIndex + 1) % recommendations.length);
  };

  const handleSwipeRight = () => {
    handleClickLike();
  };

  const currentTrack = recommendations[index];
  const imageUrl = currentTrack?.album?.images?.[0]?.url;
  const previewUrl = currentTrack?.preview_url;
  const songUrl = currentTrack?.external_urls?.spotify;

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
  });

  return (
    <div className='flex flex-row'>
      <div className="w-1/4 flex flex-col overflow-y-auto max-h-screen">
        {likedSongs.map((track, idx) => (
          <a key={idx} href={track?.album?.images?.[0]?.url} className="hover:bg-gray-200 p-2">
            <div className="flex flex-row items-center">
              <img src={track?.album?.images?.[0]?.url} alt={track.name} className="w-12 h-12 rounded-lg" />
              <div className="flex flex-col ml-2">
                <span className="font-bold">{track.name}</span>
                <span className="font-normal">{track.artists.map(artist => artist.name).join(', ')}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
  
      <div {...handlers} className="flex items-center justify-center h-screen bg-gray relative">
        <div className="aspect-[9/16] w-full max-w-xs rounded-xl flex flex-col items-center relative pt-7 z-0">
          {recommendations.length > 0 && (
            <div className="w-full h-full p-4 mb-4 rounded-xl shadow-xl relative z-10">
              <div className={`absolute inset-0 bg-red-400 opacity-0 transition-opacity duration-300 rounded-xl ${clickedLike ? 'opacity-50' : ''}`}></div>
              {songUrl ? (
                <a href={songUrl} target="_blank" rel="noopener noreferrer" className="block relative z-20">
                  <div className="hover:scale-110 transition ease-in-out duration-1000 p-5 text-nowrap overflow-hidden">
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
                  <audio controls src={previewUrl} autoPlay className="absolute top-3.5 bg-transparent" loop>
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
                className={`absolute w-10 left-6 bottom-6 hover:w-11 transition-scale ease-in-out duration-300 z-20 ${clickedLike ? 'scale-150' : ''}`}
                alt="Like"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

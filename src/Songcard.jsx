import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import SpotifyWebApi from 'spotify-web-api-node';
import { useSprings, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const to = (i, isInitialLoad) => ({
  x: 0,
  y: 0,
  scale: isInitialLoad ? 1 : 1,  // Maintain scale without animation initially
  rot: -10 + Math.random() * 20,
  delay: isInitialLoad ? 0 : i * 100,
});
const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 });

export const Songcard = ({ code }) => {
  const accessToken = useAuth(code);
  const [recommendations, setRecommendations] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [gone] = useState(() => new Set());
  const [initialLoad, setInitialLoad] = useState(true);  // Track initial load state
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);  // Track index for playing audio

  const spotifyApi = new SpotifyWebApi({
    clientId: import.meta.env.VITE_CLIENT_ID,
  });

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

  const [props, api] = useSprings(recommendations.length, i => ({
    ...to(i, initialLoad),
    from: from(i),
  }));

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);  // Disable initial load animation after mounting
      setTimeout(() => {
        api.start(i => to(i, false));
      }, 100);  // Short delay to ensure the initial load state is applied
    } else {
      api.start(i => to(i, false));
    }
  }, [initialLoad, recommendations, api]);

  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    const dir = xDir < 0 ? -1 : 1;
    if (!down && Math.abs(mx) > 50) {
      gone.add(index);
      if (dir === 1) {
        handleLike(index);
      } else {
        handleSkip(index);
      }
    }
    api.start(i => {
      if (index !== i) return;
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0;
      const scale = down ? 1.1 : 1;
      if (i === index) {
        setCurrentTrackIndex(isGone ? null : index);  // Update current track index
      }
      return {
        x,
        scale,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      };
    });
    if (!down && gone.size === recommendations.length) {
      setTimeout(() => {
        setRecommendations(prev => prev.filter((_, idx) => !gone.has(idx)));
        gone.clear();
      }, 600);
    }
  });

  const handleLike = (index) => {
    const likedSong = recommendations[index];
    setLikedSongs(prev => [...prev, likedSong]);
  }

  const handleSkip = (index) => {
    console.log('Skipped song:', recommendations[index]);
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 overflow-y-auto overflow-x-hidden">
        {likedSongs.map((track) => (
          <div key={track.id}>
            <h2>{track.name}</h2>
            <p>{track.artists.map(artist => artist.name).join(', ')}</p>
          </div>
        ))}
      </div>
  
      <div className="flex-grow flex items-center justify-center relative">
        {props.map(({ x, y, scale }, i) => {
          const currentTrack = recommendations[i];
          if (!currentTrack) return null;
          const imageUrl = currentTrack?.album?.images?.[0]?.url;
          const previewUrl = currentTrack?.preview_url;

          return (
            <animated.div
              key={i}
              style={{ x, y, scale }}
              className="absolute w-64 h-96 will-change-transform cursor-grab"
            >
              <animated.div
                {...bind(i)}
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  touchAction: 'none',
                }}
                className="w-full h-full touch-none bg-white bg-center bg-cover rounded-xl shadow-xl"
              >
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
                  <h2 className="text-xl font-bold truncate">{currentTrack.name}</h2>
                  <p className="truncate">{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
                  {i === currentTrackIndex && previewUrl && (
                    <audio controls autoPlay>
                      <source src={previewUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </animated.div>
            </animated.div>
          );
        })}
      </div>
    </div>
  );
};

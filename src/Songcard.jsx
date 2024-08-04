import React, { useState, useEffect } from 'react';
import useAuth from './useAuth';
import SpotifyWebApi from 'spotify-web-api-node';
import { useSprings, animated, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const to = (i) => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const from = (_i) => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

export const Songcard = ({ code }) => {
  const accessToken = useAuth(code);
  const [recommendations, setRecommendations] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [gone] = useState(() => new Set())

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
    ...to(i),
    from: from(i),
  }))

  useEffect(() => {
    console.log('Recommendations updated:', recommendations);
    api.start(i => to(i))
  }, [recommendations, api])

  const bind = useDrag(({ args: [index], down, movement: [mx], direction: [xDir], velocity }) => {
    const dir = xDir < 0 ? -1 : 1
    console.log('Drag detected:', { down, mx, xDir, velocity,  dir });
    if (!down) {
      gone.add(index)
      if (dir === 1) {
        handleLike(index)
      } else {
        handleSkip(index)
      }
    }
    api.start(i => {
      if (index !== i) return
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? mx : 0
      const rot = mx / 100 + (isGone ? dir * 10 * velocity : 0)
      const scale = down ? 1.1 : 1
      console.log('Updating spring:', { index: i, x, rot, scale });
      return {
        x,
        rot,
        scale,
        delay: undefined,
        config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
      }
    })
    if (!down && gone.size === recommendations.length) {
      setTimeout(() => {
        gone.clear()
        api.start(i => to(i))
      }, 600)
    }
  })

  const handleLike = (index) => {
    console.log('Liked song:', recommendations[index]);
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
    <p>{track.artists.map((artist, index) => (
      <span key={index}>{artist}{index < track.artists.length - 1 ? ', ' : ''}</span>
    ))}</p>
  </div>
))}

      </div>
  
      <div className="flex-grow flex items-center justify-center relative">
        {props.map(({ x, y, rot, scale }, i) => {
          const currentTrack = recommendations[i];
          if (!currentTrack) return null;
          const imageUrl = currentTrack?.album?.images?.[0]?.url;

          return (
            <animated.div
              key={i}
              style={{ x, y }}
              className="absolute w-64 h-96 will-change-transform cursor-grab"
            >
              <animated.div
                {...bind(i)}
                style={{
                  transform: interpolate([rot, scale], trans),
                  backgroundImage: `url(${imageUrl})`,
                  touchAction: 'none',
                }}
                className="w-full h-full touch-none bg-white bg-center bg-cover rounded-xl shadow-xl"
              >
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
                  <h2 className="text-xl font-bold truncate">{currentTrack.name}</h2>
                  <p className="truncate">{currentTrack.artists.map(artist => artist.name).join(', ')}</p>
                </div>
              </animated.div>
            </animated.div>
          )
        })}
      </div>
    </div>
  );
};
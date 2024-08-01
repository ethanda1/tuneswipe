import { useState } from 'react';
import './App.css';
import { Songcard } from './Songcard';
import spotifyWebApi from 'spotify-web-api-node';

const code = new URLSearchParams(window.location.search).get("code");

const AUTH_URL = 
  "https://accounts.spotify.com/authorize?client_id=6223f4e8625a427a83463c0ac5848388&response_type=code&redirect_uri=https://tuneswipe-1234520f34b7.herokuapp.com&scope=user-top-read%20playlist-read-private%20user-library-read%20streaming%20user-read-playback-state%20user-modify-playback-state%20user-read-private%20user-read-email%20streaming";


function App() {
  return code ? <Songcard code={code} /> : (
    <div className='bg-black min-h-screen bg-gradient-to-b from-gray-600 to-black-200 flex items-center justify-center flex-col pb-20'>
      <div className='text-6xl text-green-200 pb-10 font-bold'>
        TuneSwipe
      </div>
      <a href={AUTH_URL} className='border-4 p-5 rounded-full bg-gradient-to-r from-emerald-300 to-emerald-200 text-2xl font-bold text-black font-arial'>Login with Spotify</a>
    </div>
  );
}

export default App;

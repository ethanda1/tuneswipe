import React from 'react'
import SpotifyWebPlayer from 'react-spotify-web-playback'
const Player = ({accessToken, trackUri}) => {
  return (
    <SpotifyWebPlayer token = {accessToken} play = {true} uris={trackUri} styles={{
        activeColor: 'transparent',
        loaderColor: '#fff',
        sliderColor: '#1cb954',
        trackArtistColor: 'transparent' ,
        trackNameColor: 'transparent',
        sliderHandleColor: 'transparent',
        bgColor: 'transparent',
      }}/>
  )
}
export default Player;
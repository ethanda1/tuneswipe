import express from 'express';
const app = express();
import SpotifyWebApi from 'spotify-web-api-node';
import cors from 'cors';
import bodyParser from 'body-parser';
import OpenAI from "openai";

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
      redirectUri:'http://localhost:5173',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken,
    });
    spotifyApi.refreshAccessToken()
      .then(data => {
        res.json({
          accessToken: data.body.access_token,
          expiresIn: data.body.expires_in,
        });
      })
      .catch(err => {
        console.error('error trying to refresh token', err);
        res.sendStatus(400);
      });
});

const usedAuthorizationCodes = new Set();

app.post('/login', (req, res) => {
  const code = req.body.code;
  console.log('Received authorization code:', code);

  if (usedAuthorizationCodes.has(code)) {
    return res.status(400).json({ error: 'Authorization code already used' });
  }

  const spotifyApi = new SpotifyWebApi({
    redirectUri: 'http://localhost:5173',
    clientId: '6223f4e8625a427a83463c0ac5848388',
    clientSecret: 'a079d43d9f874813841b8914620f92de',
  });

  console.log('Attempting to exchange code for tokens...');
  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      usedAuthorizationCodes.add(code);
      console.log(usedAuthorizationCodes);
      console.log(data.body.access_token);
      console.log('refresh token:', data.body.refresh_token);
      console.log(data.body.expires_in);
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
      console.log('Token exchange successful');
    })
    .catch(err => {
      console.error('Error during authorization code grant', err);
      console.error('Error details:', err.body);
      res.status(400).json({ error: 'Authorization failed', details: err.body });
    });
});
app.post('/createFeed', async (req, res) => {
  const { content, accessToken } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
          { role: "system", content: "Create a list of 20 songs with their artists. Format it as JSON, where each object contains a 'song' and an 'artist' key." },
          { role: "user", content: content },
      ],
      response_format: { "type": "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content);
    const songs = [];
    //search for songs on Spotify
    console.log(accessToken);
    if (accessToken) {
      const spotifyApi = new SpotifyWebApi({  
        redirectUri: 'http://localhost:5173',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        accessToken: accessToken
      });
      spotifyApi.setAccessToken(accessToken);
      for (const song of response.songs) {
        try {
          const data = await spotifyApi.searchTracks(`track:${song.song} artist:${song.artist}`);
          if (data.body.tracks.items.length===0) {
            console.log(song.song,song.artist,'No match found')
          }
          else{
            console.log('Search result:', data.body);
            songs.push(data.body.tracks.items);
          }
            
        } catch (err) {
          console.error('Error searching track:', err);
        }
      }
    }
    res.json({ 
      songs
    });
  } catch (error) {
    console.error('Error in createFeed:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});


app.listen(3001, () => {
    console.log('Server running on port 3001');
});
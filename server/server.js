import express from 'express';
const app = express();
import spotifyWebApi from 'spotify-web-api-node';
import cors from 'cors';
import bodyParser from 'body-parser';

app.use(cors());
app.use(bodyParser.json());
app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
      redirectUri:'https://songtinder.onrender.com',
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET',
      refreshToken,
    })
  
    spotifyApi
      .refreshAccessToken()
      .then(data => {
        res.json({
          accessToken: data.body.accessToken,
          expiresIn: data.body.expiresIn,
        })
      })
      .catch(err => {
        console.log(err)
        res.sendStatus(400)
      })
  })
app.post('/login', (req, res) => {
    const code = req.body.code;
    const spotifyApi = new spotifyWebApi({
        redirectUri: 'https://songtinder.onrender.com',
        clientId: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET'
    });

    spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            res.json({
                accessToken: data.body.access_token,
                refreshToken: data.body.refresh_token,
                expiresIn: data.body.expires_in,
            });
        })
        .catch(err => {
            console.error('Error during authorization code grant', err);
            res.sendStatus(400);
        });
});

const port = process.env.PORT || 3001; 

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

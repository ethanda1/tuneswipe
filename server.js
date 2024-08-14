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
      redirectUri:'http://localhost:5173',
      clientId: '6223f4e8625a427a83463c0ac5848388',
      clientSecret: 'a079d43d9f874813841b8914620f92de',
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
        console.error(err);
        res.sendStatus(400);
      });
});
app.post('/login', (req, res) => {
    const code = req.body.code;
    const spotifyApi = new spotifyWebApi({
        redirectUri: 'http://localhost:5173',
        clientId: '6223f4e8625a427a83463c0ac5848388',
        clientSecret: 'a079d43d9f874813841b8914620f92de'
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


app.listen(3001, () => {
    console.log('Server running on port 3001');
});
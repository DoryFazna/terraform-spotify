import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import open from 'open';

dotenv.config();

const app = express();
const port = 27228;

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:27228/callback',
  SPOTIFY_SCOPES = 'playlist-modify-private playlist-modify-public',
} = process.env;

app.get('/login', (req, res) => {
  const authorizeUrl = new URL('https://accounts.spotify.com/authorize');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', SPOTIFY_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', SPOTIFY_REDIRECT_URI);
  authorizeUrl.searchParams.set('scope', SPOTIFY_SCOPES);
  authorizeUrl.searchParams.set('show_dialog', 'true');
  res.redirect(authorizeUrl.toString());
});

app.get('/spotify_callback', async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send('No auth code found');

  try {
    const tokenRes = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokens = tokenRes.data;

    const apiKey = Buffer.from(JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token
      })).toString('base64');
      
    console.log('\n APIKey (for Terraform use):\n', apiKey);

    res.send(`
      <h2> Authorization complete!</h2>
      <p>Check your terminal for the access and refresh tokens.</p>
    `);
  } catch (err) {
    console.error(' Token exchange failed:', err.response?.data || err.message);
    res.status(500).send('Error exchanging auth code');
  }
});

app.listen(port, () => {
  console.log(`\n Auth proxy running at http://127.0.0.1:${port}/login`);
  open(`http://127.0.0.1:${port}/login`);
});

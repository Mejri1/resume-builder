import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Should be "http://localhost:3002/api/auth/callback"
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ message: 'Authorization code missing' });
  }

  try {
    // Exchange the authorization code for access & refresh tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens for future API requests (store securely)
    res.status(200).json({ success: true, tokens });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Failed to authenticate' });
  }
}

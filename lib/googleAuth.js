import { google } from "googleapis";
import fs from "fs";
import path from "path";

// Load Google Service Account credentials from a JSON file (use path module for better compatibility)
const credentialsPath = path.join(__dirname, '..', 'resume-pdf-uploader-ecd75f610a56.json'); // Adjust the path as needed

const GOOGLE_CREDENTIALS = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

// Authenticate with Google using JWT (Service Account)
const auth = new google.auth.JWT(
  GOOGLE_CREDENTIALS.client_email, // Service account email
  null, // No need for a key file path
  GOOGLE_CREDENTIALS.private_key, // Service account private key
  ["https://www.googleapis.com/auth/drive.file"] // Only allow file upload access
);

// Export Google Drive instance
export const drive = google.drive({ version: "v3", auth });


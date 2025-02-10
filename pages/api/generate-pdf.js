import puppeteer from "puppeteer";
import { google } from "googleapis";
import fs from "fs-extra";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { resumeData } = req.body;

  if (!resumeData) {
    return res.status(400).json({ error: "Missing resume data" });
  }

  try {
    // 1. Générer le HTML du CV en utilisant les données reçues
    const resumeHtml = generateResumeHtml(resumeData);

    // 2. Lancer Puppeteer pour convertir le HTML en PDF
    const pdfBuffer = await generatePdf(resumeHtml);

    // 3. Enregistrer le PDF temporairement
    const pdfPath = path.join(process.cwd(), "resume.pdf");
    await fs.writeFile(pdfPath, pdfBuffer);

    // 4. Authentification Google Drive et envoi du fichier
    const driveResponse = await uploadToGoogleDrive(pdfPath, resumeData);

    // 5. Supprimer le fichier temporaire
    await fs.remove(pdfPath);

    // Update this line to send the correct response
    res.status(200).json({
      success: true,
      pdfFileId: driveResponse.pdfFileId,  // Use the correct key here
      metadataFileId: driveResponse.metadataFileId,  // Include metadata ID if needed
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Fonction pour créer le HTML du CV
function generateResumeHtml(data) {
  return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resume</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .container {
        max-width: 800px;
        margin: auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      h1,
      h2,
      h3 {
        color: #333;
      }
      .section {
        margin-bottom: 20px;
      }
      .section ul {
        padding-left: 20px;
      }
      .section ul li {
        margin-bottom: 5px;
      }
      .social-links a {
        margin-right: 10px;
        text-decoration: none;
        color: blue;
      }
      .profile-img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Contact Section -->
      <div class="section text-center">
        ${
          data.profilePicture
            ? `<img src="${data.profilePicture}" alt="Profile Picture" class="profile-img" />`
            : ""
        }
        <h1>${data.name}</h1>
        <p><strong>${data.position}</strong></p>
        <p>${data.email} | ${data.contactInformation} | ${data.address}</p>
      </div>

      <!-- Social Media -->
      <div class="section social-links text-center">
        ${data.socialMedia
          .map(
            (social) =>
              `<a href="${social.link}" target="_blank">${social.socialMedia}</a>`
          )
          .join(" ")}
      </div>

      <!-- About Me -->
      <div class="section">
        <h2>About Me</h2>
        <p>${data.summary}</p>
      </div>

      <!-- Skills -->
      <div class="section">
        <h2>Skills</h2>
        ${data.skills
          .map(
            (category) => `
          <div>
            <h3>${category.title}</h3>
            <ul>
              ${category.skills.map((skill) => `<li>${skill}</li>`).join("")}
            </ul>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Work Experience -->
      <div class="section">
        <h2>Work Experience</h2>
        ${data.workExperience
          .map(
            (exp) => `
          <div>
            <h3>${exp.position}</h3>
            <p><strong>${exp.company}</strong> | ${exp.startYear} - ${exp.endYear}</p>
            <p>${exp.description}</p>
            <ul>
              ${exp.keyAchievements
                .split("\n")
                .map((ach) => `<li>${ach}</li>`)
                .join("")}
            </ul>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Education -->
      <div class="section">
        <h2>Education</h2>
        ${data.education
          .map(
            (edu) => `
          <div>
            <h3>${edu.school}</h3>
            <p>${edu.degree} | ${edu.startYear} - ${edu.endYear}</p>
          </div>
        `
          )
          .join("")}
      </div>

      <!-- Projects -->
      <div class="section">
        <h2>Projects</h2>
        ${
          data.projects && data.projects.length > 0
            ? data.projects
                .map(
                  (project) => `
          <div>
            <h3>${project.title}</h3>
            <p>${
              project.link
                ? `<a href="${project.link}" target="_blank">${project.link}</a>`
                : ""
            }</p>
            <p>${project.description}</p>
            <ul>
              ${project.keyAchievements
                .split("\n")
                .map((ach) => `<li>${ach}</li>`)
                .join("")}
            </ul>
            <p>${project.startYear} - ${project.endYear}</p>
          </div>
        `
                )
                .join("")
            : "<p>No projects listed.</p>"
        }
      </div>

      <!-- Certifications -->
      ${
        data.certifications.length > 0
          ? `<div class="section">
                <h2>Certifications</h2>
                <ul>
                  ${data.certifications
                    .map((cert) => `<li>${cert}</li>`)
                    .join("")}
                </ul>
             </div>`
          : ""
      }

      <!-- Languages -->
      ${
        data.languages.length > 0
          ? `<div class="section">
                <h2>Languages</h2>
                <ul>
                  ${data.languages.map((lang) => `<li>${lang}</li>`).join("")}
                </ul>
             </div>`
          : ""
      }
    </div>
  </body>
</html>

  `;
}


// Fonction pour générer un PDF avec Puppeteer
async function generatePdf(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  return pdfBuffer;
}

// Fonction pour uploader le PDF sur Google Drive
async function uploadToGoogleDrive(filePath, resumeData, photoPath) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: process.env.GOOGLE_AUTH_URI,
      token_uri: process.env.GOOGLE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  const drive = google.drive({ version: "v3", auth });

  // Define the main folder ID where new folders will be created
  const mainFolderId = '1JZrNNXdnThchvw4QdjbXQr-oeXZZ7n7u';  // Main folder ID

  // 1. Check if a folder exists with the user's name in the main folder
  const folderName = resumeData.name; // Assuming name field contains the user's name
  let folderId;
  try {
    const folderList = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${mainFolderId}' in parents`,
      fields: "files(id, name)",
    });

    if (folderList.data.files.length === 0) {
      // Folder does not exist, create it in the main folder
      const folderResponse = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [mainFolderId], // Specify the main folder as parent
        },
      });
      folderId = folderResponse.data.id;
      console.log("Folder created with ID:", folderId);
    } else {
      // Folder exists
      folderId = folderList.data.files[0].id;
      console.log("Folder found with ID:", folderId);
    }
  } catch (error) {
    console.error("Error checking folder existence:", error);
    throw new Error("Failed to check or create folder on Google Drive.");
  }

  // 2. Upload Resume PDF to the folder
  const pdfFileName = `${resumeData.name}.pdf`;
  let pdfFileId;
  try {
    const pdfResponse = await drive.files.create({
      requestBody: {
        name: pdfFileName,
        mimeType: "application/pdf",
        parents: [folderId], // Upload to the user folder inside the main folder
      },
      media: {
        mimeType: "application/pdf",
        body: fs.createReadStream(filePath),
      },
    });

    pdfFileId = pdfResponse.data.id;
    console.log("PDF uploaded with ID:", pdfFileId);
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw new Error("Failed to upload PDF to Google Drive.");
  }

  // 3. Upload the user's photo to the same folder
  let photoFileId;
  if (photoPath) {
    try {
      const photoFileName = `${resumeData.name}_photo.jpg`;  // Assuming it's a .jpg file, adjust as needed
      const photoResponse = await drive.files.create({
        requestBody: {
          name: photoFileName,
          mimeType: "image/jpeg",  // Adjust mime type if necessary
          parents: [folderId],     // Upload photo to the same folder
        },
        media: {
          mimeType: "image/jpeg",  // Adjust mime type if necessary
          body: fs.createReadStream(photoPath),
        },
      });

      photoFileId = photoResponse.data.id;
      console.log("Photo uploaded with ID:", photoFileId);
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw new Error("Failed to upload photo to Google Drive.");
    }
  }

  // 4. Create Metadata file and upload to Google Drive (without the photo field)
  const metadataFileName = `${resumeData.name}_metadata.json`;

  // Remove the photo information from the metadata object
  const {  ...metadataWithoutPhoto } = resumeData;  // Destructure to exclude 'photo'

  const metadataContent = JSON.stringify(metadataWithoutPhoto, null, 2);
  const metadataFilePath = path.join(process.cwd(), metadataFileName);

  let metadataFileId; // Declare this variable at the beginning
  try {
    fs.writeFileSync(metadataFilePath, metadataContent);
    console.log("Metadata file created:", metadataFileName);

    const metadataResponse = await drive.files.create({
      requestBody: {
        name: metadataFileName,
        mimeType: "application/json",
        parents: [folderId], // Upload metadata file to the user folder
      },
      media: {
        mimeType: "application/json",
        body: fs.createReadStream(metadataFilePath),
      },
    });

    metadataFileId = metadataResponse.data.id;
    console.log("Metadata uploaded with ID:", metadataFileId);

    // Clean up metadata file from local storage
    fs.removeSync(metadataFilePath);
  } catch (error) {
    console.error("Error creating or uploading metadata:", error);
    throw new Error("Failed to upload metadata file to Google Drive.");
  }

  // Return the uploaded file IDs
  return {
    pdfFileId,
    metadataFileId,
    photoFileId,  // Return photo ID if uploaded
  };
}

import path from 'path';
import fs from 'fs';
import client, { download_File, getFiles } from '../db/connectDB.js'; 
import cloudinary from 'cloudinary';


const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Upload file controller
export const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { originalname, filename, mimetype } = req.file;
    const userId = req.userId;

    try {
        // Upload file to Cloudinary
        const filePath = req.file.path; // Multer temporary file path
        let cloudinaryResult;

        if (mimetype === 'application/pdf' || mimetype.startsWith('image/')) {
            cloudinaryResult = await cloudinary.v2.uploader.upload(filePath, {
                resource_type: mimetype === 'application/pdf' ? 'raw' : 'image',
                public_id: `${userId}_${Date.now()}_${originalname}`
            });
        }

        // If file upload is successful on Cloudinary
        const fileUrl = cloudinaryResult.secure_url;
        const createdAt = new Date();

        const query = `
        INSERT INTO files (user_id, filename, file_path, created_at)
        VALUES ($1, $2, $3, $4) RETURNING *`;

        const values = [userId, originalname, fileUrl, createdAt];
        const result = await client.query(query, values);

        // Send a success response with Cloudinary file URL
        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Cloudinary',
            file: result.rows[0] // Return the newly created file metadata
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ success: false, message: `Error uploading file: ${error.message}` });
    }
};

// Fetch user files controller
export const getUserFiles = async (req, res) => {
    const userId = req.userId; 

    try {
        const result = await getFiles(userId);

        // Check if getFiles returned a valid result
        if (!result || result.rows.count === 0) {
            console.log(userId)
            console.log('No files found for this user');
            return res.status(404).json({
                success: false,
                message: 'No files found for this user'
            });
        }

        res.status(200).json({
            success: true,
            files: result.rows
        });
    } catch (error) {
        console.log(userId)
        console.error('Error fetching user files:', error);
        res.status(500).json({ success: false, message: 'Error fetching files' });
    }
};

// File download controller
export const downloadFile = async (req, res) => {
    const { fileId } = req.params;
    const userId = req.userId;

    try {
        // Fetch the file from the database
        const result = await download_File(fileId, userId);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        const file = result.rows[0];
        const filePath = file.file_path;

        // Check if the file exists on the server
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf'); // Update if necessary for other file types
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

        // Send the file for download
        res.download(filePath);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ success: false, message: 'Error downloading file' });
    }
};

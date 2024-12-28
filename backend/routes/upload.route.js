import { downloadFile, uploadFile, getUserFiles } from '../controllers/upload.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import router from './auth.route.js'
import multer from 'multer';
import cloudinary from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype === 'application/pdf' ? '.pdf' : '.jpg'; 
        cb(null, Date.now() + ext); // Save with unique name and correct extension
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true); 
        } else {
            cb(new Error('Only image and PDF files are allowed!'), false);
        }
    }
});



router.post('/upload', verifyToken, upload.single('file'), uploadFile);

router.get('/user-files', verifyToken, getUserFiles);

router.get('/download/:fileId', verifyToken, downloadFile);

export default router
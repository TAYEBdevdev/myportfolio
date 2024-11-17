require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TPtable = require("./db");

const bucket = require("./firebaseconfig");
const serverless = require('serverless-http');

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.static('public'));
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Set up storage for uploaded files using multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './upload'); // Set file upload destination
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname); // Set unique filename
    }
});

const upload = multer({ storage: storage });

// Routes

// Endpoint to get all TP records
app.get('/getallTP', async (req, res) => {
    try {
        const TP = await TPtable.find({});
        res.json({ TP });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to add a new TP record
app.post('/addTP', async (req, res) => {
    const newTP = new TPtable(req.body);
    try {
        const TP = await newTP.save();
        res.json({ TP });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to handle file uploads and Firebase Storage
app.post('/uploadfile/:id', upload.array("files", 5), async (req, res) => {
    try {
        const filesUrl = [];
        const filesNameInMongo = [];

        // Ensure files are uploaded and present in the request
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                // Create the file path for the local file
                const filePath = path.join(__dirname, 'upload', file.filename);

                // Upload the file to Firebase Storage
                const [uploadedFile] = await bucket.upload(filePath, {
                    destination: `uploads/${file.filename}`, // Path in Firebase Storage
                    metadata: { contentType: file.mimetype },
                });

                // Remove the local file after uploading
                fs.unlinkSync(filePath);

                // Get the public URL of the uploaded file
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uploadedFile.name}`;
                filesUrl.push(publicUrl);
                filesNameInMongo.push(file.originalname);
            }
        } else {
            return res.status(400).json({ message: 'No files were uploaded.' });
        }

        // Update the TP document in MongoDB with the filenames
        const TP = await TPtable.findByIdAndUpdate(req.params.id, {
            files: filesNameInMongo,
        }, { new: true });

        res.json({ TP, filesUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to download files from Firebase Storage
app.get("/downloadfile/:id", async (req, res) => {
    try {
        const TP = await TPtable.findById(req.params.id);
        if (!TP) {
            return res.status(400).json({
                status: 'fail',
                message: 'No TPtable found'
            });
        }

        const fileNames = TP.files;
        for (let fileName of fileNames) {
            const file = bucket.file(`uploads/${fileName}`);
            const [exist] = await file.exists();
            if (!exist) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'File not found in storage'
                });
            }

            const tempFilePath = path.join(__dirname, 'upload', fileName);
            console.log(tempFilePath)
            await file.download({ destination: tempFilePath });

            // Send file for download
            res.download(tempFilePath, (err) => {
                if (err) {
                    return res.status(500).json({
                        status: 'fail download',
                        message: err.message
                    });
                }
                fs.unlinkSync(tempFilePath); // Delete the temp file after download
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
});
// use the client app 
app.use(express.static(path.join(__dirname, 'client')))

// render client application
app.get("*", (req, res) => res.sendFile(path.join(__dirname, 'client/index.html')))
app.listen(3000, () => {
    console.log("Server running on port  3000")
})
// Netlify Function Export
module.exports.handler = serverless(app);

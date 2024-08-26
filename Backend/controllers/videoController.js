
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { sendMail } = require('../utils/mailer'); 


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);


const convertToMp4 = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
};


const uploadToS3 = async (filePath, fileName) => {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileStream,
    ACL: 'public-read',
    ContentType: 'video/mp4',
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (err) {
    throw err;
  }
};


const uploadVideo = async (req, res) => {
     try {
       const file = req.files[0];
       const inputPath = file.path;
       const isMp4 = file.mimetype === 'video/mp4';
       let outputPath = inputPath;
       let uploadFileName = file.originalname;
   
       
       if (!isMp4) {
         outputPath = path.join('uploads', `${Date.now()}-${file.originalname}.mp4`);
         await convertToMp4(inputPath, outputPath);
         uploadFileName = path.basename(outputPath);
         fs.unlinkSync(inputPath); 
       }
   
      
       const videoUrl = await uploadToS3(outputPath, uploadFileName);
   
       if (!isMp4) {
         fs.unlinkSync(outputPath); 
       }
   
      
       const recipientEmail = req.body.email;
       const mailSubject = 'Video Upload Status';
       const mailText = `Your video has been successfully uploaded and is available at the following link: ${videoUrl}`;
       const mailHtml = `<p>Your video has been successfully uploaded and is available at the following link:</p><a href="${videoUrl}">${videoUrl}</a>`;
   
       await sendMail(recipientEmail, mailSubject, mailText, mailHtml);
   
       res.json({ videoUrls: [videoUrl], message: 'Video uploaded and email sent successfully' });
     } catch (error) {
       console.error('Error processing video upload:', error);
       res.status(500).json({ error: 'Error processing video upload' });
     }
   };

module.exports = { uploadVideo };

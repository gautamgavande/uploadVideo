import React, { useState, useRef } from 'react';
import axios from 'axios';
import './Uploader.css';

const Uploader = () => {
    const [videoFiles, setVideoFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});

    const fileInputRef = useRef(null);

    const handleVideoSelection = (event) => {
        const files = Array.from(event.target.files);
        const validVideos = files.filter((file) => file.type.includes('video'));
        setVideoFiles(validVideos);

        const initialStatus = {};
        validVideos.forEach((file, index) => {
            initialStatus[index] = 'Pending';
        });
        setUploadStatus(initialStatus);
    };

    const uploadVideo = async (file, index) => {
        const formData = new FormData();
        formData.append('videos', file);

        try {
            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [index]: 'Processing',
            }));

            const response = await axios.post('http://localhost:3000/api/v1/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress((prevProgress) => ({
                        ...prevProgress,
                        [index]: percentCompleted,
                    }));
                },
            });

            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [index]: 'Completed',
            }));

        } catch (error) {
            console.error('Error uploading video:', error);
            setUploadStatus((prevStatus) => ({
                ...prevStatus,
                [index]: 'Failed',
            }));
        }
    };

    const handleUploadAllVideos = async () => {
        for (let i = 0; i < videoFiles.length; i++) {
            await uploadVideo(videoFiles[i], i);
        }
    };

    const handleCancelAll = () => {
      
        setVideoFiles([]);
        setUploadProgress({});
        setUploadStatus({});
    };

    const handleCancelUpload = (index) => {
      
        setVideoFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setUploadProgress((prevProgress) => {
            const newProgress = { ...prevProgress };
            delete newProgress[index];
            return newProgress;
        });
        setUploadStatus((prevStatus) => {
            const newStatus = { ...prevStatus };
            delete newStatus[index];
            return newStatus;
        });
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        handleVideoSelection({ target: { files } });
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="uploader">
           
            <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoSelection}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />

           
            <div
                className="drop-area"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <span className="upload-icon">⬆️</span>
                <p>Drop Files & Folders Here</p>
                <button className="browse-button" onClick={handleBrowseClick}>
                    Or Browse
                </button>            </div>

            <button className="upload-button" onClick={handleUploadAllVideos}>
                Upload Videos
            </button>


            {videoFiles.length > 0 && (
                <div className="uploading-ui">
                    <div className="header">
                        <span>{videoFiles.length} selected</span>
                        <button onClick={handleCancelAll}>
                            <span className="cancel-icon">🚫</span> CANCEL ALL
                        </button>
                    </div>
                    <div className="uploads">
                        {videoFiles.map((file, index) => (
                            <div key={index} className="upload-item">
                                <span className="file-icon">📄</span>
                                <div className="upload-details">
                                    <span className="file-name">{file.name}</span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress"
                                            style={{ width: `${uploadProgress[index] || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="upload-status">
                                        {uploadStatus[index] === 'Processing' ||
                                            uploadStatus[index] === 'Pending'
                                            ? `${uploadStatus[index]} (${uploadProgress[index] || 0}%)`
                                            : uploadStatus[index]}
                                    </span>
                                </div>
                                <button onClick={() => handleCancelUpload(index)}>
                                    <span className="cancel-icon">✕</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
export default Uploader;
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import Navbar from '../components/Navbar';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const { isLoading, FileUpload, FetchFiles } = useAuthStore();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await FileUpload(formData);
      toast.success("File uploaded successfully");
      fetchFilesFromServer();  
      setFile(null);
    } catch (err) {
      console.log("Error occurred while uploading file", err);
      toast.error("Error uploading file");
    }
  };

  const fetchFilesFromServer = async () => {
    try {
      await FetchFiles();
      
      const { files } = useAuthStore.getState();  
      console.log("Files from state:", files);

      if (files) {
        const updatedFiles = files.map((file) => ({
          id: file.id, 
          filename: file.filename, 
          downloadUrl: `/api/download/${file.id}`
        }));

        setFiles(updatedFiles); 
      } else {
        console.error('No files found in the response');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files from server:', error);
      toast.error("Error fetching files");
    }
  };

  useEffect(() => {
    fetchFilesFromServer();
  }, []);

  const handleDownload = async (fileId) => {
    try {
      const response = await axios({
        url: `/api/download/${fileId}`,
        method: 'GET',
        responseType: 'blob',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file-${fileId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error("Error downloading file");
    }
  };

  return (
    <>
      <Navbar />
    <div className="file-upload-container min-h-screen items-center justify-center relative overflow-hidden mt-5">
      <h1 className='h1 text-info flex justify-center'>Upload and Manage Your Files</h1>

      <form onSubmit={handleSubmit} className="upload-form flex justify-center m-4 p-2 px-5 vw-20">
        <input type="file" className='w-120 btn btn-secondary flex justify-end p-1 px-5 mx-3vw' onChange={handleFileChange} />
        <button type="submit" className='btn btn-primary mx-5' disabled={isLoading}>Upload</button>
      </form>

      <div className="files-list p-5 flex flex-col items-center justify-center">
      <h2 className='h2 text-info px-5 flex mb-4'>Your Files</h2>
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.id} className="file-item flex p-1 w-150 justify-between border border-primary mb-2 bg-light p-2 col-8">
              <p className='fs-5 text-secondary-emphasis flex align-center fs-3'>{file.filename}</p>
              <button className="btn btn-primary mx-5 bg-lg" onClick={() => handleDownload(file.id)} >
                Download
              </button>
            </div>
          ))
        ) : (
          <p>No files available</p>
        )}
      </div>
    </div>
    </>
  );
};

export default FileUpload;

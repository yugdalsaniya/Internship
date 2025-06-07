import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { BsEye, BsLightbulb } from 'react-icons/bs';
import { BiTime } from 'react-icons/bi';
import { AiFillFilePdf } from 'react-icons/ai'; // Icon for PDF
import { MdDelete } from 'react-icons/md'; // Icon for delete
import { uploadAndStoreFile, mUpdate, fetchSectionData } from '../../Utils/api'; // Import API functions
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

function Resume() {
  const [selectedFile, setSelectedFile] = useState(null); // State for selected file
  const [isProcessing, setIsProcessing] = useState(false); // State for processing status
  const [resumeUrl, setResumeUrl] = useState(''); // State for existing resume URL
  const navigate = useNavigate();

  // Fetch the existing resume URL when the component mounts
  useEffect(() => {
    const fetchUserResume = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.userid;
        if (!userId) {
          console.error('User ID not found in localStorage');
          return;
        }

        const response = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userId },
          projection: { 'sectionData.appuser.resume': 1 },
        });

        const userData = response[0]; // Assuming the response is an array with one user
        const existingResume = userData?.sectionData?.appuser?.resume || '';
        setResumeUrl(existingResume);
      } catch (err) {
        console.error('Error fetching resume:', err);
        toast.error('Failed to load existing resume. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    };

    fetchUserResume();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userid;
      console.log('User ID:', userId);

      if (!userId) {
        throw new Error('Please log in to upload your resume.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      // Upload file using uploadAndStoreFile
      console.log('Attempting to upload resume:', file.name, 'for user:', userId);
      const uploadResponse = await uploadAndStoreFile({
        appName: 'app8657281202648',
        moduleName: 'appuser',
        file,
        userId,
      });

      console.log('Upload response:', uploadResponse);

      const uploadedFilePath = uploadResponse?.filePath || uploadResponse?.fileUrl || uploadResponse?.data?.fileUrl;
      if (!uploadedFilePath) {
        throw new Error('Failed to upload resume: No file path returned in response.');
      }

      // Update the user document with the resume file path
      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: {
            'sectionData.appuser.resume': uploadedFilePath,
          },
        },
        options: { upsert: true, writeConcern: { w: 'majority' } },
      });

      console.log('mUpdate response for resume:', updateResponse);

      if (updateResponse && updateResponse.success) {
        toast.success('Resume uploaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setResumeUrl(uploadedFilePath); // Update the UI with the new resume URL
      } else {
        throw new Error('Failed to save resume to database.');
      }
    } catch (err) {
      console.error('Error uploading resume:', err.response?.data || err.message);
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      toast.error(errorMessage || 'Failed to upload resume. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
    }
  };

  const handleDeleteResume = async () => {
    setIsProcessing(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userid;
      if (!userId) {
        throw new Error('Please log in to delete your resume.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      // Update the user document to remove the resume
      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: {
            'sectionData.appuser.resume': '', // Clear the resume field
          },
        },
        options: { upsert: true, writeConcern: { w: 'majority' } },
      });

      console.log('mUpdate response for delete:', updateResponse);

      if (updateResponse && updateResponse.success) {
        toast.success('Resume deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setResumeUrl(''); // Clear the UI
      } else {
        throw new Error('Failed to delete resume from database.');
      }
    } catch (err) {
      console.error('Error deleting resume:', err.response?.data || err.message);
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      toast.error(errorMessage || 'Failed to delete resume. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank'); // Open the resume in a new tab
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Toast Container */}
      <ToastContainer />

      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Resume</span>
        </div>
        {/* <div className="flex items-center gap-4 text-gray-600 text-xl">
          <BsEye className="cursor-pointer hover:text-blue-600" />
          <BsLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div> */}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Resume Field */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Resume<span className="text-red-500 ml-1">*</span>
            <a href="#" className="text-blue-600 text-sm float-right hover:underline">
              Create
            </a>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Remember that one-pager that highlights how amazing you are? Time to let employers notice your potential through it.
          </p>
        </div>

        {/* Display Existing Resume or Upload Box */}
        {resumeUrl ? (
          <div className="flex items-center justify-between border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center">
              <AiFillFilePdf className="text-red-500 text-2xl mr-3" />
              <span className="text-gray-700">
                {selectedFile?.name || 'Yash Varmora-resume'} {/* Display file name */}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <BsEye
                className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                onClick={handleViewResume}
              />
              <MdDelete
                className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                onClick={handleDeleteResume}
                disabled={isProcessing}
              />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-400 rounded-lg p-6 text-center bg-white shadow-sm">
            <label htmlFor="resumeUpload" className="cursor-pointer block">
              <div className="flex flex-col items-center">
                <FaCloudUploadAlt className="text-4xl text-blue-500 mb-2" />
                <span className="text-blue-600 font-medium hover:underline">
                  Update Resume
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  Supported file formats DOC, DOCX, PDF. File size limit 10 MB.
                </p>
              </div>
              <input
                type="file"
                id="resumeUpload"
                className="hidden"
                accept=".doc,.docx,.pdf"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resume;
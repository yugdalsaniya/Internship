import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';
import { BsEye } from 'react-icons/bs';
import { BiTime } from 'react-icons/bi';
import { AiFillFilePdf } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { uploadAndStoreFile, mUpdate, fetchSectionData } from '../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Resume({ userData, updateCompletionStatus }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserResume = async () => {
      try {
        const userId = userData.userid;
        if (!userId) {
          console.error('User ID not found in userData:', userData);
          toast.error('Please log in to view your resume.', {
            position: 'top-right',
            autoClose: 5000,
          });
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('Access token missing in localStorage');
          toast.error('Authentication required. Please log in.', {
            position: 'top-right',
            autoClose: 5000,
          });
          navigate('/login');
          return;
        }

        // Retry logic for API call
        const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              return await fn();
            } catch (err) {
              if (i === retries - 1) throw err;
              console.warn(`Retry ${i + 1} for fetchSectionData:`, err.message);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        };

        const response = await fetchWithRetry(() =>
          fetchSectionData({
            collectionName: 'appuser',
            query: { _id: userId },
            projection: { 'sectionData.appuser.resume': 1 },
          })
        );

        console.log('fetchSectionData response for Resume:', JSON.stringify(response, null, 2));
        const apiData = response[0];
        if (!apiData) {
          console.warn('No user data returned from API, setting default resume state');
          setResumeUrl('');
          setIsCompleted(false);
          if (updateCompletionStatus) {
            updateCompletionStatus('Resume', false);
          }
          return;
        }

        const existingResume = apiData?.sectionData?.appuser?.resume || '';
        setResumeUrl(existingResume);
        setIsCompleted(!!existingResume);
        if (updateCompletionStatus) {
          updateCompletionStatus('Resume', !!existingResume);
          console.log('Updated completion status for Resume:', !!existingResume);
        }
      } catch (err) {
        console.error('Error fetching resume:', err.message, err.stack);
        let errorMessage = 'Failed to load existing resume. Please try again.';
        if (err.response?.status === 404) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          navigate('/login');
        }
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
        });
        // Fallback to incomplete state
        setIsCompleted(false);
        if (updateCompletionStatus) {
          updateCompletionStatus('Resume', false);
        }
      }
    };

    fetchUserResume();
  }, [userData.userid, updateCompletionStatus, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const userId = userData.userid;
      if (!userId) {
        throw new Error('Please log in to upload your resume.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a DOC, DOCX, or PDF file.');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10 MB limit.');
      }

      const uploadResponse = await uploadAndStoreFile({
        appName: 'app8657281202648',
        moduleName: 'appuser',
        file,
        userId,
      });

      const uploadedFilePath = uploadResponse?.filePath || uploadResponse?.fileUrl || uploadResponse?.data?.fileUrl;
      if (!uploadedFilePath) {
        throw new Error('Failed to upload resume: No file path returned in response.');
      }

      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: {
            'sectionData.appuser.resume': uploadedFilePath,
          },
        },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (
        updateResponse &&
        (updateResponse.success ||
          updateResponse.modifiedCount > 0 ||
          updateResponse.matchedCount > 0)
      ) {
        if (updateResponse.matchedCount === 0) {
          throw new Error('Failed to update user data: User not found.');
        }
        if (updateResponse.upsertedId) {
          throw new Error('Unexpected error: New user created instead of updating.');
        }
        toast.success('Resume uploaded successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setResumeUrl(uploadedFilePath);
        setIsCompleted(true);
        if (updateCompletionStatus) {
          updateCompletionStatus('Resume', true);
        }
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
        navigate('/login');
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
      const userId = userData.userid;
      if (!userId) {
        throw new Error('Please log in to delete your resume.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: {
            'sectionData.appuser.resume': '',
          },
        },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (
        updateResponse &&
        (updateResponse.success ||
          updateResponse.modifiedCount > 0 ||
          updateResponse.matchedCount > 0)
      ) {
        if (updateResponse.matchedCount === 0) {
          throw new Error('Failed to update user data: User not found.');
        }
        if (updateResponse.upsertedId) {
          throw new Error('Unexpected error: New user created instead of updating.');
        }
        toast.success('Resume deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setResumeUrl('');
        setIsCompleted(false);
        if (updateCompletionStatus) {
          updateCompletionStatus('Resume', false);
        }
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
        navigate('/login');
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
      window.open(resumeUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer />
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          <span>Resume</span>
        </div>
      </div>
      <div className="p-6">
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
        {resumeUrl ? (
          <div className="flex items-center justify-between border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center">
              <AiFillFilePdf className="text-red-500 text-2xl mr-3" />
              <span className="text-gray-700">
                {selectedFile?.name || resumeUrl.split('/').pop() || 'Resume'}
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
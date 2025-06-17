import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { mUpdate, fetchSectionData } from '../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function About({ userData, updateCompletionStatus }) {
  const [aboutText, setAboutText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const maxLength = 1000;

  useEffect(() => {
    console.log('About useEffect triggered with userData.userid:', userData.userid);
    const fetchUserAbout = async () => {
      try {
        const userId = userData.userid;
        if (!userId) {
          console.error('User ID not found in userData:', userData);
          toast.error('Please log in to view your about text.', {
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
            projection: { 'sectionData.appuser.about': 1 },
          })
        );

        console.log('fetchSectionData response for About:', JSON.stringify(response, null, 2));
        const apiData = response[0];
        if (!apiData) {
          console.warn('No user data returned from API, keeping current aboutText');
          setIsCompleted(false);
          if (updateCompletionStatus) {
            updateCompletionStatus('About', false);
          }
          return;
        }

        const existingAbout = apiData?.sectionData?.appuser?.about || '';
        if (!aboutText) {
          setAboutText(existingAbout);
          console.log('Set aboutText from API:', existingAbout);
        }
        setIsCompleted(!!existingAbout.trim());
        if (updateCompletionStatus) {
          updateCompletionStatus('About', !!existingAbout.trim());
          console.log('Updated completion status for About:', !!existingAbout.trim());
        }
      } catch (err) {
        console.error('Error fetching about text:', err.message, err.stack);
        let errorMessage = 'Failed to load existing about text. Please try again.';
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
        setIsCompleted(false);
        if (updateCompletionStatus) {
          updateCompletionStatus('About', false);
        }
      }
    };

    fetchUserAbout();
  }, [userData.userid, updateCompletionStatus, navigate]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    console.log('handleTextChange:', { oldText: aboutText, newText });
    setAboutText(newText);
  };

  const handleSave = async () => {
    if (aboutText.length > maxLength) {
      toast.error(`About text exceeds ${maxLength} characters. Please shorten it.`, {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    if (!aboutText.trim()) {
      toast.error('About text cannot be empty.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      const userId = userData.userid;
      if (!userId) {
        throw new Error('Please log in to save your about text.');
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
            'sectionData.appuser.about': aboutText.trim(),
          },
        },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      console.log('mUpdate response for about:', updateResponse);

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
        toast.success('About text saved successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsCompleted(true);
        if (updateCompletionStatus) {
          updateCompletionStatus('About', true);
          console.log('Updated completion status for About: true');
        }
      } else {
        throw new Error('Failed to save about text to database.');
      }
    } catch (err) {
      console.error('Error saving about text:', err.response?.data || err.message);
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/login');
      }
      toast.error(errorMessage || 'Failed to save about text. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setIsCompleted(false);
      if (updateCompletionStatus) {
        updateCompletionStatus('About', false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  console.log('Rendering About:', { isCompleted, aboutText });

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer />
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-400 text-xl" />
          )}
          <span>About</span>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            About Me<span className="text-red-500 ml-1">*</span>
          </p>
          <p className="text-gray-500 text-sm mb-2">
            Maximum {maxLength} characters ({aboutText.length}/{maxLength})
          </p>
          <textarea
            className="w-full border rounded-lg p-2 resize-none"
            rows="5"
            placeholder="Introduce yourself here! Share a brief overview of who you are, your interests, and connect with fellow users, recruiters & organizers."
            value={aboutText}
            onChange={handleTextChange}
            maxLength={maxLength}
            disabled={isProcessing}
          />
          <button
            className="mt-2 px-4 py-2 border rounded-full text-blue-600 opacity-50 cursor-not-allowed hover:bg-blue-50 transition"
            disabled
          >
            Generate with AI
          </button>
        </div>
      </div>
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="text-lg">⏳</span>
            ) : (
              <span className="text-lg">✓</span>
            )}
            {isProcessing ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default About;
import { useState, useEffect } from 'react';
import { FaCheckCircle, FaEye, FaRegLightbulb } from 'react-icons/fa';
import { mUpdate, fetchSectionData } from '../../Utils/api'; // Import API functions
import { ToastContainer, toast } from 'react-toastify'; // Import react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

function About() {
  const [aboutText, setAboutText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const maxLength = 1000; // Maximum character limit

  // Fetch existing about text when the component mounts
  useEffect(() => {
    const fetchUserAbout = async () => {
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
          projection: { 'sectionData.appuser.about': 1 },
        });

        const userData = response[0]; // Assuming the response is an array with one user
        const existingAbout = userData?.sectionData?.appuser?.about || '';
        setAboutText(existingAbout);
      } catch (err) {
        console.error('Error fetching about text:', err);
        toast.error('Failed to load existing about text. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    };

    fetchUserAbout();
  }, []);

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userid;
      if (!userId) {
        throw new Error('Please log in to save your about text.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      // Update the user document with the about text
      const updateResponse = await mUpdate({
        appName: 'app8657281202648', // Match the appName from your API response
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: {
            'sectionData.appuser.about': aboutText,
          },
        },
        options: { upsert: true, writeConcern: { w: 'majority' } },
      });

      console.log('mUpdate response for about:', updateResponse);

      if (updateResponse && updateResponse.success) {
        toast.success('saved successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
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
      }
      toast.error(errorMessage || 'Failed to save about text. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Toast Container */}
      <ToastContainer />

      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <FaCheckCircle className="text-green-500" />
          <span>About</span>
        </div>
        {/* <div className="flex items-center gap-4 text-gray-600 text-xl">
          <FaEye className="cursor-pointer hover:text-blue-600" />
          <FaRegLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div> */}
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            About Me<span className="text-red-500 ml-1">*</span>
          </p>
          <p className="text-gray-500 text-sm mb-2">
            Maximum {maxLength} characters can be added ({aboutText.length}/{maxLength})
          </p>
          <textarea
            className="w-full border rounded-lg p-2 resize-none"
            rows="5"
            placeholder="Introduce yourself here! Share a brief overview of who you are, your interests, and connect with fellow users, recruiters & organizers."
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            maxLength={maxLength}
            disabled={isProcessing}
          />
          <button className="mt-2 px-4 py-2 border rounded-full text-blue-600 opacity-50 cursor-not-allowed hover:bg-blue-50 transition"
          disabled
          >
            Generate with AI
          </button>
        </div>
      </div>

      {/* Fixed Save Button */}
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
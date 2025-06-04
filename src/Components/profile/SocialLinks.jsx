import React, { useState, useEffect } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';
import { fetchSectionData, mUpdate } from './../../Utils/api';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SocialLinks() {
  const [links, setLinks] = useState({
    LinkedIn: '',
    Facebook: '',
    Instagram: '',
    Twitter: '',
    Git: '',
    Medium: '',
    Reddit: '',
    Slack: '',
    Dribbble: '',
    Behance: '',
  });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem('user');
        let userIdLocal;
        if (!userString) {
          setError('Please log in to view your details.');
          return;
        }
        try {
          const user = JSON.parse(userString);
          userIdLocal = user.userid;
          setUserId(userIdLocal);
        } catch (parseError) {
          setError('Invalid user data. Please log in again.');
          return;
        }

        const data = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userIdLocal },
          dbName: 'internph',
        });

        if (data.length > 0 && data[0].sectionData?.appuser) {
          const user = data[0].sectionData.appuser;
          setLinks({
            LinkedIn: user.linkedIn || '',
            Facebook: user.facebook || '',
            Instagram: user.instagram || '',
            Twitter: user.twitter || '',
            Git: user.git || '',
            Medium: user.medium || '',
            Reddit: user.reddit || '',
            Slack: user.slack || '',
            Dribbble: user.dribbble || '',
            Behance: user.behance || '',
          });
        } else {
          setError('User data not found. Please ensure your account exists.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again.');
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (platform, value) => {
    setError('');
    setLinks((prevLinks) => ({
      ...prevLinks,
      [platform]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true); // Set loading to true
      if (!userId) {
        setError('Please log in to save details.');
        return;
      }

      const updateData = {
        'sectionData.appuser.linkedIn': links.LinkedIn,
        'sectionData.appuser.facebook': links.Facebook,
        'sectionData.appuser.instagram': links.Instagram,
        'sectionData.appuser.twitter': links.Twitter,
        'sectionData.appuser.git': links.Git,
        'sectionData.appuser.medium': links.Medium,
        'sectionData.appuser.reddit': links.Reddit,
        'sectionData.appuser.slack': links.Slack,
        'sectionData.appuser.dribbble': links.Dribbble,
        'sectionData.appuser.behance': links.Behance,
        'editedAt': new Date().toISOString(),
      };

      await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: updateData },
        options: { upsert: false },
      });

      console.log('Social links updated successfully:', updateData);
      toast.success('Social links updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error updating social links:', error);
      setError(error.message || 'Failed to update social links. Please try again.');
      toast.error('Failed to update social links. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer />
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Social Links</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-xl">
          <FaEye className="cursor-pointer hover:text-blue-600" />
          <FaRegLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Social Links
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'LinkedIn',
              'Facebook',
              'Instagram',
              'Twitter',
              'Git',
              'Medium',
              'Reddit',
              'Slack',
              'Dribbble',
              'Behance',
            ].map((platform) => (
              <div key={platform}>
                <label className="block text-sm text-gray-600 mb-1">{platform}</label>
                <input
                  type="text"
                  placeholder={`Add ${platform} Link`}
                  className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={links[platform]}
                  onChange={(e) => handleInputChange(platform, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
              isLoading || error ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !!error}
          >
            <span className="text-lg">✓</span> {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialLinks;
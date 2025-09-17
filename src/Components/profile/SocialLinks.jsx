import React, { useState, useEffect } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaCheckCircle } from 'react-icons/fa';
import { fetchSectionData, mUpdate } from './../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SocialLinks({ userData, updateCompletionStatus }) {
  const [links, setLinks] = useState({
    LinkedIn: '',
    Facebook: '',
    Instagram: '',
    X: '',
    Git: '',
    Medium: '',
    Reddit: '',
    Slack: '',
    Dribbble: '',
    Behance: '',
  });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userIdLocal = userData.userid;
        if (!userIdLocal) {
          setError('Please log in to view your details.');
          toast.error('Please log in to view your details.', {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }
        setUserId(userIdLocal);
        setIsLoading(true);
        const data = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userIdLocal },
          dbName: 'internph',
        });

        if (data.length > 0 && data[0].sectionData?.appuser) {
          const user = data[0].sectionData.appuser;
          const fetchedLinks = {
            LinkedIn: user.linkedIn || '',
            Facebook: user.facebook || '',
            Instagram: user.instagram || '',
            X: user.x || '',
            Git: user.git || '',
            Medium: user.medium || '',
            Reddit: user.reddit || '',
            Slack: user.slack || '',
            Dribbble: user.dribbble || '',
            Behance: user.behance || '',
          };
          setLinks(fetchedLinks);
          const hasLinks = Object.values(fetchedLinks).some((link) => link.trim() !== '');
          setIsCompleted(hasLinks);
        } else {
          setError('User data not found. Please ensure your account exists.');
          toast.error('User data not found. Please ensure your account exists.', {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again.');
        toast.error('Failed to load user data. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userData]);

  useEffect(() => {
    if (updateCompletionStatus) {
      updateCompletionStatus('Social Links', isCompleted);
    }
  }, [isCompleted, updateCompletionStatus]);

  const isValidUrl = (url) => {
    if (!url.trim()) return true; // Allow empty strings
    try {
      new URL(url);
      return url.match(/^(https?:\/\/)/) !== null;
    } catch {
      return false;
    }
  };

  const handleInputChange = (platform, value) => {
    setError('');
    setLinks((prevLinks) => ({
      ...prevLinks,
      [platform]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (!userId) {
        setError('Please log in to save details.');
        toast.error('Please log in to save details.', {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      // Validate all non-empty links
      const invalidLinks = Object.entries(links).filter(
        ([platform, link]) => link.trim() !== '' && !isValidUrl(link)
      );

      if (invalidLinks.length > 0) {
        const invalidPlatforms = invalidLinks.map(([platform]) => platform).join(', ');
        const errorMessage = `Please enter valid URLs for: ${invalidPlatforms}`;
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }

      const updateData = {
        'sectionData.appuser.linkedIn': links.LinkedIn,
        'sectionData.appuser.facebook': links.Facebook,
        'sectionData.appuser.instagram': links.Instagram,
        'sectionData.appuser.x': links.X,
        'sectionData.appuser.git': links.Git,
        'sectionData.appuser.medium': links.Medium,
        'sectionData.appuser.reddit': links.Reddit,
        'sectionData.appuser.slack': links.Slack,
        'sectionData.appuser.dribbble': links.Dribbble,
        'sectionData.appuser.behance': links.Behance,
        'editedAt': new Date().toISOString(),
      };

      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: updateData },
        options: { upsert: false },
      });

      if (
        response &&
        (response.success ||
          response.modifiedCount > 0 ||
          response.matchedCount > 0)
      ) {
        if (response.matchedCount === 0) {
          throw new Error("Failed to update social links: User not found.");
        }
        if (response.upsertedId) {
          throw new Error("Unexpected error: New user created instead of updating.");
        }
        toast.success('Social links updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        const hasLinks = Object.values(links).some((link) => link.trim() !== '');
        setIsCompleted(hasLinks);
      } else {
        throw new Error("Failed to update social links in database.");
      }
    } catch (error) {
      console.error('Error updating social links:', error.response?.data || error.message);
      let errorMessage = error.message || 'Failed to update social links. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
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
            <BiTime className="text-gray-400 text-xl" />
          )}
          <span>Social Links</span>
        </div>
      </div>

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
              'X',
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
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
              isLoading || error ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !!error}
            aria-label="Save Social Links"
          >
            <span className="text-lg">✓</span> {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialLinks;
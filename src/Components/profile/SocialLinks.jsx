import { useState } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';

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

  const handleInputChange = (platform, value) => {
    setLinks((prevLinks) => ({
      ...prevLinks,
      [platform]: value,
    }));
  };

  const handleSave = () => {
    console.log('Social Links saved:', links);
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
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
                  placeholder="Add Link"
                  className="w-full border rounded-lg p-2"
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
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            <span className="text-lg">✓</span> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SocialLinks;
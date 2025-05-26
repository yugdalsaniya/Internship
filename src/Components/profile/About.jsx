import { useState } from 'react';
import { FaCheckCircle, FaEye, FaRegLightbulb } from 'react-icons/fa';

function About() {
  const [aboutText, setAboutText] = useState('');

  const handleSave = () => {
    console.log('About saved:', aboutText);
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <FaCheckCircle className="text-green-500" />
          <span>About</span>
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
            About Me<span className="text-red-500 ml-1">*</span>
          </p>
          <p className="text-gray-500 text-sm mb-2">
            Maximum 1000 characters can be added
          </p>
          <textarea
            className="w-full border rounded-lg p-2 resize-none"
            rows="5"
            placeholder="Introduce yourself here! Share a brief overview of who you are, your interests, and connect with fellow users, recruiters & organizers."
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
          />
          <button className="mt-2 px-4 py-2 border rounded-full text-blue-600 hover:bg-blue-50 transition">
            Generate with AI
          </button>
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

export default About;
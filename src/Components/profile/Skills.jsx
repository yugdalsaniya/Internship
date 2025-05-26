import { useState } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';

function Skills() {
  const [skillsText, setSkillsText] = useState('');

  const suggestions = [
    'TensorFlow Serving',
    'M&A Analysis',
    'Manufacturing',
    'Performance Management',
    'Resourcefulness',
    'Industry Knowledge',
    'Portfolio Development',
    'IAM',
    'UpKeep',
    'Wireshark',
  ];

  const handleSave = () => {
    console.log('Skills saved:', skillsText);
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Skills</span>
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
            Skills<span className="text-red-500 ml-1">*</span>
          </p>
          <p className="text-gray-500 text-sm mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((skill) => (
              <button
                key={skill}
                className="px-3 py-1 border border-dashed rounded-full text-gray-600 hover:bg-gray-100 transition"
              >
                {skill}
              </button>
            ))}
          </div>
          <textarea
            className="w-full border rounded-lg p-2 resize-none"
            rows="3"
            placeholder="List your skills here, showcasing what you excel at."
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
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

export default Skills;
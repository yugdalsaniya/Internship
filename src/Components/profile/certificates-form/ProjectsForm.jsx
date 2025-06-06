import { BiTime } from 'react-icons/bi';
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';


const ProjectsForm = ({ onBack }) => {
  const [selectedType, setSelectedType] = useState(null); // Default to "Freelance" as per the screenshot

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="mt-5 p-6 border rounded-lg space-y-4 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BiTime className="text-gray-600 text-xl" />
        <h2 className="text-lg font-semibold text-gray-800">Projects</h2>
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Project name"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Type<span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            className={`border rounded-3xl px-4 py-2 transition ${selectedType === "Full Time"
                ? "border-blue-500 text-blue-500 hover:bg-blue-50"
                : "border-gray-300 border-dashed text-gray-700 hover:bg-gray-100"
              }`}
            onClick={() => handleTypeSelect("Full Time")}
          >
            Full Time
          </button>
          <button
            type="button"
            className={`border rounded-3xl px-4 py-2 transition ${selectedType === "Part Time"
                ? "border-blue-500 text-blue-500 hover:bg-blue-50"
                : "border-gray-300 border-dashed text-gray-700 hover:bg-gray-100"
              }`}
            onClick={() => handleTypeSelect("Part Time")}
          >
            Part Time
          </button>
          <button
            type="button"
            className={`border rounded-3xl px-4 py-2 transition ${selectedType === "Freelance"
                ? "border-blue-500 text-blue-500 hover:bg-blue-50"
                : "border-gray-300 border-dashed text-gray-700 hover:bg-gray-100"
              }`}
            onClick={() => handleTypeSelect("Freelance")}
          >
            Freelance
          </button>
        </div>
      </div>

      {/* Project Duration */}
      <div>
        <div className="flex justify-between">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Duration<span className="text-red-500">*</span>
          </label>
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <input type="checkbox" />
            Ongoing
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            placeholder="Start Date"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
          />
          <input
            type="date"
            placeholder="End Date"
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
          />
        </div>
      </div>

      {/* Project Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
        <textarea
          placeholder="Describe the project you contributed to, your responsibilities, the abilities you developed or learned, and the major takeaways or results of your participation."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          rows={5}
        ></textarea>
      </div>

      {/* Link Certificate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Link this Certificate</label>
        <input
          type="text"
          placeholder="Link this Certificate"
          className="w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
          disabled
        />
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
        <input
          type="text"
          placeholder="Add skills"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>
      {/* Attachments  */}
      <div className="w-full border border-dashed border-gray-400 rounded-md">
        <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-700">
          <FaPlus />
          Attachments
        </button>
      </div>
      {/* Save/Discard Buttons */}
      <div className="flex justify-between mt-4">
        {/* Discard Button */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-3xl px-4 py-2 cursor-pointer hover:bg-gray-100 transition">
          <RxCross2 className="text-gray-600" />
          <button onClick={onBack} className="text-gray-700 font-medium">Discard</button>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 bg-sky-500 rounded-3xl px-4 py-2 cursor-pointer hover:bg-sky-600 transition">
          <IoCheckmark className="text-white" />
          <button className="text-white font-medium">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsForm;
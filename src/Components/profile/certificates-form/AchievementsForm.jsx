import { BiTime } from 'react-icons/bi';
import { FaPlus } from 'react-icons/fa';
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";


const AchievementsForm = ({ onBack }) => {

  return (
    <div className="mt-5 p-6 border rounded-lg   space-y-4 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BiTime className="text-gray-600 text-xl" />
        <h2 className="text-lg font-semibold text-gray-800">Achievements</h2>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
        <input
          type="text"
          placeholder="Title"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          placeholder="Outline your accomplishment, highlighting the abilities you gained, obstacles you tackled, and the importance or influence this had on your career path."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          rows={5}
        ></textarea>
      </div>

      {/* Link Certificate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Link this Achievements</label>
        <input
          type="text"
          placeholder="Link this Achievements"
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
      {/* save */}
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
  )
}

export default AchievementsForm

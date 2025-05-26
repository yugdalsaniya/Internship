import { FaCloudUploadAlt } from 'react-icons/fa';
import { BsEye, BsLightbulb } from 'react-icons/bs';
import { BiTime } from 'react-icons/bi';

function Resume() {
  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Resume</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-xl">
          <BsEye className="cursor-pointer hover:text-blue-600" />
          <BsLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Resume Field */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Resume<span className="text-red-500 ml-1">*</span>
            <a
              href="#"
              className="text-blue-600 text-sm float-right hover:underline"
            >
              Create
            </a>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Remember that one pager that highlights how amazing you are? Time to
            let employers notice your potential through it.
          </p>
        </div>

        {/* Upload Box */}
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
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default Resume;
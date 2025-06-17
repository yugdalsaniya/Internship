import { FaCheckCircle } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';

function SidebarItem({ label, isActive, isRequired, onClick, completed }) {
  return (
    <div
      className={`flex justify-between items-center px-3 py-3 border rounded ${
        isActive ? 'bg-blue-100' : 'bg-white'
      } cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        {completed ? (
          <FaCheckCircle className="text-green-500" />
        ) : (
          <BiTime className="text-gray-400 text-xl" />
        )}
        <span
          className={`text-sm font-medium ${
            completed ? 'text-blue-600' : 'text-gray-700'
          } ${isActive ? 'text-blue-600' : ''}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default SidebarItem;
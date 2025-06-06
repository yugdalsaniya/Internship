import { FaCheckCircle, FaClock } from 'react-icons/fa';

function SidebarItem({ completed, label, isActive, isRequired, onClick }) {
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
          <FaClock className="text-gray-400" />
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
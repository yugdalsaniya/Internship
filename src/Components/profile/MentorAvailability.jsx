import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaClock } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { mUpdate } from '../../Utils/api';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = [
  '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM', '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM', '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM'
];

const MentorAvailability = ({ userData, updateCompletionStatus }) => {
  const [availability, setAvailability] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize availability from userData or create empty structure
    const initialAvailability = userData.mentorAvailability || {};
    const newAvailability = {};
    
    daysOfWeek.forEach(day => {
      newAvailability[day] = initialAvailability[day] || timeSlots.map(() => false);
    });
    
    setAvailability(newAvailability);
    
    // Check if availability already exists
    const hasAvailability = Object.values(initialAvailability).some(day => 
      Array.isArray(day) && day.some(slot => slot === true)
    );
    
    if (hasAvailability) {
      setIsFirstSaveSuccessful(true);
      updateCompletionStatus('Availability', true);
    }
  }, [userData, updateCompletionStatus]);

  const handleTimeSlotChange = (day, slotIndex) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, index) => 
        index === slotIndex ? !slot : slot
      )
    }));
  };

  const handleSelectAllDay = (day, select) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].map(() => select)
    }));
  };

  const handleSave = async () => {
    if (isProcessing) return;

    // Check if at least one time slot is selected
    const hasAvailability = Object.values(availability).some(day => 
      day.some(slot => slot === true)
    );
    
    if (!hasAvailability) {
      setError('Please select at least one time slot for your availability.');
      toast.error('Please select at least one time slot for your availability.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setTimeout(() => setError(''), 5000);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const userId = userData.userid;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const updateData = {
        $set: {
          'sectionData.appuser.mentorAvailability': availability,
          editedAt: new Date().toISOString(),
        },
      };

      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: updateData,
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (updateResponse && (updateResponse.success || updateResponse.modifiedCount > 0)) {
        toast.success('Availability updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        if (!isFirstSaveSuccessful) {
          setIsFirstSaveSuccessful(true);
        }
        updateCompletionStatus('Availability', true);
      } else {
        throw new Error('Failed to update availability in database.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update availability. Please try again.');
      toast.error(err.message || 'Failed to update availability. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          {isFirstSaveSuccessful ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          Availability
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Set Your Availability <span className="text-red-500">*</span>
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Select the time slots when you're available for mentoring sessions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Day</th>
                {timeSlots.map((slot, index) => (
                  <th key={index} className="px-2 py-2 border-b text-xs whitespace-nowrap">
                    {slot}
                  </th>
                ))}
                <th className="px-4 py-2 border-b">Select All</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map(day => (
                <tr key={day}>
                  <td className="px-4 py-2 border-b font-medium">{day}</td>
                  {timeSlots.map((_, slotIndex) => (
                    <td key={slotIndex} className="px-2 py-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={availability[day]?.[slotIndex] || false}
                        onChange={() => handleTimeSlotChange(day, slotIndex)}
                        className="h-4 w-4 text-blue-600 rounded"
                        disabled={isProcessing}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={availability[day]?.every(slot => slot) || false}
                      onChange={(e) => handleSelectAllDay(day, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                      disabled={isProcessing}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isProcessing}
            aria-label="Save Availability"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <span className="text-lg">✓</span> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorAvailability;
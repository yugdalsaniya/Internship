import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import { mUpdate, fetchSectionData } from "../../Utils/api";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const timeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
];

// Backend JSON keys
const timeSlotKeys = [
  "9amTo10am",
  "10amTo11am",
  "11amTo12pm",
  "12pmTo1pm",
  "1pmTo2pm",
  "2pmTo3pm",
  "3pmTo4pm",
  "4pmTo5pm",
  "5pmTo6pm",
];

const MentorAvailability = ({ userData, updateCompletionStatus }) => {
  const [availability, setAvailability] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const [error, setError] = useState("");

  // ✅ Initialize empty availability structure
  const getEmptyAvailability = () => {
    const empty = {};
    daysOfWeek.forEach((day) => {
      empty[day] = timeSlotKeys.map(() => false);
    });
    return empty;
  };

  // ✅ Fetch availability from DB (like Skills.jsx)
  useEffect(() => {
    if (!userData.userid) {
      toast.error("Please log in to view your availability.", {
        autoClose: 5000,
      });
      return;
    }

    const fetchAvailability = async () => {
      try {
        const response = await fetchSectionData({
          appName: "app8657281202648",
          collectionName: "appuser",
          query: { _id: userData.userid },
          projection: { "sectionData.appuser.availabilitydetails": 1 },
        });

        const apiData = response[0];
        if (!apiData) {
          setAvailability(getEmptyAvailability());
          updateCompletionStatus("Availability", false);
          return;
        }

        const availabilityFromServer =
          apiData?.sectionData?.appuser?.availabilitydetails || [];

        if (!availabilityFromServer.length) {
          setAvailability(getEmptyAvailability());
          updateCompletionStatus("Availability", false);
          return;
        }

        // Map DB data → state
        const mapped = {};
        daysOfWeek.forEach((day) => {
          const dayData =
            availabilityFromServer.find((d) => d.Day === day) || {};
          mapped[day] = timeSlotKeys.map((key) => !!dayData[key]);
        });

        setAvailability(mapped);

        // Mark completion if any slot is selected
        const hasAvailability = availabilityFromServer.some((day) =>
          timeSlotKeys.some((key) => day[key])
        );
        if (hasAvailability) {
          setIsFirstSaveSuccessful(true);
        }
        updateCompletionStatus("Availability", hasAvailability);
      } catch (err) {
        console.error("Failed to load availability:", err);
        toast.error("Failed to load availability. Please try again.", {
          autoClose: 5000,
        });
        setAvailability(getEmptyAvailability());
        updateCompletionStatus("Availability", false);
      }
    };

    fetchAvailability();
  }, [userData.userid, updateCompletionStatus]);

  const handleTimeSlotChange = (day, slotIndex) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, idx) => (idx === slotIndex ? !slot : slot)),
    }));
  };

  const handleSelectAllDay = (day, select) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map(() => select),
    }));
  };

  const handleSave = async () => {
    if (isProcessing) return;

    const hasAvailability = Object.values(availability).some((slots) =>
      slots.some((slot) => slot)
    );

    if (!hasAvailability) {
      const msg = "Please select at least one time slot for your availability.";
      setError(msg);
      toast.error(msg, { position: "top-right", autoClose: 5000 });
      setTimeout(() => setError(""), 5000);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const userId = userData?.userid;
      if (!userId) throw new Error("User ID not found. Please log in again.");

      // Prepare data to save
      const availabilityDetails = daysOfWeek.map((day) => {
        const dayData = { Day: day };
        timeSlotKeys.forEach((key, idx) => {
          dayData[key] = availability[day][idx] || false;
        });
        return dayData;
      });

      const updateData = {
        $set: {
          "sectionData.appuser.availabilitydetails": availabilityDetails,
          "sectionData.appuser.editedAt": new Date().toISOString(),
        },
      };

      const updateResponse = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: updateData,
        options: { upsert: false, writeConcern: { w: "majority" } },
      });

      if (
        updateResponse &&
        (updateResponse.success || updateResponse.modifiedCount > 0)
      ) {
        toast.success("Availability updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        // ✅ Sync frontend state
        if (userData?.sectionData?.appuser) {
          userData.sectionData.appuser.availabilitydetails =
            availabilityDetails;
        }

        if (!isFirstSaveSuccessful) setIsFirstSaveSuccessful(true);
        updateCompletionStatus("Availability", true);
      } else {
        throw new Error("Failed to update availability in database.");
      }
    } catch (err) {
      const msg =
        err.message || "Failed to update availability. Please try again.";
      setError(msg);
      toast.error(msg, { position: "top-right", autoClose: 5000 });
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
                {timeSlots.map((slot, idx) => (
                  <th
                    key={idx}
                    className="px-2 py-2 border-b text-xs whitespace-nowrap"
                  >
                    {slot}
                  </th>
                ))}
                <th className="px-4 py-2 border-b">Select All</th>
              </tr>
            </thead>
            <tbody>
              {daysOfWeek.map((day) => (
                <tr key={day}>
                  <td className="px-4 py-2 border-b font-medium">{day}</td>
                  {timeSlots.map((_, slotIdx) => (
                    <td
                      key={slotIdx}
                      className="px-2 py-2 border-b text-center"
                    >
                      <input
                        type="checkbox"
                        checked={availability[day]?.[slotIdx] || false}
                        onChange={() => handleTimeSlotChange(day, slotIdx)}
                        className="h-4 w-4 text-blue-600 rounded"
                        disabled={isProcessing}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 border-b text-center">
                    <input
                      type="checkbox"
                      checked={
                        availability[day]?.every((slot) => slot) || false
                      }
                      onChange={(e) =>
                        handleSelectAllDay(day, e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 rounded"
                      disabled={isProcessing}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
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

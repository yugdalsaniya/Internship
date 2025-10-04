import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchSectionData } from "../../Utils/api";

const MentorProfilePage = () => {
  const { id } = useParams(); // mentor _id
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // section refs
  const mentorRef = useRef(null);
  const aboutRef = useRef(null);
  const availabilityRef = useRef(null);
  const [activeSection, setActiveSection] = useState("mentor");

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const data = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: String(id) }, // 👈 always cast to string
          limit: 1,
        });

        if (data && data.length > 0) {
          setMentor(data[0].sectionData?.appuser || {});
        } else {
          setError("Mentor not found");
        }
      } catch (err) {
        console.error("MentorProfile API Error:", err);
        setError("Error fetching mentor data");
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, [id]);

  const scrollToSection = (ref, section) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-pulse bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full">
          <div className="h-64 w-full bg-gray-200 rounded-t-xl"></div>
          <div className="flex items-end mt-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full ml-6"></div>
            <div className="ml-4">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mt-2"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mt-6 mx-6"></div>
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-100 text-red-700 text-lg font-medium p-4 rounded-lg shadow-md">
          {error || "Mentor not found"}
        </div>
      </div>
    );
  }

  const {
    legalname,
    email,
    mobile,
    Gender,
    profile,
    areaofexperties,
    yearsofexperience,
    mentorspecializations,
    mentoreducationbackground,
    mentorcertifications,
    availabilitydetails,
  } = mentor;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Banner */}
        <div className="relative w-full h-64 sm:h-80">
          <img
            src={profile || "https://placehold.co/1200x400"}
            alt={`${legalname} Header`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Header */}
        <div className="relative px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <img
            src={profile || "https://placehold.co/150x150"}
            alt={`${legalname} Profile`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white object-cover bg-white -mt-12 sm:-mt-14 shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {legalname}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mt-1">
              {areaofexperties || "No expertise specified"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 sm:px-8 py-4">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <button
              onClick={() => scrollToSection(mentorRef, "mentor")}
              className={`text-base font-medium transition-colors ${
                activeSection === "mentor"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Mentor
            </button>
            <button
              onClick={() => scrollToSection(aboutRef, "about")}
              className={`text-base font-medium transition-colors ${
                activeSection === "about"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection(availabilityRef, "availability")}
              className={`text-base font-medium transition-colors ${
                activeSection === "availability"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Availability
            </button>
          </div>
        </div>

        {/* Mentor Section */}
        <div ref={mentorRef} className="px-6 sm:px-8 py-10 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Mentor Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Email</h3>
              <p className="text-gray-600 text-base">
                {email || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Mobile</h3>
              <p className="text-gray-600 text-base">
                {mobile || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Gender</h3>
              <p className="text-gray-600 text-base">
                {Gender || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Experience
              </h3>
              <p className="text-gray-600 text-base">
                {yearsofexperience || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div
          ref={aboutRef}
          className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            About Mentor
          </h2>
          <div className="space-y-3 text-gray-600 text-base">
            <p>
              <span className="font-medium">Specializations:</span>{" "}
              {mentorspecializations?.length > 0
                ? mentorspecializations.join(", ")
                : "Not specified"}
            </p>
            <p>
              <span className="font-medium">Education:</span>{" "}
              {mentoreducationbackground || "Not specified"}
            </p>
            <p>
              <span className="font-medium">Certifications:</span>{" "}
              {mentorcertifications?.length > 0
                ? mentorcertifications.join(", ")
                : "Not specified"}
            </p>
          </div>
        </div>

        {/* Availability Section */}
        <div
          ref={availabilityRef}
          className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Availability
          </h2>
          {!availabilitydetails || availabilitydetails.length === 0 ? (
            <p className="text-gray-600">No availability added.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm">
                    <th className="px-4 py-2 text-left">Day</th>
                    <th className="px-4 py-2">9-10 AM</th>
                    <th className="px-4 py-2">10-11 AM</th>
                    <th className="px-4 py-2">11-12 PM</th>
                    <th className="px-4 py-2">12-1 PM</th>
                    <th className="px-4 py-2">1-2 PM</th>
                    <th className="px-4 py-2">2-3 PM</th>
                    <th className="px-4 py-2">3-4 PM</th>
                    <th className="px-4 py-2">4-5 PM</th>
                    <th className="px-4 py-2">5-6 PM</th>
                  </tr>
                </thead>
                <tbody>
                  {availabilitydetails.map((slot, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-200 text-sm text-gray-700"
                    >
                      <td className="px-4 py-2 font-medium">{slot.Day}</td>
                      {[
                        "9amTo10am",
                        "10amTo11am",
                        "11amTo12pm",
                        "12pmTo1pm",
                        "1pmTo2pm",
                        "2pmTo3pm",
                        "3pmTo4pm",
                        "4pmTo5pm",
                        "5pmTo6pm",
                      ].map((time) => (
                        <td
                          key={time}
                          className={`px-4 py-2 text-center ${
                            slot[time]
                              ? "text-green-600 font-semibold"
                              : "text-red-400"
                          }`}
                        >
                          {slot[time] ? "✔" : "✘"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sticky {
          position: -webkit-sticky;
          position: sticky;
          z-index: 10;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MentorProfilePage;
  
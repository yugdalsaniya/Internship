import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import alex from "../assets/Hero/alex-resume.jpg";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  BookOpen,
  Star,
  Award,
  Printer,
  Clock,
  Users,
} from "lucide-react";
import { fetchSectionData } from "../Utils/api";

export default function CreateMentorResume({ userData }) {
  const navigate = useNavigate();
  const resumeRef = useRef(null);

  const handlePrint = () => {
    const printContents = resumeRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `<div class="min-h-screen bg-white max-w-4xl mx-auto font-sans text-gray-800">${printContents}</div>`;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const [mentorData, setMentorData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  // Fetch userId from localStorage and validate
  useEffect(() => {
    const userString = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("No access token found. Please log in again.");
      toast.error("No access token found. Please log in again.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/login");
      return;
    }

    if (!userString) {
      setError("Please log in to view your details.");
      toast.error("Please log in to view your details.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userString);
      if (!user.userid) {
        throw new Error("User ID not found in local storage.");
      }
      setUserId(user.userid);
    } catch (parseError) {
      console.error("Invalid user data:", parseError);
      setError("Invalid user data. Please log in again.");
      toast.error("Invalid user data. Please log in again.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/login");
    }
  }, [navigate]);

  // Fetch mentor data
  useEffect(() => {
    if (!userId) return;

    const fetchMentorData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetchSectionData({
          collectionName: "appuser",
          query: { _id: userId },
          projection: {
            "sectionData.appuser.legalname": 1,
            "sectionData.appuser.email": 1,
            "sectionData.appuser.mobile": 1,
            "sectionData.appuser.profile": 1,
            "sectionData.appuser.areaofexperties": 1,
            "sectionData.appuser.yearsofexperience": 1,
            "sectionData.appuser.mentorspecializations": 1,
            "sectionData.appuser.mentoreducationbackground": 1,
            "sectionData.appuser.mentorcertifications": 1,
            "sectionData.appuser.availabilitydetails": 1,
          },
        });

        const user = response?.[0];
        if (!user || !user.sectionData?.appuser) {
          throw new Error("No mentor data found.");
        }

        const appuser = user.sectionData.appuser;
        setMentorData(appuser);
      } catch (err) {
        console.error("Failed to load mentor data:", err);
        setError("Failed to load mentor data: " + err.message);
        toast.error("Failed to load mentor data: " + err.message, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorData();
  }, [userId]);

  // Helper function to format availability
  const formatAvailability = (availabilityDetails) => {
    if (!availabilityDetails || availabilityDetails.length === 0) {
      return "No availability specified";
    }

    const timeSlots = [
      "9amTo10am", "10amTo11am", "11amTo12pm", "12pmTo1pm",
      "1pmTo2pm", "2pmTo3pm", "3pmTo4pm", "4pmTo5pm", "5pmTo6pm"
    ];

    const timeLabels = [
      "9-10 AM", "10-11 AM", "11-12 PM", "12-1 PM",
      "1-2 PM", "2-3 PM", "3-4 PM", "4-5 PM", "5-6 PM"
    ];

    return availabilityDetails.map(slot => {
      const availableTimes = timeSlots
        .map((time, index) => slot[time] ? timeLabels[index] : null)
        .filter(Boolean);
      
      return `${slot.Day}: ${availableTimes.length > 0 ? availableTimes.join(", ") : "Not available"}`;
    }).join(" | ");
  };

  return (
    <div className="min-h-screen bg-white max-w-4xl mx-auto font-sans text-gray-800">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {/* Resume Content to Print */}
      <div ref={resumeRef} className="shadow-lg print:shadow-none">
        {/* HEADER */}
        <div className="bg-white border-[3px] border-gray-500 px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* LEFT SIDE: Name */}
            <div className="sm:col-span-5 text-center sm:text-left">
              {mentorData.legalname && (
                <h1 className="text-4xl font-bold uppercase tracking-wide break-words">
                  {mentorData.legalname.toUpperCase()}
                </h1>
              )}
              {mentorData.areaofexperties && (
                <p className="text-base tracking-wide text-gray-500 mt-1">
                  {mentorData.areaofexperties}
                </p>
              )}
            </div>
            
            {/* MIDDLE: Contact Info */}
            <div className="sm:col-span-4 flex flex-col items-center sm:items-start">
              {(mentorData.mobile || mentorData.email) && (
                <div className="flex flex-col items-center sm:items-start w-full">
                  <div className="w-[3px] h-8 bg-gray-500 hidden sm:block"></div>
                  <div className="flex flex-col gap-2 mt-2 mb-2 w-full">
                    {mentorData.mobile && (
                      <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <Phone className="w-5 h-5 flex-shrink-0" />
                        <span className="break-all">{mentorData.mobile}</span>
                      </div>
                    )}
                    {mentorData.email && (
                      <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <Mail className="w-5 h-5 flex-shrink-0" />
                        <span className="break-all">{mentorData.email}</span>
                      </div>
                    )}
                    {mentorData.yearsofexperience && (
                      <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                        <Briefcase className="w-5 h-5 flex-shrink-0" />
                        <span className="break-all">{mentorData.yearsofexperience} Experience</span>
                      </div>
                    )}
                  </div>
                  <div className="w-[3px] h-8 bg-gray-500 hidden sm:block"></div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: IMAGE */}
            <div className="sm:col-span-3 flex justify-center">
              <img
                src={mentorData.profile || alex}
                alt="Profile"
                className="w-32 h-32 object-cover rounded-full overflow-hidden"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = alex;
                }}
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white px-8 py-8 space-y-8">
          {/* PROFESSIONAL SUMMARY */}
          <section className="border-b-[3px] border-gray-500 pb-6 sm:pb-10 w-full">
            <h2 className="text-base sm:text-lg font-bold tracking-wide pb-1 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" /> PROFESSIONAL SUMMARY
            </h2>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : error ? (
              <p className="text-sm mt-3 leading-relaxed text-red-500">
                {error}
              </p>
            ) : (
              <div className="text-xs sm:text-sm mt-3 leading-relaxed whitespace-normal break-words space-y-2">
                <p>
                  Experienced {mentorData.areaofexperties || "professional"} mentor with {mentorData.yearsofexperience || "extensive"} of industry experience. 
                  Passionate about guiding and developing the next generation of professionals through personalized mentorship and knowledge sharing.
                </p>
                {mentorData.mentoreducationbackground && (
                  <p>Educational Background: {mentorData.mentoreducationbackground}</p>
                )}
              </div>
            )}
          </section>

          {/* EXPERTISE & SPECIALIZATIONS */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1 flex items-center gap-2">
              <Star className="w-5 h-5" /> EXPERTISE & SPECIALIZATIONS
            </h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4 mt-3">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              </div>
            ) : error ? (
              <p className="text-sm mt-3 text-red-500">
                Failed to load expertise data.
              </p>
            ) : (
              <div className="mt-3">
                {mentorData.areaofexperties && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-base uppercase tracking-wide">
                      Primary Expertise
                    </h3>
                    <p className="text-sm text-gray-700">{mentorData.areaofexperties}</p>
                  </div>
                )}
                
                {mentorData.mentorspecializations && mentorData.mentorspecializations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-base uppercase tracking-wide">
                      Specializations
                    </h3>
                    <div className="space-y-2">
                      {mentorData.mentorspecializations.map((spec, index) => (
                        <div key={index} className="text-base text-gray-900">
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold mb-2 text-base uppercase tracking-wide">
                    Experience Level
                  </h3>
                  <p className="text-sm text-gray-700">{mentorData.yearsofexperience || "Not specified"}</p>
                </div>
              </div>
            )}
          </section>

          {/* CERTIFICATIONS */}
          {mentorData.mentorcertifications && mentorData.mentorcertifications.length > 0 && (
            <section className="border-b-[3px] border-gray-500 pb-10">
              <h2 className="text-lg font-bold tracking-wide pb-1 flex items-center gap-2">
                <Award className="w-5 h-5" /> CERTIFICATIONS
              </h2>
              <div className="space-y-2 mt-3 text-sm">
                {mentorData.mentorcertifications.map((cert, index) => (
                  <div key={index} className="text-base text-gray-900">
                    {cert}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AVAILABILITY */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1 flex items-center gap-2">
              <Clock className="w-5 h-5" /> AVAILABILITY
            </h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4 mt-3">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              </div>
            ) : error ? (
              <p className="text-sm mt-3 text-red-500">
                Failed to load availability data.
              </p>
            ) : mentorData.availabilitydetails && mentorData.availabilitydetails.length > 0 ? (
              <div className="mt-3">
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="px-3 py-2 text-left font-semibold">Day</th>
                        <th className="px-2 py-2 text-center font-semibold">9-10</th>
                        <th className="px-2 py-2 text-center font-semibold">10-11</th>
                        <th className="px-2 py-2 text-center font-semibold">11-12</th>
                        <th className="px-2 py-2 text-center font-semibold">12-1</th>
                        <th className="px-2 py-2 text-center font-semibold">1-2</th>
                        <th className="px-2 py-2 text-center font-semibold">2-3</th>
                        <th className="px-2 py-2 text-center font-semibold">3-4</th>
                        <th className="px-2 py-2 text-center font-semibold">4-5</th>
                        <th className="px-2 py-2 text-center font-semibold">5-6</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentorData.availabilitydetails.map((slot, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="px-3 py-2 font-medium text-gray-800">{slot.Day}</td>
                          {[
                            "9amTo10am", "10amTo11am", "11amTo12pm", "12pmTo1pm",
                            "1pmTo2pm", "2pmTo3pm", "3pmTo4pm", "4pmTo5pm", "5pmTo6pm"
                          ].map((time) => (
                            <td key={time} className={`px-2 py-2 text-center ${
                              slot[time] ? "text-green-600 font-semibold" : "text-red-400"
                            }`}>
                              {slot[time] ? "✔" : "✘"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-3 text-gray-600">
                No availability schedule provided yet.
              </p>
            )}
          </section>

          {/* MENTORING APPROACH */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1 flex items-center gap-2">
              <Users className="w-5 h-5" /> MENTORING APPROACH
            </h2>
            <div className="mt-3 text-sm text-gray-700 space-y-2">
              <p>• Personalized guidance tailored to individual career goals and learning styles</p>
              <p>• Regular one-on-one sessions focused on skill development and professional growth</p>
              <p>• Practical industry insights and real-world application of theoretical knowledge</p>
              <p>• Continuous feedback and support throughout the mentoring relationship</p>
              <p>• Goal-oriented approach with measurable outcomes and progress tracking</p>
            </div>
          </section>

          {/* EDUCATION BACKGROUND */}
          {mentorData.mentoreducationbackground && (
            <section className="border-b-[3px] border-gray-500 pb-10">
              <h2 className="text-lg font-bold tracking-wide pb-1 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> EDUCATION BACKGROUND
              </h2>
              <div className="mt-3 text-sm text-gray-700">
                <p>{mentorData.mentoreducationbackground}</p>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="bg-white px-8 pb-8 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Resume
        </button>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        .animate-pulse {
          animation: shimmer 1.5s infinite;
          background: linear-gradient(
            to right,
            #f6f7f8 8%,
            #edeef1 18%,
            #f6f7f8 33%
          );
          background-size: 800px 104px;
        }
      `}</style>
    </div>
  );
}
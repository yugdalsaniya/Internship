import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import alex from "../assets/Hero/alex-resume.jpg";
import { Plane, Bike, Tv, Music, Camera, Gamepad2 } from "lucide-react";
import { fetchSectionData } from "../Utils/api";

export default function App({ userData }) {
  const navigate = useNavigate();
  const handlePrint = () => window.print();

  const [about, setAbout] = useState("");
  const [educationList, setEducationList] = useState([]);
  const [workExperienceList, setWorkExperienceList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    location: "",
    designation: "",
  });

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
      navigate("/ph/login");
      return;
    }

    if (!userString) {
      setError("Please log in to view your details.");
      toast.error("Please log in to view your details.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/ph/login");
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
      navigate("/ph/login");
    }
  }, [navigate]);

  // Fetch "About", "Education", "Work Experience", "Skills", and "Certificates" data from DB
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError("");
        console.log("Fetching data with lookup for userId:", userId);

        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
          lookups: [
            {
              $match: { _id: userId },
            },
            {
              $lookup: {
                from: "designation",
                localField: "sectionData.appuser.workexperience2.designation4",
                foreignField: "_id",
                as: "designationInfo",
              },
            },
            {
              $lookup: {
                from: "skills",
                localField: "sectionData.appuser.skills",
                foreignField: "_id",
                as: "skillsInfo",
              },
            },
            {
              $lookup: {
                from: "skills",
                localField: "sectionData.appuser.workexperience2.skills4",
                foreignField: "_id",
                as: "workSkillsInfo",
              },
            },
            {
              $lookup: {
                from: "coursespecialization",
                localField: "sectionData.appuser.education.specialization1",
                foreignField: "_id",
                as: "specializationInfo",
              },
            },
            {
              $set: {
                "sectionData.appuser.skills":
                  "$skillsInfo.sectionData.skills.name",
                "sectionData.appuser.education": {
                  $map: {
                    input: "$sectionData.appuser.education",
                    as: "edu",
                    in: {
                      $mergeObjects: [
                        "$$edu",
                        {
                          specialization1: {
                            $arrayElemAt: [
                              "$specializationInfo.sectionData.coursespecialization.name",
                              {
                                $indexOfArray: [
                                  "$specializationInfo._id",
                                  "$$edu.specialization1",
                                ],
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                },
                "sectionData.appuser.workexperience2": {
                  $map: {
                    input: "$sectionData.appuser.workexperience2",
                    as: "we",
                    in: {
                      $mergeObjects: [
                        "$$we",
                        {
                          designation4: {
                            $arrayElemAt: [
                              "$designationInfo.sectionData.designation.name",
                              {
                                $indexOfArray: [
                                  "$designationInfo._id",
                                  "$$we.designation4",
                                ],
                              },
                            ],
                          },
                          skills4: {
                            $map: {
                              input: {
                                $cond: [
                                  { $isArray: "$$we.skills4" },
                                  "$$we.skills4",
                                  [],
                                ],
                              },
                              as: "sid",
                              in: {
                                $arrayElemAt: [
                                  "$workSkillsInfo.sectionData.skills.name",
                                  {
                                    $indexOfArray: [
                                      "$workSkillsInfo._id",
                                      "$$sid",
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          ],
        });

        console.log("fetchSectionData response with lookup:", response);

        const user = response?.[0];
        if (!user || !user.sectionData?.appuser) {
          throw new Error("No user data found.");
        }

        const fetchedAbout = user.sectionData.appuser.about || "";
        const fetchedEducation = user.sectionData.appuser.education || [];
        const fetchedWorkExperience =
          user.sectionData.appuser.workexperience2 || [];
        const fetchedSkills = user.sectionData.appuser.skills || [];
        const fetchedCertificates =
          user.sectionData.appuser.certificatesdetails || [];

        // Set only non-empty user details
        const userDetailsData = {};
        if (user.sectionData.appuser.legalname) {
          userDetailsData.name = user.sectionData.appuser.legalname;
        }
        if (user.sectionData.appuser.email) {
          userDetailsData.email = user.sectionData.appuser.email;
        }
        if (user.sectionData.appuser.mobile) {
          userDetailsData.mobile = user.sectionData.appuser.mobile;
        }
        if (user.sectionData.appuser.addressline1) {
          userDetailsData.address = user.sectionData.appuser.addressline1;
        }
        if (user.sectionData.appuser.location) {
          userDetailsData.location = user.sectionData.appuser.location;
        }
        if (
          user.sectionData.appuser.course ||
          user.sectionData.appuser.designation ||
          user.sectionData.appuser.stream
        ) {
          userDetailsData.designation =
            user.sectionData.appuser.course ||
            user.sectionData.appuser.designation ||
            user.sectionData.appuser.stream;
        }

        setAbout(fetchedAbout);
        setEducationList(fetchedEducation);
        setWorkExperienceList(fetchedWorkExperience);
        setSkills(fetchedSkills);
        setCertificates(fetchedCertificates);
        setUserDetails(userDetailsData);
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Failed to load profile data: " + err.message);
        toast.error("Failed to load profile data: " + err.message, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Helper function to extract country from location
  const getCountryFromLocation = (location) => {
    if (!location) return "";
    const parts = location.split(",").map((part) => part.trim());
    return parts[parts.length - 1] || "";
  };

  // Helper function to format duration
  const formatDuration = (startDate, endDate) => {
    if (!startDate) return "";
    if (!endDate) return `${startDate} - Present`;
    try {
      const startYear = new Date(startDate).getFullYear().toString();
      const endYear = new Date(endDate).getFullYear().toString();
      return `${startYear} - ${endYear}`;
    } catch (e) {
      console.warn(
        `Invalid date format: startDate=${startDate}, endDate=${endDate}`,
        e
      );
      return `${startDate} - ${endDate || "Present"}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg font-sans text-gray-800 print:shadow-none">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {/* HEADER */}
      <div className="flex items-center border-[3px] border-gray-500 mr-[90px] px-10 relative">
        {/* LEFT SIDE: Name + Contact */}
        <div className="flex items-center justify-between w-9/12">
          <div>
            {userDetails.name && (
              <h1 className="text-4xl font-bold uppercase tracking-wide leading-tight">
                {userDetails.name.toUpperCase()}
              </h1>
            )}
            {userDetails.designation && (
              <p className="text-base tracking-wide text-gray-500">
                {userDetails.designation}
              </p>
            )}
          </div>

          {/* Contact Info */}
          {(userDetails.mobile ||
            userDetails.email ||
            userDetails.location) && (
            <div className="flex flex-col items-start">
              <div className="w-[3px] h-8 ml-2 bg-gray-500"></div>
              <div className="flex flex-col gap-2 mt-2 mb-2">
                {userDetails.mobile && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <span className="w-5 text-center">📞</span>
                    <span>{userDetails.mobile}</span>
                  </div>
                )}
                {userDetails.email && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <span className="w-5 text-center">✉️</span>
                    <span>{userDetails.email}</span>
                  </div>
                )}
                {userDetails.location && (
                  <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <span className="w-5 text-center">📍</span>
                    <span>{userDetails.location}</span>
                  </div>
                )}
              </div>
              <div className="w-[3px] ml-2 h-8 bg-gray-500"></div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: IMAGE */}
        <div className="w-3/12 flex justify-center absolute -right-[13%]">
          <img
            src={alex}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full overflow-hidden"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-3 gap-8 px-8 py-8">
        <div className="col-span-2 space-y-8">
          {/* PERSONAL PROFILE (Dynamic from DB) */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1">
              PERSONAL PROFILE
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
              <p className="text-sm mt-3 leading-relaxed">
                {about ||
                  "No personal profile provided. Please update your profile."}
              </p>
            )}
          </section>

          {/* WORK EXPERIENCE (Dynamic from DB) */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1">
              WORK EXPERIENCE
            </h2>
            {isLoading ? (
              <div className="animate-pulse space-y-6 mt-3">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              </div>
            ) : error ? (
              <p className="text-sm mt-3 text-red-500">
                Failed to load work experience data.
              </p>
            ) : workExperienceList.length === 0 ? (
              <p className="text-sm mt-3 text-gray-600">
                No work experience details saved yet.
              </p>
            ) : (
              <div className="space-y-6 mt-3">
                {workExperienceList.map((exp, index) => {
                  const hasDetails =
                    exp.organisation4 ||
                    exp.location4 ||
                    (exp.startdate4 && exp.enddate4);

                  return (
                    <div key={index}>
                      <h3 className="font-bold text-sm uppercase">
                        {exp.designation4 || "Unknown Designation"}
                      </h3>

                      {hasDetails && (
                        <p className="text-xs text-gray-500">
                          {exp.organisation4 && (
                            <span>{exp.organisation4}</span>
                          )}
                          {exp.location4 && (
                            <span>
                              {" "}
                              | {getCountryFromLocation(exp.location4)}
                            </span>
                          )}
                          {(exp.startdate4 || exp.enddate4) && (
                            <span>
                              {" "}
                              | {formatDuration(exp.startdate4, exp.enddate4)}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SKILLS */}
          <section>
            <h2 className="text-lg font-bold tracking-wide pb-1">SKILLS</h2>
            <div className="mt-3">
              <h3 className="font-semibold mb-4 text-lg uppercase tracking-wide">
                Personal Skills
              </h3>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : error ? (
                <p className="text-sm text-red-500">
                  Failed to load skills data.
                </p>
              ) : skills.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No skills details saved yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {skills.map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-base mb-1">
                        <span className="text-gray-900">
                          {skill || "Unknown Skill"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* EDUCATION (Dynamic from DB) */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1">EDUCATION</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4 mt-3">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ) : error ? (
              <p className="text-sm mt-3 text-red-500">
                Failed to load education data.
              </p>
            ) : educationList.length === 0 ? (
              <p className="text-sm mt-3 text-gray-600">
                No education details saved yet.
              </p>
            ) : (
              <div className="space-y-4 mt-3 text-sm">
                {educationList.map((edu, index) => (
                  <div key={index}>
                    <p className="font-semibold">
                      {edu.specialization1 || "Unknown Specialization"}
                    </p>
                    <p className="text-gray-600">
                      {edu.college1 || "Unknown College"}
                    </p>
                    <p className="text-xs text-gray-500">{`${edu.startyear1} - ${edu.endyear1}`}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* CERTIFICATES */}
          <section className="border-b-[3px] border-gray-500 pb-10">
            <h2 className="text-lg font-bold tracking-wide pb-1">
              CERTIFICATES
            </h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4 mt-3">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ) : error ? (
              <p className="text-sm mt-3 text-red-500">
                Failed to load certificates data.
              </p>
            ) : certificates.length === 0 ? (
              <p className="text-sm mt-3 text-gray-600">
                No certificate details saved yet.
              </p>
            ) : (
              <div className="space-y-4 mt-3 text-sm">
                {certificates.map((cert, index) => (
                  <div key={index}>
                    {cert.titleofcertificates && (
                      <p className="font-semibold">
                        {cert.titleofcertificates}
                      </p>
                    )}
                    {cert.issuingorganization && (
                      <p className="text-gray-600">
                        {cert.issuingorganization}
                      </p>
                    )}
                    {(cert.certificatestartdate || cert.certificateenddate) && (
                      <p className="text-xs text-gray-500">
                        {formatDuration(
                          cert.certificatestartdate,
                          cert.certificateenddate
                        )}
                      </p>
                    )}
                    {cert.certificatedescription && (
                      <p className="text-gray-600">
                        {cert.certificatedescription}
                      </p>
                    )}
                    {cert.certificatelink && (
                      <a
                        href={cert.certificatelink}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <div className="px-8 pb-8 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
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

import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSectionData } from "../../Utils/api";

const AcademyProfilePage = () => {
  const { id } = useParams();
  const [academy, setAcademy] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const academyRef = useRef(null);
  const aboutRef = useRef(null);
  const coursesRef = useRef(null);
  const studentsRef = useRef(null);
  const [activeSection, setActiveSection] = useState("academy");

  useEffect(() => {
    const fetchAcademyData = async () => {
      try {
        // Fetch academy data
        const academyData = await fetchSectionData({
          dbName: "internph",
          collectionName: "institute",
          query: { _id: id },
          limit: 1,
        });
        if (academyData && academyData.length > 0) {
          setAcademy(academyData[0]);
        } else {
          setError("Academy not found");
        }

        // Fetch courses
        const courseData = await fetchSectionData({
          dbName: "internph",
          collectionName: "course",
          query: { createdBy: id },
          limit: 20,
          order: -1,
          sortedBy: "createdAt",
        });
        setCourses(courseData || []);

        // Fetch students associated with this academy, filtered by student role
        const studentData = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: {
            "sectionData.appuser.organisationcollege": id,
            "sectionData.appuser.role": "1747825619417", // Only users with student role
          },
          limit: 50,
        });
        setStudents(studentData || []);

        // Fetch course options for name resolution
        const courseOptionData = await fetchSectionData({
          dbName: "internph",
          collectionName: "course",
          query: {},
        });
        const courses = courseOptionData.map((item) => ({
          _id: item._id,
          name: item.sectionData.course.name,
        }));
        setCourseOptions(courses);
      } catch (err) {
        setError("Error fetching academy, course, or student data");
        console.error("AcademyProfile API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyData();
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mx-6">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !academy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-red-100 text-red-700 text-lg font-medium p-4 rounded-lg shadow-md">
          {error || "Academy not found"}
        </div>
      </div>
    );
  }

  const {
    sectionData: {
      institute: {
        institutionname,
        institutiontagline,
        image,
        region,
        institutiontype,
        province,
        municipalitycity,
        websiteaddress,
        faxtelephoneno,
      },
    },
  } = academy;

  const contactNumbers = Array.isArray(faxtelephoneno)
    ? faxtelephoneno
    : typeof faxtelephoneno === "string" && faxtelephoneno
    ? faxtelephoneno
        .split(/[,;\n]+/)
        .map((num) => num.trim())
        .filter((num) => num && /^\(\d{3}\)\s?\d{3}-\d{4}$/.test(num))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">
        {/* Banner Image */}
        <div className="relative w-full h-64 sm:h-80">
          <img
            src={image || "https://placehold.co/1200x400"}
            alt={`${institutionname} Header`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Logo and Academy Header */}
        <div className="relative px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <img
            src={image || "https://placehold.co/150x150"}
            alt={`${institutionname} Logo`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white object-contain bg-white -mt-12 sm:-mt-14 shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {institutionname}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mt-1">
              {institutiontagline}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 sm:px-8 py-4">
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <button
              onClick={() => scrollToSection(academyRef, "academy")}
              className={`text-base font-medium transition-colors ${
                activeSection === "academy"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              aria-label="Scroll to Academy section"
            >
              Academy
            </button>
            <button
              onClick={() => scrollToSection(aboutRef, "about")}
              className={`text-base font-medium transition-colors ${
                activeSection === "about"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              aria-label="Scroll to About section"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection(coursesRef, "courses")}
              className={`text-base font-medium transition-colors ${
                activeSection === "courses"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              aria-label="Scroll to Courses section"
            >
              Courses
            </button>
            <button
              onClick={() => scrollToSection(studentsRef, "students")}
              className={`text-base font-medium transition-colors ${
                activeSection === "students"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              aria-label="Scroll to Students section"
            >
              Students
            </button>
          </div>
        </div>

        {/* Academy Section */}
        <div ref={academyRef} className="px-6 sm:px-8 py-10 animate-fadeIn">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Academy Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Region</h3>
              <p className="text-gray-600 text-base">
                {region || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Institution Type
              </h3>
              <p className="text-gray-600 text-base">
                {institutiontype || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Province</h3>
              <p className="text-gray-600 text-base">
                {province || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">
                Municipality/City
              </h3>
              <p className="text-gray-600 text-base">
                {municipalitycity || "Not specified"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Website</h3>
              <p className="text-gray-600 text-base">
                {websiteaddress ? (
                  <a
                    href={websiteaddress}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {websiteaddress}
                  </a>
                ) : (
                  "Not specified"
                )}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Contact</h3>
              {contactNumbers.length > 0 ? (
                <div className="text-gray-600 text-base space-y-2">
                  {contactNumbers.map((number, index) => (
                    <p key={index} className="leading-tight">
                      {number}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-base">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* About Section */}
        <div
          ref={aboutRef}
          className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            About Academy
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            No description available.
          </p>
        </div>

        {/* Courses Section */}
        <div
          ref={coursesRef}
          className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Courses
          </h2>
          {courses.length === 0 ? (
            <p className="text-gray-600 text-base">No courses available.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  to={`/coursedetail/${course._id}`}
                  className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  aria-label={`View details for ${course.sectionData.course.title}`}
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        course.sectionData.course.image ||
                        "https://placehold.co/60x60"
                      }
                      alt={`${course.sectionData.course.title} Image`}
                      className="w-12 h-12 object-contain rounded-md flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {course.sectionData.course.title || "Untitled Course"}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {course.sectionData.course.description ||
                          "No description"}
                        ...
                      </p>
                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {course.sectionData.course.duration ||
                            "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Level:</span>{" "}
                          {course.sectionData.course.level || "Not specified"}
                        </p>
                        <p>
                          <span className="font-medium">Price:</span>{" "}
                          {course.sectionData.course.price || "Not specified"}
                        </p>
                      </div>
                      <button className="mt-4 text-blue-600 font-medium text-sm hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Students Section */}
        <div
          ref={studentsRef}
          className="px-6 sm:px-8 py-10 border-t border-gray-200 animate-fadeIn"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Students
          </h2>
          {students.length === 0 ? (
            <p className="text-gray-600 text-base">
              No students are currently associated with this academy.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={
                        student.sectionData.appuser.profile ||
                        "https://placehold.co/60x60"
                      }
                      alt={`${student.sectionData.appuser.legalname} Profile`}
                      className="w-12 h-12 object-cover rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.sectionData.appuser.legalname || "Anonymous"}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        <span className="font-medium">User Type:</span>{" "}
                        {student.sectionData.appuser.usertype || "Not specified"}
                      </p>
                      {student.sectionData.appuser.usertype ===
                      "Senior High School" ? (
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">Stream:</span>{" "}
                          {student.sectionData.appuser.stream || "Not specified"}
                        </p>
                      ) : (
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">Course:</span>{" "}
                          {student.sectionData.appuser.course
                            ? courseOptions.find(
                                (c) => c._id === student.sectionData.appuser.course
                              )?.name || "Not specified"
                            : "Not specified"}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm mt-1">
                        <span className="font-medium">Location:</span>{" "}
                        {student.sectionData.appuser.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (min-width: 640px) {
          .min-h-screen {
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
          }
          .h-64 {
            height: 20rem;
          }
          .w-24 {
            width: 7rem;
            height: 7rem;
          }
          .text-2xl {
            font-size: 1.875rem;
          }
        }
        @media (min-width: 1024px) {
          .h-80 {
            height: 24rem;
          }
          .w-28 {
            width: 7rem;
            height: 7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AcademyProfilePage;
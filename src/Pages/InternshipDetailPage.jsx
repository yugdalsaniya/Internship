import React from "react";
import Hero from "../assets/Hero/banner.jpg";
import {
  FaMapMarkerAlt,
  FaRegClock,
  FaRupeeSign,
  FaUser,
  FaGraduationCap,
  FaTags,
  FaBriefcase,
  FaPhoneAlt,
  FaEnvelope,
  FaCommentDots,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { PiTwitterLogoFill } from "react-icons/pi";

const InternshipDetailsPage = () => {
  const relatedInternships = [
    { title: "Marketing", company: "Allcargo Logistics Limited" },
    { title: "Graphic Designer", company: "Flippspaces co Limited" },
    { title: "Ui/Ux Designer", company: "Webfinic Enterprises" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div
        className="w-full h-[300px] bg-cover bg-center relative flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${Hero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative flex flex-col items-center text-center max-w-7xl mx-auto z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-3">
            Internships Details
          </h1>
          <p className="text-base md:text-lg text-[#45457D] mb-6 max-w-3xl">
            "Empower Your Future: Unleash Limitless Career Possibilities!"
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-xs text-gray-400 mb-1">10 min ago</div>
            <h1 className="text-3xl font-bold mb-1">Ui/Ux Designer</h1>
            <p className="text-gray-500">Webfinic Enterprise</p>
            <div className="flex gap-5 text-sm text-gray-500 mt-3">
              <div className="flex items-center gap-1">
                <MdWork />
                Full time
              </div>
              <div className="flex items-center gap-1">
                <FaRupeeSign />
                ₹25,000 - ₹30,000
              </div>
              <div className="flex items-center gap-1">
                <FaMapMarkerAlt />
                Ahmedabad
              </div>
            </div>
          </div>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-md">
            Apply Internship
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Section */}
          <div className="lg:col-span-2">
            {/* Internship Description */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Internship Description</h2>
              <p className="text-gray-700">
                As a UI/UX Designer, you will create intuitive, engaging, and visually appealing user interfaces
                for web and mobile applications. You’ll collaborate with product managers, developers, and
                stakeholders to design user-centered solutions that enhance user satisfaction and drive business
                goals.
              </p>
            </section>

            {/* Key Responsibilities */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Key Responsibilities</h2>
              <ul className="list-disc ml-5 text-gray-700 space-y-2">
                <li>Conduct user research and usability testing to understand user needs.</li>
                <li>Design intuitive UI and engaging interactions aligned with guidelines.</li>
                <li>Collaborate with developers to ensure design implementation.</li>
                <li>Stay updated on UX/UI trends and tools.</li>
                <li>Present design concepts to stakeholders.</li>
                <li>Create wireframes, prototypes, and high-fidelity mockups.</li>
              </ul>
            </section>

            {/* Professional Skills */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Professional Skills</h2>
              <ul className="list-disc ml-5 text-gray-700 space-y-2">
                <li>Proficient in Figma, Sketch, Adobe XD, etc.</li>
                <li>Strong user-centered design principles.</li>
                <li>Experience with responsive design and prototyping.</li>
                <li>Basic understanding of HTML, CSS, JavaScript.</li>
                <li>Excellent visual design and typography skills.</li>
              </ul>
            </section>

            {/* Tags + Share Internship */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-2">Tags:</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Full time", "Commerce", "Ahmedabad", "Corporate", "Location"].map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <p className="text-sm font-medium">Share Internship:</p>
                <FaFacebookF className="text-[#4267B2] text-lg cursor-pointer" title="Facebook" />
                <PiTwitterLogoFill className="text-black text-lg cursor-pointer" title="X" />
                <FaLinkedinIn className="text-[#0077b5] text-lg cursor-pointer" title="LinkedIn" />
              </div>
            </section>

            {/* Related Internships */}
            <section>
              <h2 className="text-2xl font-bold mb-5">Related Internships</h2>
              {relatedInternships.map((item, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg shadow-sm flex justify-between items-center mb-4 bg-white"
                >
                  <div>
                    <div className="text-xs text-gray-400 mb-1">10 min ago</div>
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <div className="text-gray-500 text-sm">{item.company}</div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center gap-1">
                        <MdWork /> Full time
                      </div>
                      <div className="flex items-center gap-1">
                        <FaRupeeSign /> ₹25,000 - ₹30,000
                      </div>
                      <div className="flex items-center gap-1">
                        <FaMapMarkerAlt /> Ahmedabad
                      </div>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-md">
                    Internship Details
                  </button>
                </div>
              ))}
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Internship Overview */}
            <div className="bg-gradient-to-br from-[#fff7f9] to-[#f4f9fd] p-5 rounded-2xl shadow-md">
              <h3 className="font-semibold text-lg mb-3">Internship Overview</h3>
              <div className="space-y-3 text-sm text-[#333]">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
                  <span>Internship Title: UI/UX Designer</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdWork className="text-blue-500" />
                  <span>Internship Type: Full Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaTags className="text-blue-500" />
                  <span>Category: Commerce</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRegClock className="text-blue-500" />
                  <span>Experience: 2 Years</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-blue-500" />
                  <span>Degree: Master</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaRupeeSign className="text-blue-500" />
                  <span>Offered Salary: ₹25,000 - ₹30,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500" />
                  <span>Location: Ahmedabad</span>
                </div>
              </div>
              <div className="mt-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.005659035671!2d72.57136231534908!3d23.022505984951904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e84f8f2a83b8f%3A0xc4bb2c3cccf0f0f!2sAhmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1625215052287!5m2!1sen!2sin"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full rounded-lg"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-[#fff7f9] to-[#f4f9fd] p-5 rounded-2xl shadow-md">
              <h3 className="font-semibold text-lg mb-4">Send Us Message</h3>
              <form className="space-y-3 text-sm">
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <textarea
                  placeholder="Your Message"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                  rows={3}
                ></textarea>
                <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white w-full py-2 rounded-md text-sm font-medium">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetailsPage;

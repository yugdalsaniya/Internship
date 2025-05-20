import React from "react";
import { FaMapMarkerAlt, FaClock, FaRupeeSign } from "react-icons/fa";
import backgroundImg from "../assets/Hero/banner.jpg"; // Make sure path is correct

const internships = [
  {
    id: 1,
    title: "Marketing",
    company: "Allcargo Logistics Limited",
    location: "Ahmedabad",
    time: "Full time",
    salary: "₹25,000 – ₹30,000",
  },
  {
    id: 2,
    title: "Graphic Designer",
    company: "Weblinic Enterprises",
    location: "Ahmedabad",
    time: "Full time",
    salary: "₹15,000 – ₹25,000",
  },
  {
    id: 3,
    title: "Ui/Ux Designer",
    company: "Weblinic Enterprises",
    location: "Ahmedabad",
    time: "Full time",
    salary: "₹25,000 – ₹30,000",
  },
  {
    id: 4,
    title: "Graphic Designer",
    company: "Flipspaces co Limited",
    location: "Ahmedabad",
    time: "Full time",
    salary: "₹25,000 – ₹30,000",
  },
  {
    id: 5,
    title: "Marketing",
    company: "Allcargo Logistics Limited",
    location: "Ahmedabad",
    time: "Full time",
    salary: "₹25,000 – ₹30,000",
  },
];

export default function InternshipPage() {
  return (
    <>
      {/* Hero Section */}
      <div
        className="w-full h-[300px] md:h-[350px] flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#f7d7db]/90 via-white/70 to-[#c3e5df]/90"></div>
        <div className="relative text-center px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#050748] tracking-wide">
            Internships
          </h1>
          <p className="mt-2 text-sm md:text-lg font-medium text-[#1e2a60]">
            "Empower Your Future: Unleash Limitless Career Possibilities!"
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row px-4 md:px-12 py-8 bg-[#fafafa]">
        {/* Sidebar */}
        <div className="w-full md:w-1/4 bg-white shadow-md rounded-xl p-6 mb-6 md:mb-0">
          <h2 className="text-lg font-semibold mb-4">Search by Internship Title</h2>
          <input
            type="text"
            placeholder="Internship title or company"
            className="w-full p-2 border rounded-lg mb-4 text-sm"
          />
          <h3 className="font-medium text-sm mb-2">Location</h3>
          <select className="w-full p-2 border rounded-lg mb-4 text-sm">
            <option>Choose city</option>
          </select>

          {/* Filter Categories */}
          {[
            { title: "Category", items: ["Commerce", "Telecommunications", "Hotels & Tourism", "Education", "Financial Services"] },
            { title: "Internship Type", items: ["Full Time", "Part Time", "Freelance", "Seasonal", "Fixed-Price"] },
            { title: "Experience Level", items: ["No-experience", "Fresher", "Intermediate", "Expert"] },
            { title: "Date Posted", items: ["All", "Last Hour", "Last 24 Hours", "Last 7 Days", "Last 30 Days"] },
          ].map(({ title, items }) => (
            <div key={title} className="mb-4">
              <h3 className="font-medium text-sm mb-2">{title}</h3>
              {items.map((item) => (
                <label key={item} className="block text-sm text-gray-700">
                  <input type="checkbox" className="mr-2" /> {item}
                </label>
              ))}
            </div>
          ))}

          {/* Salary Filter */}
          <div className="mb-2">
            <h3 className="font-medium text-sm mb-2">Salary</h3>
            <input type="range" min="0" max="100000" className="w-full" />
            <p className="text-xs text-gray-600 mt-1">Salary: ₹0 - ₹99999</p>
          </div>
          <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg mt-2 text-sm font-bold">
            Apply
          </button>
        </div>

        {/* Internship Cards */}
        <div className="w-full md:w-3/4 md:pl-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">Showing 6 - 6 of 10 results</p>
            <select className="p-2 border text-sm rounded-lg">
              <option>Sort by latest</option>
            </select>
          </div>

          <div className="space-y-4">
            {internships.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div>
                  <span className="text-xs bg-[#e4e4e4] px-2 py-1 rounded-full text-gray-700 mb-2 inline-block">
                    10 min ago
                  </span>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                  <div className="flex gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <FaClock /> {job.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaRupeeSign /> {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt /> {job.location}
                    </div>
                  </div>
                </div>
                <button className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-[#443bc4] font-bold">
                  Internship Details
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
  {/* Center-aligned page numbers */}
          <div className="flex gap-4 justify-center w-full">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 font-bold">
              2
            </button>
          </div>

  {/* Right-aligned next button */}
          <div className="ml-auto">
            <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100">
              <span className="font-semibold">Next</span>
              <span className="text-base">❯</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

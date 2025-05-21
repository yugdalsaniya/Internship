import React from 'react';
import { FaGoogle, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { MdVisibilityOff, MdCalendarToday } from 'react-icons/md';
import rightImage from '../assets/SignUp/wallpaper.jpg'; // Replace with your actual image path
import logo from '../assets/Navbar/logo.png'; // Adjust the path based on your file location
import student from '../assets/SignUp/student.png'; // Adjust the path based on your file location
import linkedin from '../assets/SignUp/linkedin.png'; // Adjust the path based on your file location
import facebook from '../assets/SignUp/facebook.png'; // Adjust the path based on your file location
import company from '../assets/SignUp/company.png'; // Adjust the path based on your file location


const SignUp = () => {
  return (
    <div className="flex h-screen font-sans overflow-hidden">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-4">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#050748] tracking-wide">
                INTERNSHIP–OJT
              </h1>
              <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
              <p className="text-[11px] sm:text-xs text-black font-bold text-center">
                WORK24 PHILIPPINES
              </p>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="flex gap-10 mb-10">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl border shadow-sm">
              <img src={student} alt="Student" className="w-10 h-10" />
            </div>
            <span className="text-sm mt-2 font-medium">Student</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl border shadow-sm">
              <img src={company} alt="Company" className="w-10 h-10" />
            </div>
            <span className="text-sm mt-2 font-medium">Company</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl border shadow-sm">
              <img src="https://img.icons8.com/color/48/google-logo.png" alt="Academy" className="w-10 h-10" />
            </div>
            <span className="text-sm mt-2 font-medium">Academy</span>
          </div>
        </div>

        {/* Form */}
        <div className="w-full max-w-xs sm:max-w-sm">
          <h2 className="text-2xl font-bold mb-1 text-black">Sign up</h2>
          <p className="text-sm text-gray-500 mb-6">Sign up to enjoy the feature of Revolutie</p>

          <form className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 border rounded-md outline-none text-sm"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Date of Birth"
                className="w-full px-4 py-2 border rounded-md pr-10 text-sm"
              />
              <MdCalendarToday className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-md outline-none text-sm"
            />
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-md pr-10 text-sm"
              />
              <MdVisibilityOff className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500" />
            </div>
            <button
              type="submit"
              className="w-full bg-[#3D7EFF] text-white py-2 rounded-md font-semibold text-xs"
            >
              Sign up
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t" />
            <span className="mx-3 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-t" />
          </div>

          {/* Social Buttons */}
        <div className="flex justify-center gap-6 mb-6">
            <button className="border p-2 rounded-md">
                <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" className="w-6 h-6" />
            </button>
            <button className="border p-2 rounded-md">
                <img src={facebook} alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="border p-2 rounded-md">
                <img src={linkedin} alt="LinkedIn" className="w-6 h-6" />
            </button>
        </div>

          <p className="text-sm text-center">
            Already have an account?{' '}
            <a href="#" className="text-[#3D7EFF] font-semibold">Sign in</a>
          </p>
        </div>
      </div>

      {/* Right Side Image */}
      <div className="hidden lg:flex w-1/2 p-4">
        <div
          className="w-full h-full bg-cover bg-center rounded-3xl"
          style={{ backgroundImage: `url(${rightImage})` }}
        ></div>
      </div>
    </div>
  );
};

export default SignUp;

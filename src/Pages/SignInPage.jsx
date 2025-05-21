import React from 'react';
import logo from '../assets/Navbar/logo.png';
import rightImage from '../assets/SignUp/wallpaper.jpg';
import facebook from '../assets/SignUp/facebook.png';
import linkedin from '../assets/SignUp/linkedin.png';

const SignIn = () => {
  return (
    <div className="flex h-screen font-sans overflow-hidden">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-4">
        <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm">
          {/* Logo at top, now centered */}
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

          {/* Sign-in form */}
          <h2 className="text-2xl font-bold mb-1 text-black">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">Please login to continue to your account.</p>

          <form className="space-y-4 w-full">
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
              <svg
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.077.255-.166.504-.267.745"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center">
                <input type="checkbox" className="mr-2" />
                Keep me logged in
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3D7EFF] text-white py-2 rounded-md font-semibold text-xs"
            >
              Sign in
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 w-full">
            <hr className="flex-grow border-t" />
            <span className="mx-3 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-t" />
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center gap-6 mb-6 w-full">
            <button className="border p-2 rounded-md">
              <img
                src="https://img.icons8.com/color/48/google-logo.png"
                alt="Google"
                className="w-6 h-6"
              />
            </button>
            <button className="border p-2 rounded-md">
              <img src={facebook} alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="border p-2 rounded-md">
              <img src={linkedin} alt="LinkedIn" className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-center">
            Need an account?{' '}
            <a href="#" className="text-[#3D7EFF] font-semibold">
              Create one
            </a>
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

export default SignIn;

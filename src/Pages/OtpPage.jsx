import React from 'react';
import logo from '../assets/Navbar/logo.png'; // Adjust path as needed
import otpImage from '../assets/SignUp/otp.jpg'; // Replace with your actual OTP image path
import rightImage from '../assets/SignUp/wallpaper.jpg'; // Adjust to your image path

const OtpVerification = () => {
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

        {/* OTP Illustration */}
        <div className="mb-6">
          <img src={otpImage} alt="OTP Verification" className="w-60" />
        </div>

        {/* OTP Form */}
        <div className="w-full max-w-xs sm:max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-2 text-black">Verify Your Email Address</h2>
          <p className="text-sm text-gray-500 mb-6">Verify your email with the OTP sent</p>

          <form className="space-y-6">
            <div className="flex justify-between gap-2">
              {Array(4).fill().map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 border rounded-md text-center text-xl outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-[#3D7EFF] text-white py-2 rounded-md font-semibold text-xs"
            >
              Sign up
            </button>
          </form>

          <button className="text-sm text-[#3D7EFF] font-medium mt-4">Resend</button>
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

export default OtpVerification;

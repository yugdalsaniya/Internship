import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Navbar/logo.png';
import otpImage from '../assets/SignUp/otp.jpg';
import rightImage from '../assets/SignUp/wallpaper.jpg';
import { verifyOtp } from '../Utils/api';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter a 4-digit OTP');
      setLoading(false);
      return;
    }

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
    if (!pendingUser) {
      setError('No pending user data found. Please sign up again.');
      setLoading(false);
      return;
    }

    try {
      const otpPayload = {
        appName: 'app8657281202648',
        username: pendingUser.email.toLowerCase().trim(),
        type: 'email',
        otp: otpCode,
      };
      const response = await verifyOtp(otpPayload);
      if (response.success) {
        localStorage.setItem('user', JSON.stringify({
          legalname: pendingUser.legalname,
          email: pendingUser.email.toLowerCase().trim(),
          role: pendingUser.role,
        }));
        localStorage.removeItem('pendingUser');
        navigate('/');
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during OTP verification';
      if (errorMessage.includes('Role not found')) {
        setError('Role not found for this user. Please contact support@conscor.com to verify your role.');
      } else if (err.response?.status === 404) {
        setError('OTP verification service unavailable. Please try again later or contact support@conscor.com.');
      } else {
        setError(`${errorMessage}. Please try again or contact support@conscor.com.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);
    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
    if (!pendingUser) {
      setError('No pending user data found. Please sign up again.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('https://crmapi.conscor.com/api/v1/auth/signup/otp', {
        method: 'POST',
        headers: {
          'x-api-key': 'LHCHoE0IlCOuESA4VQuJ',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName: 'app8657281202648',
          type: 'otp',
          legalname: pendingUser.legalname,
          username: pendingUser.email.toLowerCase().trim(),
          password: '', // Password not required for resend
          mobile: '',
          role: pendingUser.role,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setError('OTP resent successfully. Check your email.');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Error resending OTP. Please try again or contact support@conscor.com.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-4">
        <div className="max-w-xs sm:max-w-sm mx-auto w-full">
          {/* Logo Section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-2">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-[#050748] tracking-wide">
                  INTERNSHIP–OJT
                </h1>
                <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
                <p className="text-xs text-black font-bold text-center">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
          </div>

          {/* OTP Image */}
          <div className="mb-6 flex justify-center">
            <img src={otpImage} alt="OTP Verification" className="w-40" />
          </div>

          {/* Form Section */}
          <div className="w-full text-center">
            <h2 className="text-xl font-bold mb-1 text-black">Verify Your Email Address</h2>
            <p className="text-xs text-gray-500 mb-4">Verify your email with the OTP sent</p>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-10 h-10 border rounded-md text-center text-sm outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-[#3D7EFF] text-white py-2 rounded-md font-semibold text-xs"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <button
              onClick={handleResend}
              className="text-xs text-[#3D7EFF] font-medium mt-3"
              disabled={loading}
            >
              {loading ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
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
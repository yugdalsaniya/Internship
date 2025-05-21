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
      console.log('Sending OTP verification payload:', otpPayload);
      const response = await verifyOtp(otpPayload);
      console.log('OTP verification response:', response);
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
      console.error('OTP verification error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
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
      console.log('Resend OTP response:', data);
      if (data.success) {
        setError('OTP resent successfully. Check your email.');
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Error resending OTP. Please try again or contact support@conscor.com.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-4">
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

        <div className="mb-6">
          <img src={otpImage} alt="OTP Verification" className="w-60" />
        </div>

        <div className="w-full max-w-xs sm:max-w-sm text-center">
          <h2 className="text-2xl font-bold mb-2 text-black">Verify Your Email Address</h2>
          <p className="text-sm text-gray-500 mb-6">Verify your email with the OTP sent</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="w-12 h-12 border rounded-md text-center text-xl outline-none"
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
            className="text-sm text-[#3D7EFF] font-medium mt-4"
            disabled={loading}
          >
            {loading ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>
      </div>

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
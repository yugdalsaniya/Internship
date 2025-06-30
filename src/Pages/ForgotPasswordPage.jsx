import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import logo from '../assets/Navbar/logo.png';
import rightImage from '../assets/SignUp/wallpaper1.png';
import { forgotPassword, verifyOtp, resetPassword } from '../Utils/api';

const MySwal = withReactContent(Swal);

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const appName = 'app8657281202648';

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    setError('');
    setLoading(true);
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await forgotPassword(email.toLowerCase().trim(), appName);
      setOtpSent(true);
      MySwal.fire({
        icon: 'success',
        title: 'OTP Sent',
        text: 'An OTP has been sent to your registered email.',
        confirmButtonText: 'OK',
      });
      setStep(2);
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Email not found. Please try again.',
        confirmButtonText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setVerifyLoading(true);
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter a 4-digit OTP');
      setVerifyLoading(false);
      return;
    }

    try {
      const otpPayload = {
        appName,
        username: email.toLowerCase().trim(),
        type: 'email',
        otp: otpCode,
      };
      const response = await verifyOtp(otpPayload);
      console.log('verifyOtp response:', response); // Debug log

      if (response.success) {
        const tokenValue = response.token || response.accessToken || response.resetToken || response.data?.token;
        if (!tokenValue) {
          setError('No reset token received. Please request a new OTP.');
          MySwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No reset token received. Please request a new OTP.',
            confirmButtonText: 'OK',
          }).then(() => {
            setStep(1);
            setOtpSent(false);
            setOtp(['', '', '', '']);
          });
          setVerifyLoading(false);
          return;
        }
        setToken(tokenValue);
        setStep(3);
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: response.message || 'The OTP entered is incorrect. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      console.error('OTP Verification Error:', err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || 'OTP verification failed';
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage.includes('Invalid OTP') || errorMessage.includes('expired')
          ? 'Invalid or expired OTP. Please request a new OTP.'
          : `${errorMessage}. Please try again or contact support@conscor.com.`,
        confirmButtonText: 'OK',
      }).then(() => {
        if (errorMessage.includes('Invalid OTP') || errorMessage.includes('expired')) {
          setStep(1);
          setOtpSent(false);
          setOtp(['', '', '', '']);
        }
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(token, newPassword, appName);
      MySwal.fire({
        icon: 'success',
        title: 'Password Reset Successful',
        text: 'You will be redirected to the login page.',
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        navigate('/login');
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password';
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage.includes('Invalid token') || errorMessage.includes('expired')
          ? 'The reset token is invalid or has expired. Please request a new OTP.'
          : `${errorMessage}. Please try again or contact support@conscor.com.`,
        confirmButtonText: 'OK',
      });
      if (errorMessage.includes('Invalid token') || errorMessage.includes('expired')) {
        setStep(1);
        setOtpSent(false);
        setOtp(['', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendLoading(true);
    try {
      await forgotPassword(email.toLowerCase().trim(), appName);
      setOtp(['', '', '', '']);
      MySwal.fire({
        icon: 'success',
        title: 'OTP Resent',
        text: 'A new OTP has been sent to your email.',
        confirmButtonText: 'OK',
      });
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to resend OTP. Please try again.',
        confirmButtonText: 'OK',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
   <div className="flex h-screen ">
  {/* Left Side - Form */}
  <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-2 xs:px-6 sm:px-8">
    <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full">
      {/* Logo Section */}
      <div className="mb-3 flex flex-col items-center">
         <div className="flex items-center mb-3">
                      <img
                        src={logo}
                        alt="Internship-OJT Logo"
                        className="h-16 w-auto mr-2"
                      />
                    </div>
      </div>

      {/* Form Section */}
      <div className="w-full">
        <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Reset Password'}
        </h2>
        <p className="text-xs xs:text-sm text-gray-500 mb-2">
          {step === 1 && 'Enter your email to receive an OTP.'}
          {step === 2 && 'Enter the OTP sent to your email.'}
          {step === 3 && 'Enter your new password.'}
        </p>
        {error && <p className="text-red-500 text-xs xs:text-sm mb-2">{error}</p>}

        {step === 1 && (
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF]"
              required
            />
            <button
              onClick={handleForgotPassword}
              disabled={loading || otpSent}
              className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors ${
                loading || otpSent ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending OTP...' : otpSent ? 'OTP Sent' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-10 h-10 border rounded-md text-center text-sm outline-none focus:ring-2 focus:ring-[#3D7EFF]"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={verifyLoading || resendLoading}
              className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors ${
                verifyLoading || resendLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {verifyLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={verifyLoading || resendLoading}
                className={`text-xs xs:text-sm text-[#3D7EFF] font-medium hover:text-blue-600 transition-colors ${
                  verifyLoading || resendLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {resendLoading ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base pr-10 focus:ring-2 focus:ring-[#3D7EFF]"
                required
              />
              {showNewPassword ? (
                <MdVisibility
                  className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                  onClick={toggleNewPasswordVisibility}
                />
              ) : (
                <MdVisibilityOff
                  className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                  onClick={toggleNewPasswordVisibility}
                />
              )}
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base pr-10 focus:ring-2 focus:ring-[#3D7EFF]"
                required
              />
              {showConfirmPassword ? (
                <MdVisibility
                  className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                  onClick={toggleConfirmPasswordVisibility}
                />
              ) : (
                <MdVisibilityOff
                  className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                  onClick={toggleConfirmPasswordVisibility}
                />
              )}
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}

        <p className="text-xs xs:text-sm text-center mt-2.5">
          Back to{' '}
          <Link to="/login" className="text-[#3D7EFF] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>

  {/* Right Side - Image */}
  <div className="hidden lg:flex w-1/2 p-2">
    <div
      className="w-full h-full bg-cover bg-center rounded-3xl"
      style={{ backgroundImage: `url(${rightImage})` }}
    ></div>
  </div>
</div>

  );
};

export default ForgotPassword;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/Navbar/logo.png';
import otpImage from '../assets/SignUp/otpimg.png';
import { verifyOtp, forgotPassword, login } from '../Utils/api';

const MySwal = withReactContent(Swal);

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerKey, setTimerKey] = useState(0);
  const navigate = useNavigate();
  const formRef = useRef(null);

  const roleNames = {
    '1747825619417': 'student',
    '1747723485001': 'company',
    '1747903042943': 'academy',
    '1747902920002': 'recruiter',
    '1747902955524': 'mentor',
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerKey]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
    e.stopPropagation();
    setError('');
    setVerifyLoading(true);

    if (timeLeft <= 0) {
      setError('OTP has expired. Please request a new one.');
      setVerifyLoading(false);
      MySwal.fire({
        icon: 'error',
        title: 'OTP Expired',
        text: 'The OTP has expired. Please request a new one.',
        confirmButtonText: 'OK',
      });
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      setError('Please enter a 4-digit OTP');
      setVerifyLoading(false);
      return;
    }

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
    if (!pendingUser) {
      setError('No pending user data found. Please sign up again.');
      setVerifyLoading(false);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No pending user data found. Please sign up again.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/signup');
      });
      return;
    }

    const email = pendingUser.email.toLowerCase().trim();
    try {
      const otpPayload = {
        appName: 'app8657281202648',
        username: email,
        type: 'email',
        otp: otpCode,
      };
      const otpResponse = await verifyOtp(otpPayload);
      if (otpResponse.success) {
        if (pendingUser.roleId === '1747825619417' || pendingUser.roleId === '1747903042943') { // Added academy role
          if (!pendingUser.password) {
            setError('Password not found. Please sign up again.');
            setVerifyLoading(false);
            MySwal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Password not found. Please sign up again.',
              confirmButtonText: 'OK',
            }).then(() => {
              navigate('/signup');
            });
            return;
          }

          try {
            const loginResponse = await login({
              appName: 'app8657281202648',
              username: email,
              password: pendingUser.password,
            });

            if (loginResponse.success) {
              console.log('API Login Response User:', loginResponse.user);

              const roleId = loginResponse.user.role?.role || '';
              const roleName = roleNames[roleId];

              if (!roleName) {
                setError('Invalid or unrecognized role. Please contact support@conscor.com.');
                setVerifyLoading(false);
                MySwal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Invalid or unrecognized role. Please contact support@conscor.com.',
                  confirmButtonText: 'OK',
                });
                return;
              }

              const decodedToken = jwtDecode(loginResponse.accessToken);
              if (decodedToken.roleId !== roleId) {
                console.warn('Role ID mismatch between API response and JWT:', {
                  apiRoleId: roleId,
                  jwtRoleId: decodedToken.roleId,
                });
                setError('Role verification failed. Please contact support@conscor.com.');
                setVerifyLoading(false);
                MySwal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Role verification failed. Please contact support@conscor.com.',
                  confirmButtonText: 'OK',
                });
                return;
              }

              const userData = {
                legalname: loginResponse.user.legalname || loginResponse.user.email,
                email: loginResponse.user.email,
                role: roleName,
                roleId: roleId,
                userid: loginResponse.user._id || loginResponse.user.userId || '',
              };

              // Add companyId for academy role, similar to company role in SignUpPage.jsx
              if (roleName === 'academy') {
                userData.companyId = loginResponse.user.companyId || '';
                userData.userid = loginResponse.user._id || '';
              }

              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('accessToken', loginResponse.accessToken);
              localStorage.setItem('refreshToken', loginResponse.refreshToken);
              localStorage.removeItem('pendingUser');

              MySwal.fire({
                icon: 'success',
                title: 'Signup Successful',
                text: 'Your account has been verified and you are now logged in.',
                showConfirmButton: false,
                timer: 2000,
              }).then(() => {
                navigate('/editprofile');
              });
            } else {
              setError(loginResponse.message || 'Automatic login failed. Please sign in manually.');
              setVerifyLoading(false);
              MySwal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: loginResponse.message || 'Automatic login failed. Please sign in manually.',
                confirmButtonText: 'OK',
              }).then(() => {
                navigate('/login');
              });
            }
          } catch (loginErr) {
            console.error('Login Error:', loginErr.response?.data || loginErr);
            const loginErrorMessage =
              loginErr.response?.data?.message || loginErr.message || 'An error occurred during login';
            setError(loginErrorMessage);
            setVerifyLoading(false);
            MySwal.fire({
              icon: 'error',
              title: 'Login Error',
              text: `${loginErrorMessage}. Please sign in manually or contact support@conscor.com.`,
              confirmButtonText: 'OK',
            }).then(() => {
              navigate('/login');
            });
            return;
          }
        } else {
          const userData = {
            ...pendingUser,
            userid: otpResponse.user?.userId || otpResponse.userId || '',
            redirectTo: undefined,
          };
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.removeItem('pendingUser');

          MySwal.fire({
            icon: 'success',
            title: 'Signup Successful',
            text: 'Your account has been verified.',
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            navigate('/editprofile');
          });
        }
      } else {
        setError(otpResponse.message || 'OTP verification failed');
        MySwal.fire({
          icon: 'error',
          title: 'Invalid OTP',
          text: otpResponse.message || 'The OTP entered is incorrect. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      console.error('OTP Verification Error:', err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || err.message || 'An error occurred during OTP verification';
      setError(errorMessage);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text:
          errorMessage.includes('Invalid OTP') || errorMessage.includes('expired')
            ? 'Invalid or expired OTP. Please request a new OTP.'
            : `${errorMessage}. Please try again or contact support@conscor.com.`,
        confirmButtonText: 'OK',
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setResendLoading(true);

    const pendingUser = JSON.parse(localStorage.getItem('pendingUser'));
    if (!pendingUser) {
      setError('No pending user data found. Please sign up again.');
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No pending user data found. Please sign up again.',
        confirmButtonText: 'OK',
      }).then(() => {
        navigate('/signup');
      });
      setResendLoading(false);
      return;
    }

    const email = pendingUser.email.toLowerCase().trim();
    try {
      await forgotPassword(email, 'app8657281202648');
      setOtp(['', '', '', '']);
      setTimeLeft(120);
      setTimerKey((prev) => prev + 1);
      MySwal.fire({
        icon: 'success',
        title: 'OTP Resent',
        text: 'A new OTP has been sent to your email.',
        confirmButtonText: 'OK',
      });
    } catch (err) {
      console.error('Resend OTP Error:', err.response?.data || err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Error resending OTP';
      setError(errorMessage);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text:
          errorMessage.includes('Email not found') || errorMessage.includes('User not found')
            ? 'Email not registered. Please sign up again.'
            : `${errorMessage}. Please try again or contact support@conscor.com.`,
        confirmButtonText: 'OK',
      }).then(() => {
        if (errorMessage.includes('Email not found') || errorMessage.includes('User not found')) {
          navigate('/signup');
        }
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-2 xs:px-6 sm:px-8">
        <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full">
          <div className="mb-3 flex flex-col items-center">
            <div className="flex items-center mb-3">
              <img src={logo} alt="Internship-OJT Logo" className="h-20 w-auto mr-2" />
            </div>
          </div>
          
          <div className="w-full">
            <div className  ="text-center">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">
                Verify Your Email Address
              </h2>
              <p className="text-xs xs:text-sm text-gray-500 mb-2">
                Verify your email with the OTP sent.
              </p>
              <p className="text-xs xs:text-sm text-gray-500 mb-2">
                {timeLeft > 0 ? `OTP valid for ${formatTime(timeLeft)}` : 'OTP expired! Please resend.'}
              </p>
              {error && (
                <p
                  className={`text-xs xs:text-sm mb-2 ${
                    error.includes('successfully') ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {error}
                </p>
              )}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                <div className="flex justify-center gap-2 xs:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      className="w-10 h-10 xs:w-12 xs:h-12 border rounded-md text-center text-sm xs:text-base outline-none focus:ring-2 focus:ring-[#3D7EFF]"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={verifyLoading || resendLoading || timeLeft <= 0}
                  className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors ${
                    verifyLoading || resendLoading || timeLeft <= 0 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {verifyLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={verifyLoading || resendLoading}
                  className={`text-xs xs:text-sm text-[#3D7EFF] font-medium hover:text-blue-600 hover:underline transition-colors ${
                    verifyLoading || resendLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {resendLoading ? 'Resending...' : "Didn't receive code? Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 p-2">
        <div
          className="w-full h-full bg-cover bg-center rounded-3xl opacity-75"
          style={{
            backgroundImage: `linear-gradient(to right, #F9DCDF, #B5D9D3), url(${otpImage})`,
            backgroundBlendMode: 'multiply',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
      </div>
    </div>
  );
};

export default OtpVerification;
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { MdVisibility, MdVisibilityOff, MdCheckCircle } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import student from "../assets/SignUp/student.png";
import company from "../assets/SignUp/company.png";
import academy from "../assets/SignUp/academy.png";
import recruiter from "../assets/SignUp/recruiter.png";
import mentor from "../assets/SignUp/mentor.png";
import wallpaper1 from "../assets/SignUp/wallpaper1.png";
import wallpaper2 from "../assets/SignUp/wallpaper2.png";
import wallpaper3 from "../assets/SignUp/wallpaper3.jpg";
import wallpaper4 from "../assets/SignUp/wallpaper4.jpg";
import wallpaper5 from "../assets/SignUp/wallpaper5.jpg";
import logo from "../assets/Navbar/logo.png";
import { signup, signupCompany, login, sendOtp } from "../Utils/api";

const SignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    academyName: "",
    mobile: "",
    countryCode: "+63",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otpExpiration, setOtpExpiration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const roleIds = {
    student: "1747825619417",
    company: "1747723485001",
    academy: "1747903042943",
    recruiter: "1747902920002",
    mentor: "1747902955524",
  };

  const roleNames = {
    1747825619417: "student",
    1747723485001: "company",
    1747903042943: "academy",
    1747902920002: "recruiter",
    1747902955524: "mentor",
  };

  const roleImages = {
    student: wallpaper1,
    company: wallpaper2,
    academy: wallpaper3,
    mentor: wallpaper4,
    recruiter: wallpaper5,
  };

  const roleDescriptions = {
    student: [
      "Find internships, OJTs, and entry-level jobs",
      "Apply directly with a smart Inturship profile",
      "Learn with free workshops and short courses",
      "Get career-ready through real-world experiences",
    ],
    company: [
      "Post internships and job openings",
      "Search from a pool of pre-screened candidates",
      "Build your employer brand on campus",
      "Manage hiring with simple, effective tools",
    ],
    academy: [
      "Track internship activity & student growth",
      "Connect with verified industry partners",
      "Monitor performance and placement metrics",
      "Enable smooth campus-to-industry transition",
    ],
    recruiter: [
      "Post internships and job openings",
      "Search from a pool of pre-screened candidates",
      "Build your employer brand on campus",
      "Manage hiring with simple, effective tools",
    ],
    mentor: [
      "Offer 1-on-1 mentorship or group sessions",
      "Share insights via talks, webinars, or Q&As",
      "Help students build their career roadmap",
      "Boost your professional visibility and impact",
    ],
  };

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const validRoles = ["student", "company", "academy", "recruiter", "mentor"];
    if (validRoles.includes(path)) {
      setRole(path);
    } else {
      setRole("student");
      navigate("/signup/student", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    let timer;
    if (otpExpiration) {
      timer = setInterval(() => {
        const now = Date.now();
        const timeRemaining = Math.max(0, Math.floor((otpExpiration - now) / 1000));
        setTimeLeft(timeRemaining);
        if (timeRemaining === 0) {
          localStorage.removeItem("generatedOtp");
          setShowOtpField(false);
          setOtpExpiration(null);
          setErrors((prev) => ({ ...prev, otp: "" }));
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 10) {
        setFormData({ ...formData, [name]: digitsOnly });
      }
    } else if (name === "otp") {
      const digitsOnly = value.replace(/\D/g, "");
      if (digitsOnly.length <= 4) {
        setFormData({ ...formData, [name]: digitsOnly });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
    return passwordRegex.test(password);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^\d*$/;
    return mobileRegex.test(mobile);
  };

  const validateOtp = (otp) => {
    const otpRegex = /^\d{4}$/;
    return otpRegex.test(otp);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    navigate(`/signup/${newRole}`);
    setFormData({
      name: "",
      companyName: "",
      academyName: "",
      mobile: "",
      countryCode: "+63",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
    });
    setErrors({});
    setConsentChecked(false);
    setShowFullPolicy(false);
    setIsEmailVerified(false);
    setShowOtpField(false);
    setOtpExpiration(null);
    setTimeLeft(null);
    localStorage.removeItem("generatedOtp");
  };

  const handleConsentChange = () => {
    setConsentChecked(!consentChecked);
    setErrors((prev) => ({ ...prev, consent: "" }));
  };

  const togglePolicyVisibility = () => {
    setShowFullPolicy(!showFullPolicy);
  };

  const handleVerifyEmail = async () => {
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, email: "" }));
      }, 5000);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await sendOtp(formData.email.toLowerCase().trim());
      if (response.success) {
        setShowOtpField(true);
        setOtpExpiration(Date.now() + 2 * 60 * 1000);
        setTimeLeft(120);
        setErrors((prev) => ({ ...prev, otp: "" }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.message || "Failed to send OTP.",
        }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: "" }));
        }, 5000);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to send OTP.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: "" }));
      }, 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, email: "" }));
      }, 5000);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await sendOtp(formData.email.toLowerCase().trim());
      if (response.success) {
        setShowOtpField(true);
        setOtpExpiration(Date.now() + 2 * 60 * 1000);
        setTimeLeft(120);
        setErrors((prev) => ({
          ...prev,
          otp: "",
          general: "New OTP sent to your email. Please enter it below.",
        }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: "" }));
        }, 5000);
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.message || "Failed to resend OTP.",
        }));
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: "" }));
        }, 5000);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to resend OTP.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: "" }));
      }, 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = () => {
    const storedOtp = localStorage.getItem("generatedOtp");
    if (!validateOtp(formData.otp)) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP must be a 4-digit number.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, otp: "" }));
      }, 5000);
      return;
    }

    if (!storedOtp) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP has expired or is invalid. Please request a new one.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, otp: "" }));
      }, 5000);
      setShowOtpField(false);
      return;
    }

    if (formData.otp === storedOtp) {
      setIsEmailVerified(true);
      setShowOtpField(false);
      setFormData((prev) => ({ ...prev, otp: "" }));
      setOtpExpiration(null);
      setTimeLeft(null);
      localStorage.removeItem("generatedOtp");
      setErrors((prev) => ({
        ...prev,
        otp: "",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, general: "" }));
      }, 5000);
    } else {
      setErrors((prev) => ({
        ...prev,
        otp: "Invalid OTP. Please try again.",
      }));
      setTimeout(() => {
        setErrors((prev) => ({ ...prev, otp: "" }));
      }, 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be 100 characters or less.";
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (formData.email.trim().length > 100) {
      newErrors.email = "Email must be 100 characters or less.";
    }
    if (role === "company" && !isEmailVerified) {
      newErrors.email = "Please verify your email address.";
    }
    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be 8–20 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., !@#$%^&*).";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = "Mobile number must contain only digits.";
    } else if (formData.mobile.trim().length !== 10) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }
    if (role === "company" && !formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required.";
    } else if (role === "company" && formData.companyName.trim().length > 100) {
      newErrors.companyName = "Company Name must be 100 characters or less.";
    }
    if (role === "academy" && !formData.academyName.trim()) {
      newErrors.academyName = "Academy Name is required.";
    } else if (role === "academy" && formData.academyName.trim().length > 100) {
      newErrors.academyName = "Academy Name must be 100 characters or less.";
    }
    if (!consentChecked) {
      newErrors.consent = "You must agree to the Privacy Policy to proceed.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      setTimeout(() => {
        setErrors({});
      }, 5000);
      return;
    }

    setIsLoading(true);

    try {
      let payload;
      let response;

      const fullMobileNumber = `${formData.countryCode}${formData.mobile.trim()}`;

      if (role === "company") {
        payload = {
          appName: "app8657281202648",
          companyName: formData.companyName.trim(),
          mobile: fullMobileNumber,
          legalname: formData.name.trim(),
          role: roleIds[role],
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          type: "Company",
        };
        console.log("Company Signup Payload:", payload);
        response = await signupCompany(payload);

        if (response.success) {
          setFormData({
            name: "",
            companyName: "",
            academyName: "",
            mobile: "",
            countryCode: "+63",
            email: "",
            password: "",
            confirmPassword: "",
            otp: "",
          });
          setErrors({});
          setConsentChecked(false);
          setShowFullPolicy(false);
          setIsEmailVerified(false);
          setShowOtpField(false);
          setOtpExpiration(null);
          setTimeLeft(null);

          const loginResponse = await login({
            appName: "app8657281202648",
            username: formData.email.toLowerCase().trim(),
            password: formData.password,
          });

          if (loginResponse.success) {
            console.log("API Login Response User:", loginResponse.user);

            const roleId = loginResponse.user.role?.role || "";
            const roleName = roleNames[roleId];

            if (!roleName) {
              setErrors({
                general:
                  "Invalid or unrecognized role. Please contact support@conscor.com.",
              });
              setTimeout(() => {
                setErrors((prev) => ({ ...prev, general: "" }));
              }, 5000);
              setIsLoading(false);
              return;
            }

            const decodedToken = jwtDecode(loginResponse.accessToken);
            if (decodedToken.roleId !== roleId) {
              console.warn("Role ID mismatch between API response and JWT:", {
                apiRoleId: roleId,
                jwtRoleId: roleName,
              });
              setErrors({
                general:
                  "Role verification failed. Please contact support@conscor.com.",
              });
              setTimeout(() => {
                setErrors((prev) => ({ ...prev, general: "" }));
              }, 5000);
              setIsLoading(false);
              return;
            }

            const userData = {
              legalname: loginResponse.user.legalname || loginResponse.user.email,
              email: loginResponse.user.email,
              role: roleName,
              roleId: roleId,
              mobile: fullMobileNumber,
            };

            if (roleName === "company" || roleName === "academy") {
              userData.companyId = loginResponse.user.companyId || "";
              userData.userid = loginResponse.user._id || "";
            }

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("accessToken", loginResponse.accessToken);
            localStorage.setItem("refreshToken", loginResponse.refreshToken);

            const from = location.state?.from || "/editprofile";
            navigate(from, { replace: true });
          } else {
            setErrors({
              general:
                loginResponse.message ||
                "Automatic login failed. Please sign in manually.",
            });
            setTimeout(() => {
              setErrors((prev) => ({ ...prev, general: "" }));
            }, 5000);
          }
        } else {
          setErrors({ general: response.message || "Signup failed" });
          setTimeout(() => {
            setErrors((prev) => ({ ...prev, general: "" }));
          }, 5000);
        }
      } else {
        payload = {
          appName: "app8657281202648",
          type: "otp",
          name: formData.email.toLowerCase().trim(),
          username: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: roleIds[role],
          legalname: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          mobile: fullMobileNumber,
        };
        if (role === "academy") {
          payload.academyName = formData.academyName.trim();
        }
        console.log("Signup Payload:", payload);
        response = await signup(payload);

        if (response.success) {
          localStorage.setItem(
            "pendingUser",
            JSON.stringify({
              legalname: formData.name.trim(),
              email: formData.email.toLowerCase().trim(),
              password: formData.password,
              role: roleNames[roleIds[role]],
              roleId: roleIds[role],
              mobile: fullMobileNumber,
              ...(role === "academy" && {
                academyName: formData.academyName.trim(),
              }),
              redirectTo: location.state?.from || "/editprofile",
            })
          );
          setFormData({
            name: "",
            companyName: "",
            academyName: "",
            mobile: "",
            countryCode: "+63",
            email: "",
            password: "",
            confirmPassword: "",
            otp: "",
          });
          setErrors({});
          setConsentChecked(false);
          setShowFullPolicy(false);
          setIsEmailVerified(false);
          setShowOtpField(false);
          setOtpExpiration(null);
          setTimeLeft(null);
          navigate("/otp");
        } else {
          setErrors({ general: response.message || "Signup failed" });
          setTimeout(() => {
            setErrors((prev) => ({ ...prev, general: "" }));
          }, 5000);
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred during signup";
      console.error("Signup Error Response:", err.response?.data);
      if (
        errorMessage.includes("User with this username already exists") ||
        errorMessage.includes("User with this email already exists")
      ) {
        setErrors({
          email:
            "This email is already registered. Please use a different email or sign in.",
        });
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, email: "" }));
        }, 5000);
      } else if (
        errorMessage.includes("User with this mobile number already exists") ||
        (errorMessage.includes("duplicate key error") &&
          errorMessage.includes("mobile"))
      ) {
        setErrors({
          mobile:
            "This mobile number is already registered. Please use a different mobile number or sign in.",
        });
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, mobile: "" }));
        }, 5000);
      } else {
        setErrors({
          general:
            "This mobile number is already registered. Please use a different mobile number or sign in.",
        });
        setTimeout(() => {
          setErrors((prev) => ({ ...prev, general: "" }));
        }, 5000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = {
    student: [
      {
        name: "name",
        placeholder: "Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "mobile",
        type: "text",
        maxLength: 10,
        placeholder: "Mobile Number",
        required: true,
      },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
        isEmail: true,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
    ],
    company: [
      {
        name: "name",
        placeholder: "Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "companyName",
        placeholder: "Company Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "mobile",
        type: "text",
        maxLength: 10,
        placeholder: "Mobile Number",
        required: true,
      },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
        isEmail: true,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
    ],
    academy: [
      {
        name: "name",
        placeholder: "Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "academyName",
        placeholder: "Academy Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "mobile",
        type: "text",
        maxLength: 10,
        placeholder: "Mobile Number",
        required: true,
      },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
        isEmail: true,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
    ],
    recruiter: [
      {
        name: "name",
        placeholder: "Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "mobile",
        type: "text",
        maxLength: 10,
        placeholder: "Mobile Number",
        required: true,
      },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
        isEmail: true,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
    ],
    mentor: [
      {
        name: "name",
        placeholder: "Name",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        name: "mobile",
        type: "text",
        maxLength: 10,
        placeholder: "Mobile Number",
        required: true,
      },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
        isEmail: true,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20,
      },
    ],
  };

  return (
    <div className="flex h-screen">
      <div className="w-full lg:w-1/2 flex flex-col px-4 py-4 xs:px-6 sm:px-8">
        <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full flex flex-col flex-grow">
          <div className="mb-3 flex flex-col items-center">
            <div className="flex items-center mb-3">
              <img
                src={logo}
                alt="Internship-OJT Logo"
                className="h-20 w-auto mr-2"
              />
            </div>
            <div className="flex justify-center gap-2 xs:gap-3 sm:gap-4 mb-3">
              {["student", "company", "academy", "mentor", "recruiter"].map(
                (r) => (
                  <div
                    key={r}
                    className={`flex flex-col items-center cursor-pointer p-1.5 ${
                      role === r ? "border-b-2 border-[#3D7EFF]" : ""
                    }`}
                    onClick={() => handleRoleChange(r)}
                  >
                    <div className="p-1.5 rounded-lg border shadow-sm">
                      <img
                        src={
                          r === "student"
                            ? student
                            : r === "company"
                            ? company
                            : r === "academy"
                            ? academy
                            : r === "recruiter"
                            ? recruiter
                            : r === "mentor"
                            ? mentor
                            : "https://img.icons8.com/ios-filled/50/000000/user-male.png"
                        }
                        alt={r}
                        className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7"
                      />
                    </div>
                    <span className="text-xs xs:text-sm font-medium capitalize">
                      {r}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
          {role ? (
            <div className="w-full flex flex-col">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">
                Sign up
              </h2>
              <p className="text-xs xs:text-sm text-gray-500 mb-2">
                Sign up to enjoy the feature of Revolutie
              </p>
              {errors.general && (
                <p
                  className={`text-xs xs:text-sm mb-2 ${
                    errors.general.includes("verified successfully")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                  aria-live="polite"
                >
                  {errors.general}
                </p>
              )}
              <form
                className="space-y-2"
                onSubmit={handleSubmit}
                aria-busy={isLoading}
              >
                {formFields[role].map((field) => (
                  <div key={field.name} className="relative flex flex-col">
                    {field.name === "mobile" ? (
                      <div className="flex gap-2 items-center">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="border border-gray-300 rounded-md px-3 py-2 text-xs xs:text-sm focus:ring-2 focus:ring-[#3D7EFF]"
                          disabled={isLoading || isEmailVerified}
                        >
                          <option value="+63">+63</option>
                        </select>
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                            errors[field.name] ? "border-red-500" : ""
                          }`}
                          value={formData[field.name]}
                          onChange={handleChange}
                          maxLength={field.maxLength}
                          required={field.required}
                          disabled={isLoading || isEmailVerified}
                          aria-describedby={
                            errors[field.name]
                              ? `error-${field.name}`
                              : undefined
                          }
                        />
                      </div>
                    ) : field.isEmail ? (
                      <>
                        <div className="relative flex items-center">
                          <input
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                              errors[field.name] ? "border-red-500" : ""
                            }`}
                            value={formData[field.name]}
                            onChange={handleChange}
                            required={field.required}
                            maxLength={field.maxLength}
                            disabled={isLoading || isEmailVerified || (role === "company" && showOtpField)}
                            aria-describedby={errors[field.name] ? `error-${field.name}` : undefined}
                          />
                          {isEmailVerified ? (
                            <MdCheckCircle
                              className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-green-500 text-base xs:text-lg"
                            />
                          ) : role === "company" && (timeLeft === null || timeLeft === 0) ? (
                            <button
                              type="button"
                              onClick={handleVerifyEmail}
                              className={`absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-xs xs:text-sm text-[#3D7EFF] font-semibold hover:underline ${
                                isVerifying || isLoading ? "opacity-75 cursor-not-allowed" : ""
                              }`}
                              disabled={isVerifying || isLoading}
                            >
                              {isVerifying ? "Verifying..." : "Verify"}
                            </button>
                          ) : null}
                        </div>
                        {showOtpField && role === "company" && (
                          <div className="flex flex-col mt-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                name="otp"
                                placeholder="Enter OTP"
                                className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                                  errors.otp ? "border-red-500" : ""
                                }`}
                                value={formData.otp}
                                onChange={handleChange}
                                maxLength={4}
                                disabled={isLoading || timeLeft === 0}
                                aria-describedby={errors.otp ? "error-otp" : undefined}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className={`px-3 py-2 xs:px-4 xs:py-2.5 bg-[#3D7EFF] text-white rounded-md text-xs xs:text-sm font-semibold hover:bg-[#2b66cc] transition-colors ${
                                  isLoading || timeLeft === 0 ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                                disabled={isLoading || timeLeft === 0}
                              >
                                Verify OTP
                              </button>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              {timeLeft !== null && timeLeft > 0 && (
                                <p className="text-xs xs:text-sm text-gray-500">
                                  Time left: {Math.floor(timeLeft / 60)}:
                                  {(timeLeft % 60).toString().padStart(2, "0")}
                                </p>
                              )}
                              {timeLeft === 0 && (
                                <button
                                  type="button"
                                  onClick={handleResendOtp}
                                  className={`text-xs xs:text-sm text-[#3D7EFF] font-semibold hover:underline ${
                                    isVerifying || isLoading ? "opacity-75 cursor-not-allowed" : ""
                                  }`}
                                  disabled={isVerifying || isLoading}
                                >
                                  {isVerifying ? "Resending..." : "Resend OTP"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="relative flex items-center">
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                            errors[field.name] ? "border-red-500" : ""
                          }`}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required={field.required}
                          maxLength={field.maxLength}
                          disabled={isLoading}
                          aria-describedby={
                            errors[field.name]
                              ? `error-${field.name}`
                              : undefined
                          }
                        />
                        {(field.name === "password" ||
                          field.name === "confirmPassword") &&
                          (showPassword ? (
                            <MdVisibility
                              className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                              onClick={togglePasswordVisibility}
                            />
                          ) : (
                            <MdVisibilityOff
                              className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                              onClick={togglePasswordVisibility}
                            />
                          ))}
                      </div>
                    )}
                    {errors[field.name] && (
                      <p
                        id={`error-${field.name}`}
                        className="text-red-500 text-xs xs:text-sm mt-1"
                      >
                        {errors[field.name]}
                      </p>
                    )}
                    {field.isEmail && errors.otp && (
                      <p
                        id="error-otp"
                        className="text-red-500 text-xs xs:text-sm mt-1"
                      >
                        {errors.otp}
                      </p>
                    )}
                  </div>
                ))}
                <div className="flex flex-col space-y-2">
                  <p className="text-xs xs:text-sm text-gray-700">
                    By registering on INTURN PH, I certify that I have read and
                    understood the{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-[#3D7EFF] font-semibold hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    {showFullPolicy ? (
                      <>
                        . I give my free, informed, and explicit consent to
                        INTURN PH to collect, process, and use my personal data
                        for the purposes of internship and employment matching,
                        as well as academic coordination and certification. I
                        understand that I may withdraw my consent at any time.
                        <button
                          type="button"
                          onClick={togglePolicyVisibility}
                          className="text-[#3D7EFF] font-semibold hover:underline ml-1 text-xs xs:text-sm"
                        >
                          Less
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={togglePolicyVisibility}
                        className="text-[#3D7EFF] font-semibold hover:underline ml-1 text-xs xs:text-sm"
                      >
                        More
                      </button>
                    )}
                  </p>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={handleConsentChange}
                      className="h-4 w-4 text-[#3D7EFF] border-gray-300 rounded focus:ring-[#3D7EFF]"
                      disabled={isLoading}
                    />
                    <span className="text-xs xs:text-sm text-gray-700">
                      I agree to the INTURN PH Privacy Policy and give my
                      consent for data processing under RA 10173.
                    </span>
                  </label>
                  {errors.consent && (
                    <p
                      id="error-consent"
                      className="text-red-500 text-xs xs:text-sm"
                    >
                      {errors.consent}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors flex items-center justify-center ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? <>Signing up...</> : "Sign up"}
                </button>
                {role === "company" && (
                  <p className="text-sm xs:text-sm text-center mt-2.5">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#3D7EFF] font-semibold hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                )}
              </form>
              {role !== "company" && (
                <p className="text-sm xs:text-sm text-center mt-2.5">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#3D7EFF] font-semibold hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">
                Select a Role
              </h2>
              <p className="text-xs xs:text-sm text-gray-500 mb-2">
                Please choose a role to sign up for Revolutie.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 p-2 relative">
        <div
          className="w-full h-full bg-contain bg-center rounded-3xl opacity-50"
          style={{
            backgroundImage: `linear-gradient(to right, #F9DCDF, #B5D9D3), url(${
              roleImages[role] || wallpaper1
            })`,
            backgroundBlendMode: "multiply",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {role && (
          <div className="absolute inset-0 flex items-center justify-between p-20">
            <ul className="text-[#050748] text-lg font-semibold list-disc pl-6">
              {roleDescriptions[role].map((description, index) => (
                <li key={index} className="mb-2">
                  {description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import rightImage from "../assets/SignUp/wallpaper.jpg";
import logo from "../assets/Navbar/logo.png";
import student from "../assets/SignUp/student.png";
import linkedin from "../assets/SignUp/linkedin.png";
import facebook from "../assets/SignUp/facebook.png";
import company from "../assets/SignUp/company.png";
import academy from "../assets/SignUp/academy.png";
import recruiter from "../assets/SignUp/recruiter.png";
import mentor from "../assets/SignUp/mentor.png";
import { signup, signupCompany } from "../Utils/api";

const SignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    academyName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const validRoles = ["student", "company", "academy", "recruiter", "mentor"];
    if (validRoles.includes(path)) {
      setRole(path);
    } else if (location.pathname === "/signup") {
      setRole(null);
    } else {
      navigate("/signup", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    navigate(`/signup/${newRole}`);
    setFormData({
      name: "",
      companyName: "",
      academyName: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate fields
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
    if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must be 8–20 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., !@#$%^&*).";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!validateMobile(formData.mobile)) {
      newErrors.mobile = "Mobile number must contain only digits or be empty.";
    } else if (formData.mobile.trim().length > 10) {
      newErrors.mobile = "Mobile number must be 10 digits or less.";
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

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      let payload;
      let response;

      if (role === "company") {
        payload = {
          appName: "app8657281202648",
          companyName: formData.companyName.trim(),
          mobile: formData.mobile.trim() ? `+63${formData.mobile.trim()}` : "",
          legalname: formData.name.trim(),
          role: roleIds[role],
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        };
        console.log("Company Signup Payload:", payload);
        response = await signupCompany(payload);
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
          mobile: formData.mobile.trim() ? `+63${formData.mobile.trim()}` : "",
          ...(role === "academy" && {
            academyname: formData.academyName.trim(),
          }),
        };
        console.log("Signup Payload:", payload);
        response = await signup(payload);
      }

      if (response.success) {
        if (role === "company") {
          setFormData({
            name: "",
            companyName: "",
            academyName: "",
            mobile: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setErrors({});
          const companyId = response.user?.companyId || "";
          localStorage.setItem(
            "user",
            JSON.stringify({
              legalname: formData.name.trim(),
              email: formData.email.toLowerCase().trim(),
              role: roleNames[roleIds[role]],
              roleId: roleIds[role],
              companyId: companyId,
            })
          );
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          const from = location.state?.from || "/";
          navigate(from, { replace: true });
        } else {
          localStorage.setItem(
            "pendingUser",
            JSON.stringify({
              legalname: formData.name.trim(),
              email: formData.email.toLowerCase().trim(),
              role: roleNames[roleIds[role]],
              roleId: roleIds[role],
              ...(role === "academy" && {
                academyname: formData.academyName.trim(),
              }),
              redirectTo: location.state?.from || "/editprofile",
            })
          );
          navigate("/otp");
        }
      } else {
        setErrors({ general: response.message || "Signup failed" });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
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
      } else {
        setErrors({
          general: `${errorMessage}. Please try again or contact support@conscor.com.`,
        });
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
      { name: "mobile", type: "text", maxLength: 10 },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
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
      { name: "mobile", type: "text", maxLength: 10 },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
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
      { name: "mobile", type: "text", maxLength: 10 },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
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
      { name: "mobile", type: "text", maxLength: 10 },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
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
      { name: "mobile", type: "text", maxLength: 10 },
      {
        name: "email",
        placeholder: "Email",
        type: "email",
        required: true,
        maxLength: 100,
      },
      {
        name: "password",
        placeholder: "Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
      },
      {
        name: "confirmPassword",
        placeholder: "Confirm Password",
        type: showPassword ? "text" : "password",
        required: true,
        maxLength: 20, // Changed from 8 to 20
      },
    ],
  };

  return (
    <div className="flex h-screen">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-2 xs:px-6 sm:px-8">
        <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full">
          <div className="mb-3 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              <img
                src={logo}
                alt="Logo"
                className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12"
              />
              <div>
                <h1 className="text-base xs:text-lg sm:text-xl font-bold text-[#050748] tracking-wide">
                  INTERNSHIP–OJT
                </h1>
                <div className="w-full h-[2px] bg-[#050748] mt-0.5 mb-0.5" />
                <p className="text-xs xs:text-sm sm:text-base text-black font-bold text-center">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 mb-3">
            {["student", "company", "academy", "recruiter", "mentor"].map(
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
          {role && (
            <div className="w-full">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">
                Sign up
              </h2>
              <p className="text-xs xs:text-sm text-gray-500 mb-2">
                Sign up to enjoy the feature of Revolutie
              </p>
              {errors.general && (
                <p
                  className="text-red-500 text-xs xs:text-sm mb-2"
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
                    <div className="relative flex items-center">
                      {field.name === "mobile" && (
                        <span className="absolute left-3 text-gray-500 text-xs xs:text-sm sm:text-base">
                          +63
                        </span>
                      )}
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                          field.name === "mobile" ? "pl-12" : ""
                        } ${errors[field.name] ? "border-red-500" : ""}`}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        maxLength={field.maxLength}
                        aria-describedby={
                          errors[field.name] ? `error-${field.name}` : undefined
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
                    {errors[field.name] && (
                      <p
                        id={`error-${field.name}`}
                        className="text-red-500 text-xs xs:text-sm mt-1"
                      >
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors flex items-center justify-center ${
                    isLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                    
                      Signing up...
                    </>
                  ) : (
                    "Sign up"
                  )}
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
                <>
                  <p className="text-sm xs:text-sm text-center mt-2.5">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#3D7EFF] font-semibold hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 p-2">
        <div
          className="w-full h-full bg-cover bg-center rounded-3xl"
          style={{ backgroundImage: `url(${rightImage})` }}
        ></div>
      </div>
    </div>
  );
};

export default SignUpPage;

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addGeneralData, fetchSectionData, mUpdate, sendEmailTemplate } from "../../Utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCrosshairs } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import Select from "react-select";

const PostInternshipForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    time: "Remote",
    salary: "",
    description: "",
    subtype: "",
    experiencelevel: "",
    applicationdeadline: "",
    internshipduration: "",
    skillsrequired: [],
    applicationinstructions: "",
    keyResponsibilities: "",
    professionalSkills: "",
    degree: [],
    company: "",
    logo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const degreeOptions = [
    "B.Tech",
    "B.Sc",
    "B.Com",
    "BBA",
    "MBA",
    "M.Tech",
    "M.Sc",
    "Ph.D",
  ];
  const experienceLevelOptions = [
    "No-experience",
    "Fresher",
    "Intermediate",
    "Expert",
  ];
  const internshipTypeOptions = [
    "Remote",
    "Onsite",
    "Hybrid",
    "Part-time",
    "Full-time",
  ];

  // Validation regex
  const salaryRegex = /^\d*$/;
  const durationRegex = /^\d*$/;

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Function to replace placeholders in email templates
  const replacePlaceholders = (body, data) => {
    let updatedBody = body;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`\\{data.${key}\\}`, 'g');
      updatedBody = updatedBody.replace(regex, data[key] || '');
    });
    return updatedBody;
  };

  // Fetch company data, skills, categories
  useEffect(() => {
    const fetchCompanyAndSkills = async () => {
      try {
        setCategoryLoading(true);
        setSkillsLoading(true);

        // Fetch company data
        const companyResponse = await fetchSectionData({
          collectionName: "company",
          query: { _id: user.companyId },
          projection: {
            "sectionData.Company.organizationName": 1,
            "sectionData.Company.logoImage": 1,
            "sectionData.Company.username": 1,
          },
          limit: 1,
        });

        if (companyResponse.length > 0) {
          setFormData((prev) => ({
            ...prev,
            company: companyResponse[0].sectionData.Company.organizationName,
            logo:
              companyResponse[0].sectionData.Company.logoImage ||
              "https://placehold.co/40x40",
          }));
        } else {
          toast.error("Failed to fetch company data.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }

        // Fetch categories
        const categoryResponse = await fetchSectionData({
          collectionName: "category",
          query: {},
          projection: {
            _id: 1,
            "sectionData.category.titleofinternship": 1,
          },
          limit: 0,
          skip: 0,
          order: 1,
          sortedBy: "sectionData.category.titleofinternship",
        });

        if (Array.isArray(categoryResponse) && categoryResponse.length > 0) {
          setCategoryData(
            categoryResponse
              .map((item) => ({
                _id: item._id,
                titleofinternship: item.sectionData.category.titleofinternship,
              }))
              .sort((a, b) =>
                a.titleofinternship.localeCompare(b.titleofinternship)
              )
          );
        } else {
          toast.error("No categories found.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }

        // Fetch skills
        const skillsResponse = await fetchSectionData({
          collectionName: "skills",
          query: { "sectionData.skills.showinsuggestions": true },
          projection: { "sectionData.skills.name": 1, _id: 1 },
          limit: 100,
          skip: 0,
          order: 1,
          sortedBy: "sectionData.skills.name",
        });

        if (Array.isArray(skillsResponse) && skillsResponse.length > 0) {
          setSkillsData(
            skillsResponse.map((item) => ({
              value: item._id,
              label: item.sectionData.skills.name,
            }))
          );
        } else {
          toast.error("No skills found.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to fetch data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } finally {
        setCategoryLoading(false);
        setSkillsLoading(false);
      }
    };

    if (user.companyId) {
      fetchCompanyAndSkills();
    }
  }, [user.companyId]);

  // Google Maps Autocomplete
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places) {
          console.error("Google Maps places library not loaded");
          return;
        }
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
            fields: ["formatted_address", "name"],
            componentRestrictions: { country: "ph" },
          }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          const newLocation = place.formatted_address || place.name || "";
          setFormData((prevFormData) => ({
            ...prevFormData,
            location: newLocation,
          }));
        });
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        toast.error(
          "Google Maps API failed to load. Location suggestions unavailable.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          }
        );
        setTimeout(() => setError(""), 3000);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    if (user.role !== "company" || !user.companyId) {
      navigate("/login");
    }
  }, [user.role, user.companyId, navigate]);

  const handleChange = (e) => {
    // Handle standard HTML inputs
    if (e.target) {
      const { name, value } = e.target;
      if (name === "salary" && !salaryRegex.test(value)) {
        return;
      }
      if (name === "internshipduration" && !durationRegex.test(value)) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (value, name) => {
    // Handle MDEditor inputs
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleDegreeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let updatedDegrees = [...prev.degree];
      if (checked) {
        updatedDegrees.push(value);
      } else {
        updatedDegrees = updatedDegrees.filter((deg) => deg !== value);
      }
      return { ...prev, degree: updatedDegrees };
    });
  };

  const handleSkillsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      skillsrequired: selectedOptions || [],
    }));
  };

  const validateSalary = (salary) => {
    if (!salary || salary.trim() === "") return "Not specified";
    return salaryRegex.test(salary) ? `${salary} PHP` : "Not specified";
  };

  const validateLocation = (location) => {
    if (!location || location.trim() === "") return null;
    return location;
  };

  const validateDuration = (duration) => {
    if (!duration || duration.trim() === "") return null;
    return durationRegex.test(duration)
      ? `${duration} month${duration === "1" ? "" : "s"}`
      : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!user.companyId) {
      toast.error("Company ID is missing. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      navigate("/login");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Internship title is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.company) {
      toast.error("Company name could not be fetched.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!validateLocation(formData.location)) {
      toast.error("Valid location is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.subtype) {
      toast.error("Category is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!categoryData.some((category) => category._id === formData.subtype)) {
      toast.error("Invalid category selected.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.experiencelevel) {
      toast.error("Experience level is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!experienceLevelOptions.includes(formData.experiencelevel)) {
      toast.error("Invalid experience level selected.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.applicationdeadline) {
      toast.error("Application deadline is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!validateDuration(formData.internshipduration)) {
      toast.error("Valid internship duration is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.keyResponsibilities.trim()) {
      toast.error("Key responsibilities are required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.professionalSkills.trim()) {
      toast.error("Professional skills are required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (formData.degree.length === 0) {
      toast.error("At least one degree is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }

    try {
      // Prepare job post data
      const jobPostData = {
        dbName: "internph",
        collectionName: "jobpost",
        data: {
          sectionData: {
            jobpost: {
              title: formData.title.trim(),
              company: formData.company,
              type: "Internship",
              time: formData.time,
              location: validateLocation(formData.location),
              salary: validateSalary(formData.salary),
              subtype: formData.subtype,
              experiencelevel: formData.experiencelevel,
              applicationdeadline: formData.applicationdeadline,
              internshipduration: validateDuration(formData.internshipduration),
              skillsrequired: formData.skillsrequired.map((skill) => skill.value),
              applicationinstructions: formData.applicationinstructions.trim(),
              description: formData.description.trim(),
              keyResponsibilities: formData.keyResponsibilities.trim(),
              professionalSkills: formData.professionalSkills.trim(),
              degree: formData.degree,
              logo: formData.logo,
            },
          },
          createdBy: user.companyId,
          companyId: user.companyId,
          createdDate: new Date().toLocaleString(),
          createdAt: new Date().toISOString(),
        },
      };

      // Post the internship
      const response = await addGeneralData(jobPostData);

      if (response.success) {
        // Update category's numberofinternships
        try {
          await mUpdate({
            appName: "app8657281202648",
            collectionName: "category",
            query: { _id: formData.subtype },
            update: { $inc: { "sectionData.category.numberofinternships": 1 } },
            options: { upsert: false },
          });
        } catch (updateError) {
         
        }

        // Fetch matching student applications
        const studentApplications = await fetchSectionData({
          collectionName: "application",
          query: {
            "sectionData.application.industry": formData.subtype,
            $or: [
              { "sectionData.application.desiredinternshiptitle": { $regex: formData.title, $options: "i" } },
              { "sectionData.application.skills": { $in: formData.skillsrequired.map(skill => skill.value) } },
              { "sectionData.application.preferredlocation": { $regex: formData.location, $options: "i" } },
              { "sectionData.application.internshiptype": formData.time },
            ],
          },
          projection: { sectionData: 1, createdBy: 1 },
        });

        if (studentApplications.length > 0) {
          // Fetch company email template
          const templateResponse = await fetchSectionData({
            collectionName: "template",
            query: { _id: "1755673004561" }, // companyrequirement template
            projection: { sectionData: 1 },
          });

          let companyEmailTemplate = {
            subject: "Potential Student Matches",
            body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Potential Student Matches</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
        }
        .container {
            max-width: 700px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #007bff, #00c4b4);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
        }
        .content {
            padding: 25px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .content h2 {
            font-size: 20px;
            color: #007bff;
            margin: 20px 0 10px;
            font-weight: 600;
        }
        .card {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            border: 1px solid #e0e0e0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        table td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        table td:first-child {
            font-weight: 600;
            width: 30%;
            color: #333333;
            background-color: #f1f1f1;
        }
        .student-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            background-color: #f9f9f9;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            margin: 15px 0;
            text-align: center;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
        @media screen and (max-width: 600px) {
            .container {
                width: 100%;
                margin: 0;
                border-radius: 0;
            }
            .header h1 {
                font-size: 22px;
            }
            table td {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
            table td:first-child {
                width: 100%;
                background-color: #e8e8e8;
                border-bottom: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Potential Student Matches</h1>
            <p>Students Matching Your {data.Internship Title} Requirements</p>
        </div>
        <div class="content">
            <p>Hello {data.Company Contact},</p>
            <p>We found {data.MatchCount} students whose preferences match your internship posting for <strong>{data.Internship Title}</strong>.</p>
            
            <div class="card">
                <h2>Your Internship Details</h2>
                <table>
                    <tr><td>Position Title</td><td>{data.Internship Title}</td></tr>
                    <tr><td>Location</td><td>{data.Location}</td></tr>
                    <tr><td>Internship Type</td><td>{data.Type}</td></tr>
                    <tr><td>Duration</td><td>{data.Duration}</td></tr>
                    <tr><td>Required Skills</td><td>{data.Skills}</td></tr>
                </table>
            </div>
            
            <h2>Matching Students</h2>
            {data.Students}
            
            <p>You can review these student profiles on your {data.Your Portal Name} dashboard.</p>
            <p>For support, contact us at <a href="mailto:{data.support_email}">{data.support_email}</a>.</p>
            <p>Best regards,<br>The {data.Your Portal Name} Team</p>
            <a href="{data.your_portal_url}/dashboard" class="cta-button">View Student Profiles</a>
        </div>
        <div class="footer">
            <p>Follow us on {data.Social Media Links}</p>
            <p>© {data.Year} {data.Your Portal Name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
          };

          if (templateResponse.length > 0) {
            companyEmailTemplate = {
              subject: templateResponse[0].sectionData.template.subject || companyEmailTemplate.subject,
              body: templateResponse[0].sectionData.template.body || companyEmailTemplate.body,
            };
          }

          // Fetch company email
          const companyDataResponse = await fetchSectionData({
            collectionName: "company",
            query: { _id: user.companyId },
            projection: { "sectionData.Company.username": 1, "sectionData.Company.organizationName": 1 },
          });

          const companyEmail = companyDataResponse[0]?.sectionData?.Company?.username || "support@internsph.com";
          const companyContact = companyDataResponse[0]?.sectionData?.Company?.organizationName || "Team";

          // Fetch student details and prepare student list
          const studentList = [];
          const sentStudentEmails = new Set(); // Track sent student emails to prevent duplicates
          for (const app of studentApplications) {
            const studentId = app.createdBy;
            if (sentStudentEmails.has(studentId)) continue; // Skip if already processed

            const studentDataResponse = await fetchSectionData({
              collectionName: "appuser",
              query: { _id: studentId },
              projection: {
                "sectionData.appuser.legalname": 1,
                "sectionData.appuser.email": 1,
                "sectionData.appuser.mobile": 1,
                "sectionData.appuser.resume": 1,
                "sectionData.appuser.usertype": 1,
              },
            });

            if (studentDataResponse.length > 0) {
              const student = studentDataResponse[0].sectionData.appuser;
              studentList.push({
                name: student.legalname || "Unknown",
                email: student.email || "N/A",
                mobile: student.mobile || "N/A",
                resume: student.resume || "N/A",
                usertype: student.usertype || "N/A",
              });
              sentStudentEmails.add(studentId); // Mark student as processed
            }
          }

          // Generate student HTML for company email
          const studentHtml = studentList.map(student => `
            <div class="student-card">
                <table>
                    <tr><td>Name</td><td>${student.name}</td></tr>
                    <tr><td>Email</td><td>${student.email}</td></tr>
                    <tr><td>Mobile</td><td>${student.mobile}</td></tr>
                    <tr><td>User Type</td><td>${student.usertype}</td></tr>
                    <tr><td>Resume</td><td><a href="${student.resume}" target="_blank">View Resume</a></td></tr>
                </table>
            </div>
          `).join('');

          // Prepare company email data
          const companyEmailData = {
            "Internship Title": formData.title,
            Location: formData.location,
            Type: formData.time,
            Duration: validateDuration(formData.internshipduration),
            Skills: formData.skillsrequired.map(skill => skill.label).join(", "),
            MatchCount: studentList.length,
            Students: studentHtml,
            "Company Contact": companyContact,
            "Your Portal Name": "InternPH",
            support_email: "support@internsph.com",
            "Social Media Links": "LinkedIn | Twitter | Facebook",
            Year: new Date().getFullYear(),
            your_portal_url: "https://internsph.com",
          };

          // Send single email to company
          await sendEmailTemplate({
            email: companyEmail,
            smtpId: "1750933648545",
            templateId: "1755673004561",
            data: companyEmailData,
            category: "primary",
          });

          toast.success("Email sent to company with matching students!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });

          // Fetch student email template
          const studentTemplateResponse = await fetchSectionData({
            collectionName: "template",
            query: { _id: "1755673066029" }, // studentrequirement template
            projection: { sectionData: 1 },
          });

          let studentEmailTemplate = {
            subject: "Potential Internship Opportunities",
            body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Potential Internship Opportunities</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333333;
        }
        .container {
            max-width: 700px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #007bff, #00c4b4);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 700;
        }
        .content {
            padding: 25px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .content h2 {
            font-size: 20px;
            color: #007bff;
            margin: 20px 0 10px;
            font-weight: 600;
        }
        .card {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            border: 1px solid #e0e0e0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        table td {
            padding: 10px;
            border-bottom: 1px solid #e0e0e0;
        }
        table td:first-child {
            font-weight: 600;
            width: 30%;
            color: #333333;
            background-color: #f1f1f1;
        }
        .internship-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            background-color: #f9f9f9;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            margin: 15px 0;
            text-align: center;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
        @media screen and (max-width: 600px) {
            .container {
                width: 100%;
                margin: 0;
                border-radius: 0;
            }
            .header h1 {
                font-size: 22px;
            }
            table td {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
            table td:first-child {
                width: 100%;
                background-color: #e8e8e8;
                border-bottom: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Potential Internship Opportunities</h1>
            <p>Companies Matching Your {data.Preference Title} Preferences</p>
        </div>
        <div class="content">
            <p>Hello {data.Name},</p>
            <p>We found {data.MatchCount} internship opportunities that match your preferences for <strong>{data.Preference Title}</strong> positions.</p>
            
            <div class="card">
                <h2>Your Preference Details</h2>
                <table>
                    <tr><td>Desired Role</td><td>{data.Preference Title}</td></tr>
                    <tr><td>Preferred Location</td><td>{data.Location}</td></tr>
                    <tr><td>Internship Type</td><td>{data.Type}</td></tr>
                    <tr><td>Duration</td><td>{data.Duration}</td></tr>
                    <tr><td>Your Skills</td><td>{data.Skills}</td></tr>
                </table>
            </div>
            
            <h2>Matching Internships</h2>
            {data.Internships}
            
            <p>You can apply to these opportunities on your {data.Your Portal Name} dashboard.</p>
            <p>For support, contact us at <a href="mailto:{data.support_email}">{data.support_email}</a>.</p>
            <p>Best of luck,<br>The {data.Your Portal Name} Team</p>
            <a href="{data.your_portal_url}/internships" class="cta-button">View All Internships</a>
        </div>
        <div class="footer">
            <p>Follow us on {data.Social Media Links}</p>
            <p>© {data.Year} {data.Your Portal Name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
          };

          if (studentTemplateResponse.length > 0) {
            studentEmailTemplate = {
              subject: studentTemplateResponse[0].sectionData.template.subject || studentEmailTemplate.subject,
              body: studentTemplateResponse[0].sectionData.template.body || studentEmailTemplate.body,
            };
          }

          // Send emails to students
          for (const app of studentApplications) {
            const studentId = app.createdBy;
            if (sentStudentEmails.has(studentId)) continue; // Skip if already sent

            const studentDataResponse = await fetchSectionData({
              collectionName: "appuser",
              query: { _id: studentId },
              projection: {
                "sectionData.appuser.legalname": 1,
                "sectionData.appuser.email": 1,
                "sectionData.appuser.skills": 1,
              },
            });

            if (studentDataResponse.length > 0) {
              const student = studentDataResponse[0].sectionData.appuser;
              const studentApp = app.sectionData.application;

              // Fetch skill names
              const skillNamesResponse = await fetchSectionData({
                collectionName: "skills",
                query: { _id: { $in: studentApp.skills } },
                projection: { "sectionData.skills.name": 1 },
              });

              const skillNames = skillNamesResponse.map(skill => skill.sectionData.skills.name).join(", ");

              // Internship HTML for student email
              const internshipHtml = `
                <div class="internship-card">
                    <table>
                        <tr><td>Company</td><td>${formData.company}</td></tr>
                        <tr><td>Internship Title</td><td>${formData.title}</td></tr>
                        <tr><td>Location</td><td>${formData.location}</td></tr>
                        <tr><td>Internship Type</td><td>${formData.time}</td></tr>
                        <tr><td>Duration</td><td>${validateDuration(formData.internshipduration)}</td></tr>
                        <tr><td>Skills Required</td><td>${formData.skillsrequired.map(skill => skill.label).join(", ")}</td></tr>
                    </table>
                </div>
              `;

              // Prepare student email data
              const studentEmailData = {
                Name: student.legalname || "Student",
                "Preference Title": studentApp.desiredinternshiptitle,
                Location: studentApp.preferredlocation,
                Type: studentApp.internshiptype,
                Duration: studentApp.availabilityduration,
                Skills: skillNames,
                MatchCount: 1,
                Internships: internshipHtml,
                "Your Portal Name": "InternPH",
                support_email: "support@internsph.com",
                "Social Media Links": "LinkedIn | Twitter | Facebook",
                Year: new Date().getFullYear(),
                your_portal_url: "https://internsph.com",
              };

              // Send email to student
              await sendEmailTemplate({
                email: student.email,
                smtpId: "1750933648545",
                templateId: "1755673066029",
                data: studentEmailData,
                category: "primary",
              });

              sentStudentEmails.add(studentId); // Mark student as emailed
            }
          }

          if (sentStudentEmails.size > 0) {
            toast.success("Emails sent to matching students!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            });
          }
        }

        toast.success("Internship posted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          onClose: () => navigate("/internship"),
        });
      } else {
        toast.error(response.message || "Failed to post internship.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (err) {
      toast.error(
        err.message || "Failed to post internship. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }
      );
      console.error("Post Internship Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== "company" || !user.companyId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          Post Internship Form
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineering Intern"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  ref={locationInputRef}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Manila, Philippines"
                  required
                />
                <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Type <span className="text-red-500">*</span>
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select Internship Type
                </option>
                {internshipTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  PHP
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="subtype"
                value={formData.subtype}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={categoryLoading || categoryData.length === 0}
              >
                <option value="" disabled>
                  {categoryLoading
                    ? "Loading categories..."
                    : categoryData.length === 0
                    ? "No categories available"
                    : "Select Category"}
                </option>
                {categoryData.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.titleofinternship.charAt(0).toUpperCase() +
                      category.titleofinternship.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experiencelevel"
                value={formData.experiencelevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select Experience Level
                </option>
                {experienceLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level.replace("-", " ").charAt(0).toUpperCase() +
                      level.replace("-", " ").slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="applicationdeadline"
                value={formData.applicationdeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Duration (Months) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="internshipduration"
                  value={formData.internshipduration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  / months
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Skills Required <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                name="skillsrequired"
                options={skillsData}
                value={formData.skillsrequired}
                onChange={handleSkillsChange}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Search and select skills..."
                isLoading={skillsLoading}
                isDisabled={skillsLoading || skillsData.length === 0}
                isSearchable={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Degrees <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {degreeOptions.map((degree) => (
                  <label key={degree} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="degree"
                      value={degree}
                      checked={formData.degree.includes(degree)}
                      onChange={handleDegreeChange}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{degree}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Responsibilities <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={formData.keyResponsibilities}
              onChange={(value) =>
                handleEditorChange(value, "keyResponsibilities")
              }
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Professional Skills <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={formData.professionalSkills}
              onChange={(value) =>
                handleEditorChange(value, "professionalSkills")
              }
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={formData.description}
              onChange={(value) => handleEditorChange(value, "description")}
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Instructions (Optional)
            </label>
            <MDEditor
              value={formData.applicationinstructions}
              onChange={(value) =>
                handleEditorChange(value, "applicationinstructions")
              }
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={
                loading ||
                categoryLoading ||
                skillsLoading ||
                categoryData.length === 0 ||
                skillsData.length === 0
              }
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Internship"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/post-internship")}
              className="flex-1 border border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostInternshipForm;
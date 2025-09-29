import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchSectionData,
  mUpdate,
  sendEmailTemplate,
  sendRawEmail,
  addGeneralData,
  uploadAndStoreFile,
} from "../../Utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { gapi } from "gapi-script";
import { loadGapiInsideDOM } from "gapi-script";
import SignatureCanvas from "react-signature-canvas";
import "../../Components/signature.css";
import logo from "../../assets/Navbar/logo.png";
import backgroundImg from "../../assets/Hero/banner.jpg";

// Bind modal to app element for accessibility
Modal.setAppElement("#root");

const InternshipCandidates = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseMap, setCourseMap] = useState({});
  const [companyData, setCompanyData] = useState({});
  const [companyRepData, setCompanyRepData] = useState({});
  const [academyRepDataMap, setAcademyRepDataMap] = useState({});
  const [filters, setFilters] = useState({ status: "All" });
  const [pendingStatuses, setPendingStatuses] = useState({});
  const [jobPostData, setJobPostData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCandidateId, setModalCandidateId] = useState(null);
  const [modalData, setModalData] = useState({
    date: "",
    time: "",
    googleMeetLink: "",
  });
  
  // Added for Selected status modal
  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState(false);
  const [startDateModalData, setStartDateModalData] = useState({
    startDate: "",
    endDate: "",
    totalHours: 0
  });
  
  const [isMOAModalOpen, setIsMOAModalOpen] = useState(false);
  const [moaCandidateId, setMoaCandidateId] = useState(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signCandidateId, setSignCandidateId] = useState(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [googleApiLoading, setGoogleApiLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const initAttempted = useRef(false);
  const moaPrintRef = useRef(null);
  const sigCanvas = useRef(null);

  // Google API Credentials
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
  const SCOPES = "https://www.googleapis.com/auth/calendar";

  // Helper function to calculate end date based on start date and internship duration
  const calculateEndDate = (startDate, durationStr) => {
    if (!startDate || !durationStr) return "";
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return "";
    
    // Parse the duration string (e.g., "6 months", "4 weeks", "30 days")
    const durationMatch = durationStr.match(/(\d+)\s+(month|months|week|weeks|day|days)/i);
    if (!durationMatch) return "";
    
    const amount = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    
    const end = new Date(start);
    
    if (unit.includes("month")) {
      end.setMonth(end.getMonth() + amount);
    } else if (unit.includes("week")) {
      end.setDate(end.getDate() + (amount * 7));
    } else if (unit.includes("day")) {
      end.setDate(end.getDate() + amount);
    }
    
    return end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Helper function to calculate total work hours (8 hours per day, excluding Sundays)
  const calculateTotalHours = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    let totalDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      if (current.getDay() !== 0) { // Skip Sundays (0 is Sunday in JavaScript)
        totalDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return totalDays * 8; // 8 hours per working day
  };

  useEffect(() => {
    if (!CLIENT_ID || !API_KEY) {
      setError("Google API credentials are missing. Please contact support.");
      toast.error("Google API credentials are missing.", { autoClose: 5000 });
    }
  }, [CLIENT_ID, API_KEY]);

  if (user.role !== "company") {
    navigate("/");
    return null;
  }

  // Initialize Google API and GIS
  useEffect(() => {
    const initGoogleApi = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;
      setGoogleApiLoading(true);

      try {
        await loadGapiInsideDOM();
        await new Promise((resolve, reject) => {
          gapi.load("client:auth2", {
            callback: resolve,
            onerror: () => reject(new Error("Failed to load gapi client")),
          });
        });

        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });

        setGapiInited(true);

        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Google Identity Services script"));
          document.body.appendChild(script);
        });

        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          ux_mode: "popup",
          callback: (resp) => {
            if (resp.error) {
              toast.error(`Google authentication failed: ${resp.error}`, {
                position: "top-right",
                autoClose: 5000,
              });
            } else {
              gapi.client.setToken(resp);
              setGisLoaded(true);
            }
          },
        });

        setTokenClient(client);
        setGisLoaded(true);
      } catch (err) {
        console.error("GAPI initialization error:", err);
        toast.error(`Failed to initialize Google API: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
        setError(
          "Google API initialization failed. Please try refreshing the page."
        );
      } finally {
        setGoogleApiLoading(false);
      }
    };

    if (CLIENT_ID && API_KEY) {
      initGoogleApi();
    } else {
      setError("Google API credentials are missing. Please contact support.");
      toast.error("Google API credentials are missing.", { autoClose: 5000 });
      setGoogleApiLoading(false);
    }
  }, [CLIENT_ID, API_KEY]);

  // Function to fetch academy representative data by organisation college ID with post lookup
  const fetchAcademyRepData = async (organisationCollegeId) => {
    try {
     
      
      if (!organisationCollegeId || organisationCollegeId === "Unknown") {
        console.warn("Invalid organisation college ID provided:", organisationCollegeId);
        return {
          legalname: "School Representative",
          postName: "Position"
        };
      }

      // First, let's try to find all users for this organisation college
      const allUsersResponse = await fetchSectionData({
        dbName: "internph",
        collectionName: "appuser",
        query: { 
          "sectionData.appuser.organisationcollege": organisationCollegeId
        },
        projection: { sectionData: 1 },
      });


      if (allUsersResponse.length === 0) {
        console.warn("No users found for organisation college:", organisationCollegeId);
        return {
          legalname: "School Representative",
          postName: "Position"
        };
      }

      // Filter for academy users
      const academyUsers = allUsersResponse.filter(user => {
        const appuser = user.sectionData?.appuser;
        return appuser && (
          appuser.role === "academy" || 
          appuser.module === "academy" ||
          appuser.role === "1747903042943" // This might be the academy role ID
        );
      });


      if (academyUsers.length === 0) {
        console.warn("No academy users found for organisation college:", organisationCollegeId);
        return {
          legalname: "School Representative", 
          postName: "Position"
        };
      }

      // Take the first academy user
      const academyUser = academyUsers[0];
      const repData = academyUser.sectionData?.appuser || {};
      
  

      // Now fetch the post data separately
      if (repData.post) {
        
        const postResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "post",
          query: { _id: repData.post },
          projection: { sectionData: 1 },
        });


        if (postResponse.length > 0) {
          const postData = postResponse[0];
          const postName = postData.sectionData?.post?.name;
          
          
          return {
            legalname: repData.legalname || repData.name || "School Representative",
            postName: postName || "Position"
          };
        } else {
          console.warn("No post found with ID:", repData.post);
        }
      } else {
        console.warn("No post ID found in academy user data");
      }

      // Fallback if post lookup fails
      return {
        legalname: repData.legalname || repData.name || "School Representative",
        postName: "Position"
      };

    } catch (error) {
      console.error("Error in fetchAcademyRepData:", error);
      return {
        legalname: "School Representative",
        postName: "Position"
      };
    }
  };

  // Fetch candidate, course, job post, and company data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "course",
          query: {},
          projection: { sectionData: 1, _id: 1 },
        });
        const courses = courseResponse.map((item) => ({
          id: item._id,
          name: item.sectionData.course.name,
        }));
        const map = courses.reduce(
          (acc, course) => ({ ...acc, [course.id]: course.name }),
          {}
        );
        setCourseMap(map);

        // Fetch job post data
        const jobPostResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "jobpost",
          query: { _id: id },
          projection: { sectionData: 1, createdBy: 1 },
        });

        if (jobPostResponse.length === 0) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        setJobPostData(jobPostResponse[0].sectionData.jobpost || {});
        const createdBy = jobPostResponse[0].createdBy;
        const applicants =
          jobPostResponse[0].sectionData.jobpost.applicants || [];
        const userIds = applicants.map((app) => app.text).filter(Boolean);

        if (userIds.length === 0) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Fetch company data
        const companyResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "company",
          query: { _id: createdBy },
          projection: { sectionData: 1 },
        });

        if (companyResponse.length > 0) {
          setCompanyData(companyResponse[0].sectionData.Company || {});
         
        } else {
          setError("Company data not found.");
          toast.error("Company data not found.", { autoClose: 3000 });
          console.error("No company data found for createdBy:", createdBy);
        }

        // Fetch company representative data from appuser collection
        const companyRepResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { 
            companyId: createdBy,
            "sectionData.appuser.module": "company"
          },
          projection: { sectionData: 1 },
        });

        if (companyRepResponse.length > 0) {
          const repData = companyRepResponse[0].sectionData.appuser || {};
          
          // Also fetch designation from Company collection
          const companyDesignationResponse = await fetchSectionData({
            dbName: "internph",
            collectionName: "Company",
            query: { createdBy: createdBy },
            projection: { "sectionData.Company.designation": 1 },
          });
          
          let designation = repData.cdesignation || "Representative";
          if (companyDesignationResponse.length > 0) {
            designation = companyDesignationResponse[0]?.sectionData?.Company?.designation || designation;
          }
          
          setCompanyRepData({
            ...repData,
            cdesignation: designation
          });
        } else {
          console.warn("No company representative data found for companyId:", createdBy);
          setCompanyRepData({
            legalname: user.legalname || "Company Representative",
            cdesignation: "Representative"
          });
        }

        // Fetch appuser data with institute lookup
        const usersResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: { $in: userIds } },
          projection: { sectionData: 1, instituteData: 1 },
          lookups: [
            {
              $lookup: {
                from: "institute",
                localField: "sectionData.appuser.organisationcollege",
                foreignField: "_id",
                as: "instituteData",
              },
            },
          ],
        });

        const userMap = usersResponse.reduce((map, user) => {
          const appuserData = user.sectionData.appuser || {};
          const institute = user.instituteData?.[0] || {};

          if (!user.instituteData || user.instituteData.length === 0) {
            console.warn(
              `No institute data found for user ${user._id}, organisationcollege: ${appuserData.organisationcollege}`
            );
          }

          map[user._id] = {
            ...appuserData,
            schoolName: institute.sectionData?.institute?.institutionname || "Unknown Institution",
            schoolAddress:
              `${institute.sectionData?.institute?.municipalitycity || ""}, ${
                institute.sectionData?.institute?.province || ""
              }`.trim() || "Unknown Address",
            organisationcollege: appuserData.organisationcollege || "Unknown",
          };

          return map;
        }, {});


        const formattedCandidates = applicants.map((app) => {
          const candidateData = {
            text: app.text,
            name: app.name || userMap[app.text]?.legalname || "Unknown",
            email: app.email || userMap[app.text]?.email || "N/A",
            mobile: userMap[app.text]?.mobile || "N/A",
            course:
              map[userMap[app.text]?.course] ||
              userMap[app.text]?.course ||
              "N/A",
            specialization: userMap[app.text]?.coursespecialization || "N/A",
            resume: userMap[app.text]?.resume || "",
            status: app.status || "Applied",
            schoolName: userMap[app.text]?.schoolName || "Unknown Institution",
            schoolAddress:
              userMap[app.text]?.schoolAddress || "Unknown Address",
            organisationcollege:
              userMap[app.text]?.organisationcollege || "Unknown", // Add organisationcollege
            startdate: app.startdate || "",
            enddate: app.enddate || "",
            totalHours: app.totalHours || 0,
            companySigned: app.companySigned || false,
            academySigned: app.academySigned || false,
            companySignature: app.companySignature || "",
            academySignature: app.academySignature || "",
            companySignedDate: app.companySignedDate || "",
            academySignedDate: app.academySignedDate || "",
          };
          return candidateData;
        });
        
        setCandidates(formattedCandidates);

        // Pre-fetch academy representative data for all unique organisation colleges
        const uniqueOrgColleges = [...new Set(formattedCandidates.map(c => c.organisationcollege))].filter(id => id && id !== "Unknown");
        
        
        const academyDataMap = {};
        for (const orgCollegeId of uniqueOrgColleges) {
          const academyData = await fetchAcademyRepData(orgCollegeId);
          academyDataMap[orgCollegeId] = academyData;
        }
        
       
        setAcademyRepDataMap(academyDataMap);
        
        // Check for fully signed MOAs that don't have documents yet
        await checkAndCreateExistingCompanyMOAs(formattedCandidates);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
        toast.error(`Failed to load data: ${err.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const checkAndCreateExistingCompanyMOAs = async (candidates) => {
    try {
      const fullySignedCandidates = candidates.filter(candidate => 
        candidate.companySigned && candidate.academySigned
      );
      
      for (const candidate of fullySignedCandidates) {
        // Check if MOA document already exists
        const existingMOA = await fetchSectionData({
          dbName: "internph",
          collectionName: "moa",
          query: {
            "sectionData.contactus.studentname": candidate.name,
            "sectionData.contactus.companyname": companyData.organizationName
          }
        });

        if (existingMOA.length === 0) {
          // Create MOA document for existing signed agreement
          await createCompanyMOADocument(candidate, candidate.companySignature, candidate.companySignedDate);
        }
      }
    } catch (err) {
      console.error("Error checking existing company MOAs:", err);
    }
  };

  const replacePlaceholders = (body, data) => {
    let updatedBody = body;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`\\{data.${key}\\}`, "g");
      updatedBody = updatedBody.replace(regex, data[key] || "");
    });
    return updatedBody;
  };

  const sendShortlistEmail = async (candidate, dynamicData) => {
    const emailData = {
      CandidateName: candidate.name || "Unknown",
      InternshipTitle: jobPostData.title || "Internship",
      CompanyName: companyData.organizationName || "Unknown Company",
      Date: dynamicData.date || "Not specified",
      Time: dynamicData.time || "Not specified",
      GoogleMeetLink: dynamicData.googleMeetLink || "Not specified",
      support_email: "support@inturnsph.com",
      your_portal_url: "https://inturnshp.com/ph/",
      Year: new Date().getFullYear().toString(),
      "Your Portal Name": "Inturnshp",
      "Social Media Links":
        '<a href="https://twitter.com/inturnsph">Twitter</a> | <a href="https://linkedin.com/company/inturnsph">LinkedIn</a> | <a href="https://facebook.com/inturnsph">Facebook</a>',
    };

    const fallbackTemplate = {
      subject:
        "Congratulations! You've Been Shortlisted for {data.InternshipTitle}",
      body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Congratulations! You've Been Shortlisted</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #333333; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #007bff, #00c4b4); color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
        .header p { margin: 5px 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 25px; }
        .content p { font-size: 16px; line-height: 1.6; margin: 10px 0; }
        .content h2 { font-size: 20px; color: #007bff; margin: 20px 0 10px; font-weight: 600; }
        .card { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 15px 0; border: 1px solid #e0e0e0; }
        table { width: 100%; border-collapse: collapse; font-size: 15px; }
        table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
        table td:first-child { font-weight: 600; width: 35%; color: #333333; background-color: #f1f1f1; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 25px; font-size: 16px; font-weight: 600; margin: 15px 0; text-align: center; }
        .cta-button:hover { background-color: #0056b3; }
        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666666; }
        .footer a { color: #007bff; text-decoration: none; }
        @media screen and (max-width: 600px) {
            .container { width: 100%; margin: 0; border-radius: 0; }
            .header h1 { font-size: 22px; }
            .header p { font-size: 14px; }
            .content { padding: 15px; }
            .content h2 { font-size: 18px; }
            table td { display: block; width: 100%; box-sizing: border-box; text-align: left; }
            table td:first-child { width: 100%; background-color: #e8e8e8; border-bottom: none; }
            .cta-button { display: block; width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Congratulations! You've Been Shortlisted</h1>
            <p>For the {data.InternshipTitle} at {data.CompanyName}</p>
        </div>
        <div class="content">
            <p>Hello {data.CandidateName},</p>
            <p>We're excited to inform you that you've been shortlisted for the <strong>{data.InternshipTitle}</strong> position at <strong>{data.CompanyName}</strong>.</p>
            <div class="card">
                <h2>Interview Details</h2>
                <table>
                    <tr>
                        <td><strong>Date</strong></td>
                        <td>{data.Date}</td>
                    </tr>
                    <tr>
                        <td><strong>Time</strong></td>
                        <td>{data.Time}</td>
                    </tr>
                    <tr>
                        <td><strong>Google Meet Link</strong></td>
                        <td><a href="{data.GoogleMeetLink}">{data.GoogleMeetLink}</a></td>
                    </tr>
                </table>
            </div>
            <p>Please join the meeting at the scheduled time. If you have any questions, contact us at <a href="mailto:{data.support_email}">{data.support_email}</a>.</p>
            <p>Best regards,<br>The {data.CompanyName} Team</p>
            <a href="{data.your_portal_url}/dashboard" class="cta-button">View Your Dashboard</a>
        </div>
        <div class="footer">
            <p>Follow us on {data.Social Media Links}</p>
            <p>© {data.Year} {data.Your Portal Name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    };

    try {
      const emailResponse = await sendEmailTemplate(
        {
          appName: "app8657281202648",
          email: candidate.email,
          templateId: "1757496454652",
          smtpId: "1750933648545",
          data: emailData,
          category: "primary",
          subject: `Congratulations! You've Been Shortlisted for ${emailData.InternshipTitle}`,
        },
        toast
      );
      toast.success("Shortlist email sent.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (emailError) {
      console.error("Failed to send shortlist email:", emailError);
      const emailBody = replacePlaceholders(fallbackTemplate.body, emailData);
      try {
        const fallbackResponse = await sendRawEmail(
          {
            appName: "app8657281202648",
            smtpId: "1750933648545",
            to: candidate.email,
            subject: fallbackTemplate.subject.replace(
              "{data.InternshipTitle}",
              emailData.InternshipTitle
            ),
            html: emailBody,
          },
          toast
        );
        toast.success("Shortlist email sent via fallback.", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (fallbackError) {
        console.error("Failed to send fallback email:", fallbackError);
        toast.error(`Failed to send email: ${fallbackError.message}`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  const updateStatus = async (userId, newStatus, dynamicData = {}) => {
    const candidate = candidates.find((c) => c.text === userId);
    try {
      // Construct the update object
      const updateObject = {
        "sectionData.jobpost.applicants.$[elem].status": newStatus,
        "sectionData.jobpost.applicants.$[elem].name": candidate.name,
      };
      
      // Add interview details if provided
      if (dynamicData.date) {
        updateObject["sectionData.jobpost.applicants.$[elem].interviewDate"] = dynamicData.date;
      }
      if (dynamicData.time) {
        updateObject["sectionData.jobpost.applicants.$[elem].interviewTime"] = dynamicData.time;
      }
      if (dynamicData.googleMeetLink) {
        updateObject["sectionData.jobpost.applicants.$[elem].googleMeetLink"] = dynamicData.googleMeetLink;
      }
      
      // Add internship dates if provided
      if (dynamicData.startDate) {
        updateObject["sectionData.jobpost.applicants.$[elem].startdate"] = dynamicData.startDate;
      }
      if (dynamicData.endDate) {
        updateObject["sectionData.jobpost.applicants.$[elem].enddate"] = dynamicData.endDate;
      }
      if (dynamicData.totalHours) {
        updateObject["sectionData.jobpost.applicants.$[elem].totalHours"] = dynamicData.totalHours;
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "jobpost",
        query: { _id: id },
        update: {
          $set: updateObject,
        },
        options: {
          arrayFilters: [{ "elem.text": userId }],
          upsert: false,
        },
      });

      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.text === userId
            ? { 
                ...candidate, 
                status: newStatus,
                startdate: dynamicData.startDate || candidate.startdate,
                enddate: dynamicData.endDate || candidate.enddate,
                totalHours: dynamicData.totalHours || candidate.totalHours,
                ...dynamicData 
              }
            : candidate
        )
      );

      if (newStatus === "Shortlisted") {
        await sendShortlistEmail(candidate, dynamicData);
      }

      toast.success(`Status updated to ${newStatus}!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(`Failed to update status: ${err.message}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleUpdate = (userId) => {
    const candidate = candidates.find((c) => c.text === userId);
    const newStatus = pendingStatuses[userId] || candidate.status;

    if (newStatus === "Shortlisted") {
      setModalCandidateId(userId);
      setModalData({ date: "", time: "", googleMeetLink: "" });
      setIsModalOpen(true);
    } else if (newStatus === "Selected") {
      // For "Selected" status, open the start date modal first
      setModalCandidateId(userId);
      
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      
      // Calculate end date based on internship duration from job post
      const endDate = calculateEndDate(formattedToday, jobPostData.internshipduration);
      
      // Calculate total hours
      const totalHours = calculateTotalHours(formattedToday, endDate);
      
      setStartDateModalData({
        startDate: formattedToday,
        endDate: endDate,
        totalHours: totalHours
      });
      
      setIsStartDateModalOpen(true);
    } else {
      updateStatus(userId, newStatus);
    }

    setPendingStatuses((prev) => {
      const newPending = { ...prev };
      delete newPending[userId];
      return newPending;
    });
  };

  // Handle start date change in the start date modal
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    
    // Calculate new end date based on internship duration
    const newEndDate = calculateEndDate(newStartDate, jobPostData.internshipduration);
    
    // Calculate new total hours
    const newTotalHours = calculateTotalHours(newStartDate, newEndDate);
    
    setStartDateModalData({
      startDate: newStartDate,
      endDate: newEndDate,
      totalHours: newTotalHours
    });
  };

  // Handle start date modal submit
  const handleStartDateModalSubmit = async () => {
    if (!startDateModalData.startDate) {
      toast.error("Please select a start date.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    await updateStatus(modalCandidateId, "Selected", startDateModalData);
    setIsStartDateModalOpen(false);
    
    // Open MOA modal after updating status
    setMoaCandidateId(modalCandidateId);
    setIsMOAModalOpen(true);
  };

  const generateMeetLink = async (candidate) => {
    if (!modalData.date || !modalData.time) {
      toast.error("Please enter date and time first.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!gapiInited || !tokenClient || !gisLoaded || googleApiLoading) {
      toast.error(
        "Google API is still initializing. Please wait a moment and retry.",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    try {
      if (!gapi.client.getToken()) {
        await new Promise((resolve, reject) => {
          tokenClient.callback = (resp) => {
            if (resp.error) {
              reject(new Error(`Authorization failed: ${resp.error}`));
            } else {
              gapi.client.setToken(resp);
              resolve();
            }
          };
          tokenClient.requestAccessToken({ ux_mode: "popup" });
        });
      }

      const startDateTime = new Date(
        `${modalData.date}T${modalData.time}:00`
      ).toISOString();
      const endDateTime = new Date(
        new Date(startDateTime).getTime() + 60 * 60 * 1000
      ).toISOString();

      const event = {
        summary: `Interview for ${jobPostData.title || "Internship"} with ${
          candidate.name
        }`,
        description: "Shortlist interview for internship position.",
        start: {
          dateTime: startDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: [{ email: candidate.email }, { email: user.email }],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

      const request = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        sendUpdates: "all",
        resource: event,
      });

      const meetLink = request.result.conferenceData.entryPoints?.find(
        (entry) => entry.entryPointType === "video"
      )?.uri;

      if (!meetLink) throw new Error("No Meet link returned");

      setModalData((prev) => ({ ...prev, googleMeetLink: meetLink }));
      toast.success("Google Meet link generated!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error generating Meet link:", err);
      toast.error(`Failed to generate Meet link: ${err.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleModalSubmit = async () => {
    if (!modalData.date || !modalData.time) {
      toast.error("Date and time are required.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const candidate = candidates.find((c) => c.text === modalCandidateId);
    if (!modalData.googleMeetLink) {
      await generateMeetLink(candidate);
      return;
    }

    await updateStatus(modalCandidateId, "Shortlisted", modalData);
    setIsModalOpen(false);
    setModalData({ date: "", time: "", googleMeetLink: "" });
  };

  const handleViewMOA = async (userId) => {
    setMoaCandidateId(userId);
    setIsMOAModalOpen(true);
  };

  const handleSignMOA = (userId) => {
    setSignCandidateId(userId);
    setIsSignModalOpen(true);
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const saveCompanySignature = async () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Please provide a signature", { autoClose: 3000 });
      return;
    }

    try {
      const signatureDataURL = sigCanvas.current.toDataURL();
      const currentDate = new Date().toISOString();
      const candidate = candidates.find(c => c.text === signCandidateId);

      // Update the job post with company signature
      await mUpdate({
        appName: "app8657281202648",
        collectionName: "jobpost",
        query: { _id: id },
        update: {
          $set: {
            "sectionData.jobpost.applicants.$[elem].companySigned": true,
            "sectionData.jobpost.applicants.$[elem].companySignature": signatureDataURL,
            "sectionData.jobpost.applicants.$[elem].companySignedDate": currentDate,
          },
        },
        options: {
          arrayFilters: [{ "elem.text": signCandidateId }],
          upsert: false,
        },
      });

      // If academy already signed, create MOA document
      if (candidate?.academySigned) {
        await createCompanyMOADocument(candidate, signatureDataURL, currentDate);
      }

      // Update local state
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.text === signCandidateId 
            ? { 
                ...candidate, 
                companySigned: true, 
                companySignature: signatureDataURL,
                companySignedDate: currentDate
              }
            : candidate
        )
      );

      toast.success("MOA signed successfully!", { autoClose: 3000 });
      setIsSignModalOpen(false);
      setSignCandidateId(null);
    } catch (err) {
      console.error("Error signing MOA:", err);
      toast.error("Failed to sign MOA", { autoClose: 3000 });
    }
  };

  const createCompanyMOADocument = async (candidate, companySignature, companySignedDate) => {
    try {
      // Check if MOA already exists
      const existingMOA = await fetchSectionData({
        dbName: "internph",
        collectionName: "moa",
        query: {
          "sectionData.contactus.studentname": candidate.name,
          "sectionData.contactus.companyname": companyData.organizationName
        }
      });

      if (existingMOA.length > 0) {
        toast.info("MOA document already exists", { autoClose: 3000 });
        return;
      }

      const finalSignedDate = new Date().toLocaleDateString("en-GB");
      const fileUrl = `MOA_${candidate.name}_${companyData.organizationName}_${finalSignedDate}.pdf`;

      const moaData = {
        studentname: candidate.name,
        companyname: companyData.organizationName || "Company",
        academyname: candidate.schoolName,
        internshipTitle: jobPostData.title,
        startDate: candidate.startdate,
        endDate: candidate.enddate,
        totalHours: candidate.totalHours,
        companySignature: companySignature,
        academySignature: candidate.academySignature,
        companySignedDate: companySignedDate,
        academySignedDate: candidate.academySignedDate,
        fullySignedDate: finalSignedDate,
        file: fileUrl
      };

      // Create MOA record using addGeneralData
      await addGeneralData({
        dbName: "internph",
        collectionName: "moa",
        data: {
          sectionData: {
            contactus: moaData
          },
          createdBy: user.id || user._id,
          companyId: user.companyId || "",
          createdDate: new Date().toLocaleDateString("en-GB") + ", " + new Date().toLocaleTimeString("en-GB")
        }
      });

      toast.success("MOA document created successfully!", { autoClose: 3000 });
    } catch (err) {
      console.error("Error creating MOA document:", err);
      toast.error("Failed to create MOA document", { autoClose: 3000 });
    }
  };



  // Function to print MOA document
  const handlePrintMOA = () => {
    const printContent = moaPrintRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Memorandum of Agreement</title>
        <style>
          @media print {
            @page {
              size: A4;
              margin: 15mm 10mm;
            }
            
            body {
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
              background: #fff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .page-break {
              page-break-before: always;
            }
            
            h1 {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 20px;
              text-align: center;
            }
            
            h3 {
              font-size: 14pt;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            
            .signatures {
              margin-top: 30px;
            }
            
            .signature-line {
              border-bottom: 1px solid #000;
              width: 100%;
              height: 25px;
              margin-bottom: 5px;
            }
            
            p, li {
              margin-bottom: 10px;
              text-align: justify;
            }
            
            .info-box {
              padding: 10px;
              border: 1px solid #ccc;
              margin: 15px 0;
              background-color: #f9f9f9;
            }
          }
          
          /* Styles for the print preview */
          body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
            background: #fff;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
          }
          
          h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
          }
          
          h3 {
            font-size: 14pt;
            margin-top: 20px;
            margin-bottom: 10px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          
          .info-box {
            padding: 10px;
            border: 1px solid #ccc;
            margin: 15px 0;
            background-color: #f9f9f9;
          }
          
          .signatures {
            margin-top: 30px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          
          .signature-line {
            border-bottom: 1px solid #000;
            width: 100%;
            height: 25px;
            margin-bottom: 5px;
          }
          
          .witnesses {
            margin-top: 40px;
          }
          
          ol, ul {
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 8px;
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const MOAModalContent = ({ candidate }) => {
    // Get academy representative data from the pre-fetched map
    const academyData = academyRepDataMap[candidate.organisationcollege] || {
      legalname: "School Representative",
      postName: "Position"
    };

    // Calculate total hours if needed
    let displayTotalHours = candidate.totalHours;
    if (!displayTotalHours && candidate.startdate && candidate.enddate) {
      displayTotalHours = calculateTotalHours(candidate.startdate, candidate.enddate);
    }

    const moaData = {
      companyName: companyData.organizationName || "Unknown Company",
      companyAddress: companyData.organizationcity || "Unknown Address",
      companyRep: companyRepData.legalname || user.legalname || "Company Representative",
      companyRepPosition: companyRepData.cdesignation ? companyRepData.cdesignation.replace(/&amp;quot;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, '&') : "Representative",
      schoolName: candidate.schoolName || "Unknown",
      schoolAddress: candidate.schoolAddress || "Unknown Address",
      schoolRep: academyData.legalname || "School Representative",
      schoolRepPosition: academyData.postName || "Position",
      startDate: candidate.startdate || "Start Date",
      endDate: candidate.enddate || "End Date",
      internshipHours: displayTotalHours ? `${displayTotalHours} hours` : "300/600 hours",
      signingDate: new Date().toLocaleDateString(),
      signingPlace: "Place of Signing",
    };


    return (
      <div style={{}}>
        {/* MOA Content - Printable Section */}
        <div ref={moaPrintRef} style={{ backgroundColor: '#ffffff', padding: '2rem', maxWidth: '64rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
              MEMORANDUM OF AGREEMENT
            </h1>
            <div style={{ marginTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Between</h2>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{moaData.companyName}</p>
                </div>
                <p style={{ fontSize: '1.125rem', margin: '0 0.75rem' }}>and</p>
                <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', fontSize: '1.125rem' }}>{moaData.schoolName}</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                I. PARTIES
              </h3>
              <p style={{ marginBottom: '1rem', textAlign: 'justify' }}>This Memorandum of Agreement (MOA) is entered into by and between:</p>
              
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem', border: '1px solid #bfdbfe' }}>
                <p style={{ textAlign: 'justify' }}><strong>{moaData.companyName}</strong>, a duly registered company with office address at {moaData.companyAddress}, represented herein by <strong>{moaData.companyRep}</strong>, {moaData.companyRepPosition}, hereinafter referred to as the "Company"</p>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '0.75rem', marginBottom: '0.75rem' }}>- and -</div>
              
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem', border: '1px solid #bbf7d0' }}>
                <p style={{ textAlign: 'justify' }}><strong>{moaData.schoolName}</strong>, an educational institution with address at {moaData.schoolAddress}, represented herein by <strong>{moaData.schoolRep}</strong>, {moaData.schoolRepPosition}, hereinafter referred to as the "School"</p>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                II. PURPOSE
              </h3>
              <p style={{ textAlign: 'justify' }}>This Agreement is executed to formalize the partnership between the Company and the School for the purpose of providing student internship opportunities under the School's academic and/or voluntary internship program.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                III. SCOPE OF INTERNSHIP
              </h3>
              <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'justify' }}>
                <li>The internship program shall provide students with practical learning experiences aligned with their academic courses or career interests.</li>
                <li>
                  The internship may be:
                  <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', marginTop: '0.75rem', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li><span style={{ fontWeight: '500' }}>Required Internship:</span> to be completed upon attaining the prescribed <span style={{ fontWeight: '500' }}>{moaData.internshipHours}</span> as mandated by the School's curriculum.</li>
                    <li><span style={{ fontWeight: '500' }}>Voluntary Internship:</span> to be undertaken by students who wish to gain additional experience beyond the required hours.</li>
                  </ul>
                </li>
                <li>The Company shall assign students to appropriate tasks, projects, or training activities consistent with their field of study.</li>
              </ol>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                IV. DURATION
              </h3>
              <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                <p style={{ textAlign: 'justify' }}>The internship period shall cover <strong>{moaData.startDate}</strong> to <strong>{moaData.endDate}</strong>, or until the completion of the required number of internship hours, whichever comes first, unless earlier terminated in accordance with this Agreement.</p>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                V. RESPONSIBILITIES OF THE PARTIES
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem' }}>A. The School shall:</h4>
                <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'justify' }}>
                  <li>Endorse qualified students for internship placement.</li>
                  <li>Provide the Company with internship requirements, guidelines, and monitoring forms.</li>
                  <li>Assign a Faculty/Practicum Coordinator to monitor and evaluate the students' progress.</li>
                </ol>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem', backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.25rem' }}>B. The Company shall:</h4>
                <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'justify' }}>
                  <li>Accept endorsed students for internship and provide meaningful tasks aligned with their academic background.</li>
                  <li>Designate a Supervisor/Mentor to guide and evaluate the students' performance.</li>
                  <li>Provide a safe working environment and comply with applicable labor, occupational safety, and data privacy laws.</li>
                  <li>Issue a Certificate of Completion upon successful completion of the internship program.</li>
                </ol>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                VI. NON-COMPENSATION CLAUSE
              </h3>
              <ol style={{ listStyleType: 'decimal', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'justify' }}>
                <li>The internship shall be non-compensated unless otherwise agreed by the parties in writing.</li>
                <li>Should the Company decide to provide allowance, stipend, or benefits, such shall not be construed as establishing an employer-employee relationship.</li>
              </ol>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                VII. CONFIDENTIALITY
              </h3>
              <div style={{ padding: '1rem', backgroundColor: '#fefce8', borderRadius: '0.375rem', border: '1px solid #fef08a' }}>
                <p style={{ textAlign: 'justify' }}>Interns shall observe confidentiality of all records, data, and information obtained during the internship and shall not disclose the same without the written consent of the Company.</p>
              </div>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                VIII. TERMINATION
              </h3>
              <p style={{ marginBottom: '0.75rem', textAlign: 'justify' }}>This Agreement may be terminated by either party upon written notice under the following conditions:</p>
              <ul style={{ listStyleType: 'disc', marginLeft: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Violation of Company or School rules and regulations.</li>
                <li style={{ marginBottom: '0.5rem' }}>Misconduct or breach of confidentiality by the intern.</li>
                <li>Mutual agreement of both parties.</li>
              </ul>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                IX. EFFECTIVITY
              </h3>
              <p style={{ textAlign: 'justify' }}>This MOA shall take effect on the date of signing and shall remain valid until completion of the agreed internship program.</p>
            </section>

            <section>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #d1d5db' }}>
                X. SIGNATURES
              </h3>
              <p style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>IN WITNESS WHEREOF, the parties hereto have signed this Memorandum of Agreement on this {moaData.signingDate} at {moaData.signingPlace}.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2rem' }}>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{moaData.companyName}</p>
                  <p style={{ marginBottom: '0.5rem' }}>By:</p>
                  {(() => {
                    const candidate = candidates.find(c => c.text === moaCandidateId);
                    return candidate?.companySignature ? (
                      <div style={{ marginBottom: '0.3125rem' }}>
                        <img src={candidate.companySignature} alt="Company Signature" style={{ maxHeight: '50px', border: '1px solid #ccc' }} />
                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Digitally signed on {new Date(candidate.companySignedDate).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div style={{ borderBottom: '1px solid #000000', width: '100%', height: '1.5625rem', marginBottom: '0.3125rem' }}></div>
                    );
                  })()}
                  <p style={{ marginTop: '0.25rem' }}>{moaData.companyRep}, {moaData.companyRepPosition}</p>
                </div>
                
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{moaData.schoolName}</p>
                  <p style={{ marginBottom: '0.5rem' }}>By:</p>
                  {(() => {
                    const candidate = candidates.find(c => c.text === moaCandidateId);
                    return candidate?.academySignature ? (
                      <div style={{ marginBottom: '0.3125rem' }}>
                        <img src={candidate.academySignature} alt="Academy Signature" style={{ maxHeight: '50px', border: '1px solid #ccc' }} />
                        <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>Digitally signed on {new Date(candidate.academySignedDate).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div style={{ borderBottom: '1px solid #000000', width: '100%', height: '1.5625rem', marginBottom: '0.3125rem' }}></div>
                    );
                  })()}
                  <p style={{ marginTop: '0.25rem' }}>{moaData.schoolRep}, {moaData.schoolRepPosition}</p>
                </div>
              </div>
              
              <div style={{ marginTop: '3rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '1rem' }}>Witnesses:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <div style={{ borderBottom: '1px solid #000000', width: '100%', height: '1.5625rem', marginBottom: '1rem' }}>1.</div>
                                        <div style={{ borderBottom: '1px solid #000000', width: '100%', height: '1.5625rem', marginBottom: '0.3125rem' }}>2.</div>

                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </section>
          </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'rem', }}>

          <button
            onClick={handlePrintMOA}
            style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.375rem 1rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center', transition: 'background-color 0.3s', fontSize: '0.875rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '1.25rem', width: '1.25rem', marginRight: '0.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
            </svg>
            Print MOA
          </button>
          </div>
        </div>
        
      </div>
    );
  };

  const filteredCandidates = candidates.filter((candidate) =>
    filters.status === "All" ? true : candidate.status === filters.status
  );

  if (error) return <div className="mx-12 py-4 text-red-600">{error}</div>;
  if (loading) return <div className="mx-12 py-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <ToastContainer />
      <div
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${backgroundImg})`,
        }}
      >
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Internship Candidates
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            Manage candidates who applied for this internship.
          </p>
          <button
            onClick={() => navigate("/manage-internships")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Back to Internships
          </button>
        </div>
      </div>

      <div className="px-4 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6">
            Applied Candidates
          </h2>
          <div className="mb-6">
            <label className="text-sm font-medium mr-2">
              Filter by Status:
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="p-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          {filteredCandidates.length === 0 ? (
            <p className="text-center text-gray-600">
              No candidates match the selected filter.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.text}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-[#050748]">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{" "}
                        {candidate.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Mobile:</span>{" "}
                        {candidate.mobile}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Course:</span>{" "}
                        {candidate.course}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Specialization:</span>{" "}
                        {candidate.specialization}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">School:</span>{" "}
                        {candidate.schoolName}
                      </p>
                      {candidate.status === "Selected" && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">MOA Status:</span>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              candidate.companySigned ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}>
                              Company: {candidate.companySigned ? "Signed" : "Pending"}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              candidate.academySigned ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                            }`}>
                              Academy: {candidate.academySigned ? "Signed" : "Pending"}
                            </span>
                          </div>
                        </div>
                      )}
                      {candidate.resume && (
                        <a
                          href={candidate.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          View Resume
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        value={
                          pendingStatuses[candidate.text] || candidate.status
                        }
                        onChange={(e) =>
                          setPendingStatuses({
                            ...pendingStatuses,
                            [candidate.text]: e.target.value,
                          })
                        }
                        className="p-2 border rounded-md"
                      >
                        <option
                          value="Applied"
                          disabled={candidate.status !== "Applied"}
                        >
                          Applied
                        </option>
                        <option
                          value="Shortlisted"
                          disabled={
                            candidate.status === "Rejected" ||
                            candidate.status === "Selected"
                          }
                        >
                          Shortlisted
                        </option>
                        <option
                          value="Selected"
                          disabled={
                            candidate.status === "Rejected" ||
                            candidate.status !== "Shortlisted"
                          }
                        >
                          Selected
                        </option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleUpdate(candidate.text)}
                        className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-600 transition-all"
                      >
                        Update
                      </button>
                      {candidate.status === "Selected" && (
                        <>
                          <button
                            onClick={() => handleViewMOA(candidate.text)}
                            className="bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 transition-all"
                          >
                            View MOA
                          </button>
                          {!candidate.companySigned && (
                            <button
                              onClick={() => handleSignMOA(candidate.text)}
                              className="bg-blue-500 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-600 transition-all"
                            >
                              Sign MOA
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interview Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Enter Interview Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interview Date
            </label>
            <input
              type="date"
              value={modalData.date}
              onChange={(e) =>
                setModalData({ ...modalData, date: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Interview Time
            </label>
            <input
              type="time"
              value={modalData.time}
              onChange={(e) =>
                setModalData({ ...modalData, time: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
           <label className="block text-sm font-medium text-gray-700">
              Interview Time
            </label>
            <input
              type="time"
              value={modalData.time}
              onChange={(e) =>
                setModalData({ ...modalData, time: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Google Meet Link
            </label>
            <input
              type="url"
              value={modalData.googleMeetLink}
              onChange={(e) =>
                setModalData({ ...modalData, googleMeetLink: e.target.value })
              }
              className="w-full p-2 border rounded-md"
              placeholder="Click Generate Meet Link or enter manually"
            />
          </div>
          <button
            onClick={() => {
              const candidate = candidates.find(
                (c) => c.text === modalCandidateId
              );
              generateMeetLink(candidate);
            }}
            className="bg-green-500 text-white py-2 px-4 rounded-md disabled:bg-gray-400 hover:bg-green-600 transition-all"
            disabled={!modalData.date || !modalData.time || googleApiLoading}
          >
            {googleApiLoading ? "Loading..." : "Generate Meet Link"}
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleModalSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-400 hover:bg-blue-600 transition-all"
              disabled={
                !modalData.date || !modalData.time || !modalData.googleMeetLink
              }
            >
              Submit
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-400 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Start Date Modal (for Selected status) */}
      <Modal
        isOpen={isStartDateModalOpen}
        onRequestClose={() => setIsStartDateModalOpen(false)}
        className="bg-white p-6 rounded-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Set Internship Dates
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDateModalData.startDate}
              onChange={handleStartDateChange}
              className="w-full p-2 border rounded-md"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date (Based on {jobPostData.internshipduration || 'internship duration'})
            </label>
            <input
              type="date"
              value={startDateModalData.endDate}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-calculated based on internship duration</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Work Hours
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={startDateModalData.totalHours}
                readOnly
                className="w-full p-2 border rounded-md bg-gray-100"
              />
              <span className="ml-2">hours</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">8 hours per workday (excluding Sundays)</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleStartDateModalSubmit}
              className="bg-blue-500 text-white py-2 px-4 rounded-md disabled:bg-gray-400 hover:bg-blue-600 transition-all"
              disabled={!startDateModalData.startDate}
            >
              Submit
            </button>
            <button
              onClick={() => setIsStartDateModalOpen(false)}
              className="border border-gray-400 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* MOA Modal - Redesigned */}
      <Modal
        isOpen={isMOAModalOpen}
        onRequestClose={() => setIsMOAModalOpen(false)}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          },
          content: {
            position: 'relative',
            top: '50px', // Added margin from the top to avoid navbar
            left: '0',
            right: '0',
            bottom: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'auto',
            padding: '0',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
             }
        }}
      >
        
        {moaCandidateId && (
          <MOAModalContent
            candidate={candidates.find((c) => c.text === moaCandidateId)}
          />
        )}
      </Modal>

      {/* Company Signature Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onRequestClose={() => setIsSignModalOpen(false)}
        className="bg-white p-6 rounded-lg max-w-2xl mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Sign MOA Agreement
        </h2>
        {signCandidateId && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            {(() => {
              const candidate = candidates.find(c => c.text === signCandidateId);
              return (
                <>
                  <p><strong>Student:</strong> {candidate?.name}</p>
                  <p><strong>Company:</strong> {companyData.organizationName}</p>
                  <p><strong>Internship:</strong> {jobPostData.title}</p>
                </>
              );
            })()}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Representative Signature
          </label>
          <div className="border-2 border-gray-300 rounded-lg">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Please sign above to approve this MOA agreement
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={clearSignature}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-all"
          >
            Clear
          </button>
          <button
            onClick={saveCompanySignature}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
          >
            Sign & Save
          </button>
          <button
            onClick={() => setIsSignModalOpen(false)}
            className="border border-gray-400 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default InternshipCandidates;
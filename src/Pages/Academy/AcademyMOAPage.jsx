import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionData, mUpdate, addGeneralData, uploadAndStoreFile } from "../../Utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import SignatureCanvas from "react-signature-canvas";
import MOAViewer from "../../Components/MOAViewer";
import "../../Components/signature.css";

Modal.setAppElement("#root");

const AcademyMOAPage = () => {
  const navigate = useNavigate();
  const [moaAgreements, setMoaAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMOA, setSelectedMOA] = useState(null);
  const [viewMOA, setViewMOA] = useState(null);
  const [academyData, setAcademyData] = useState({});
  const sigCanvas = useRef(null);
  const moaPrintRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (user.role !== "academy") {
      navigate("/");
      return;
    }
    fetchMOAData();
  }, [user.role, navigate]);

  const fetchMOAData = async () => {
    try {
      setLoading(true);
      
      // Get academy's organization college ID using userid from localStorage
      const academyUser = await fetchSectionData({
        dbName: "internph",
        collectionName: "appuser",
        query: { _id: user.userid },
        projection: { sectionData: 1 },
      });

      if (academyUser.length === 0) {
        setError("Academy user not found");
        return;
      }

      const organisationCollegeId = academyUser[0].sectionData?.appuser?.organisationcollege;
      
      if (!organisationCollegeId) {
        setError("Academy organization not found in profile. Please update your profile.");
        return;
      }

      // Fetch academy institute data
      const instituteData = await fetchSectionData({
        dbName: "internph",
        collectionName: "institute",
        query: { _id: organisationCollegeId },
        projection: { sectionData: 1 },
      });

      if (instituteData.length > 0) {
        setAcademyData(instituteData[0].sectionData?.institute || {});
      }

      // Find students from this academy who have been selected for internships
      const students = await fetchSectionData({
        dbName: "internph",
        collectionName: "appuser",
        query: {
          "sectionData.appuser.organisationcollege": organisationCollegeId,
          "sectionData.appuser.role": "1747825619417" // student role
        },
        projection: { sectionData: 1 },
      });

      if (students.length === 0) {
        setMoaAgreements([]);
        setLoading(false);
        return;
      }

      const studentIds = students.map(s => s._id);

      // Find job posts where these students are selected
      const jobPosts = await fetchSectionData({
        dbName: "internph",
        collectionName: "jobpost",
        query: {
          "sectionData.jobpost.applicants": {
            $elemMatch: {
              text: { $in: studentIds },
              status: "Selected"
            }
          }
        },
        projection: { sectionData: 1, createdBy: 1 },
      });

      // Process MOA agreements
      const moaList = [];
      
      for (const jobPost of jobPosts) {
        const selectedApplicants = jobPost.sectionData.jobpost.applicants.filter(
          app => app.status === "Selected" && studentIds.includes(app.text)
        );

        // Fetch company data
        const companyData = await fetchSectionData({
          dbName: "internph",
          collectionName: "company",
          query: { _id: jobPost.createdBy },
          projection: { sectionData: 1 },
        });

        const company = companyData[0]?.sectionData?.Company || {};

        // Fetch company representative data
        const companyRepResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { 
            companyId: jobPost.createdBy,
            "sectionData.appuser.module": "company"
          },
          projection: { sectionData: 1 },
        });

        let companyRep = "Company Representative";
        let companyRepPosition = "Representative";
        let companyAddress = company.organizationcity || "Company Address";
        
        if (companyRepResponse.length > 0) {
          const repData = companyRepResponse[0].sectionData.appuser || {};
          companyRep = repData.legalname || "Company Representative";
          companyRepPosition = repData.cdesignation ? repData.cdesignation.replace(/&amp;quot;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, '&') : "Representative";
        }

        for (const applicant of selectedApplicants) {
          const student = students.find(s => s._id === applicant.text);
          
          moaList.push({
            id: `${jobPost._id}_${applicant.text}`,
            jobPostId: jobPost._id,
            studentId: applicant.text,
            studentName: applicant.name || student?.sectionData?.appuser?.legalname || "Unknown",
            companyName: company.organizationName || "Unknown Company",
            companyAddress: companyAddress,
            companyRep: companyRep,
            companyRepPosition: companyRepPosition,
            internshipTitle: jobPost.sectionData.jobpost.title || "Internship",
            startDate: applicant.startdate || "",
            endDate: applicant.enddate || "",
            totalHours: applicant.totalHours || 0,
            companySigned: applicant.companySigned || false,
            academySigned: applicant.academySigned || false,
            companySignature: applicant.companySignature || "",
            academySignature: applicant.academySignature || "",
            signedDate: applicant.academySignedDate || "",
            status: getSignatureStatus(applicant)
          });
        }
      }

      setMoaAgreements(moaList);
      
      // Check for fully signed MOAs that don't have documents yet
      await checkAndCreateExistingMOAs(moaList);
    } catch (err) {
      console.error("Error fetching MOA data:", err);
      setError("Failed to load MOA agreements");
      toast.error("Failed to load MOA agreements", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const checkAndCreateExistingMOAs = async (moaList) => {
    try {
      const fullySignedMOAs = moaList.filter(moa => moa.companySigned && moa.academySigned);
      
      for (const moa of fullySignedMOAs) {
        // Check if MOA document already exists
        const existingMOA = await fetchSectionData({
          dbName: "internph",
          collectionName: "moa",
          query: {
            "sectionData.contactus.studentname": moa.studentName,
            "sectionData.contactus.companyname": moa.companyName
          }
        });

        if (existingMOA.length === 0) {
          // Create MOA document for existing signed agreement
          await createMOADocument(moa, moa.academySignature, moa.signedDate);
        }
      }
    } catch (err) {
      console.error("Error checking existing MOAs:", err);
    }
  };

  const getSignatureStatus = (applicant) => {
    if (applicant.companySigned && applicant.academySigned) {
      return "Fully Signed";
    } else if (applicant.companySigned && !applicant.academySigned) {
      return "Pending Academy Signature";
    } else if (!applicant.companySigned && applicant.academySigned) {
      return "Pending Company Signature";
    } else {
      return "Unsigned";
    }
  };

  const handleSignMOA = (moa) => {
    setSelectedMOA(moa);
    setIsSignModalOpen(true);
  };

  const handleViewMOA = (moa) => {
    setViewMOA(moa);
    setIsViewModalOpen(true);
  };

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
            
            p, li {
              margin-bottom: 10px;
              text-align: justify;
            }
          }
          
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

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const saveSignature = async () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Please provide a signature", { autoClose: 3000 });
      return;
    }

    try {
      const signatureDataURL = sigCanvas.current.toDataURL();
      const currentDate = new Date().toISOString();

      // Update the job post with academy signature
      await mUpdate({
        appName: "app8657281202648",
        collectionName: "jobpost",
        query: { _id: selectedMOA.jobPostId },
        update: {
          $set: {
            "sectionData.jobpost.applicants.$[elem].academySigned": true,
            "sectionData.jobpost.applicants.$[elem].academySignature": signatureDataURL,
            "sectionData.jobpost.applicants.$[elem].academySignedDate": currentDate,
          },
        },
        options: {
          arrayFilters: [{ "elem.text": selectedMOA.studentId }],
          upsert: false,
        },
      });

      // If company already signed, create MOA document
      if (selectedMOA.companySigned) {
        await createMOADocument(selectedMOA, signatureDataURL, currentDate);
      }

      // Update local state
      setMoaAgreements(prev => 
        prev.map(moa => 
          moa.id === selectedMOA.id 
            ? { 
                ...moa, 
                academySigned: true, 
                academySignature: signatureDataURL,
                signedDate: currentDate,
                status: moa.companySigned ? "Fully Signed" : "Pending Company Signature"
              }
            : moa
        )
      );

      toast.success("MOA signed successfully!", { autoClose: 3000 });
      setIsSignModalOpen(false);
      setSelectedMOA(null);
    } catch (err) {
      console.error("Error signing MOA:", err);
      toast.error("Failed to sign MOA", { autoClose: 3000 });
    }
  };

  const createMOADocument = async (moa, academySignature, academySignedDate) => {
    try {
      // Check if MOA already exists
      const existingMOA = await fetchSectionData({
        dbName: "internph",
        collectionName: "moa",
        query: {
          "sectionData.contactus.studentname": moa.studentName,
          "sectionData.contactus.companyname": moa.companyName
        }
      });

      if (existingMOA.length > 0) {
        toast.info("MOA document already exists", { autoClose: 3000 });
        return;
      }

      const finalSignedDate = new Date().toLocaleDateString("en-GB");
      const fileUrl = `MOA_${moa.studentName}_${moa.companyName}_${finalSignedDate}.pdf`;

      const moaData = {
        studentname: moa.studentName,
        companyname: moa.companyName,
        academyname: academyData.institutionname || "Academy",
        internshipTitle: moa.internshipTitle,
        startDate: moa.startDate,
        endDate: moa.endDate,
        totalHours: moa.totalHours,
        companySignature: moa.companySignature,
        academySignature: academySignature,
        companySignedDate: moa.companySignedDate,
        academySignedDate: academySignedDate,
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
          createdBy: user.userid,
          companyId: moa.companyId || "",
          createdDate: new Date().toLocaleDateString("en-GB") + ", " + new Date().toLocaleTimeString("en-GB")
        }
      });

      toast.success("MOA document created successfully!", { autoClose: 3000 });
    } catch (err) {
      console.error("Error creating MOA document:", err);
      toast.error("Failed to create MOA document", { autoClose: 3000 });
    }
  };





  const [academyRepPosition, setAcademyRepPosition] = useState("Academy Position");

  useEffect(() => {
    const fetchAcademyRepPosition = async () => {
      try {
        if (user.post) {
          const postResponse = await fetchSectionData({
            dbName: "internph",
            collectionName: "post",
            query: { _id: user.post },
            projection: { sectionData: 1 },
          });
          
          if (postResponse.length > 0) {
            setAcademyRepPosition(postResponse[0].sectionData?.post?.name || "Academy Position");
          }
        }
      } catch (err) {
        console.error("Error fetching academy rep position:", err);
      }
    };
    
    fetchAcademyRepPosition();
  }, [user.post]);

  const generateMOAContent = (moa) => {
    return {
      companyName: moa.companyName,
      companyAddress: moa.companyAddress,
      companyRep: moa.companyRep,
      companyRepPosition: moa.companyRepPosition,
      schoolName: academyData.institutionname || "Academy Name",
      schoolAddress: `${academyData.municipalitycity || ""}, ${academyData.province || ""}`.trim() || "Academy Address",
      schoolRep: user.legalname || "Academy Representative",
      schoolRepPosition: academyRepPosition,
      startDate: moa.startDate,
      endDate: moa.endDate,
      internshipHours: `${moa.totalHours} hours`,
      signingDate: new Date().toLocaleDateString(),
      signingPlace: academyData.municipalitycity || "Location",
    };
  };

  if (loading) return <div className="mx-12 py-4">Loading MOA agreements...</div>;
  if (error) return <div className="mx-12 py-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MOA Agreements</h1>
          <p className="text-gray-600">Manage and sign Memorandum of Agreement documents for your students' internships.</p>
        </div>

        {moaAgreements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No MOA agreements found.</p>
            <p className="text-gray-500 text-sm mt-2">MOA agreements will appear here when your students are selected for internships.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {moaAgreements.map((moa) => (
              <div key={moa.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {moa.internshipTitle}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Student:</span> {moa.studentName}
                      </div>
                      <div>
                        <span className="font-medium">Company:</span> {moa.companyName}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {moa.startDate} to {moa.endDate}
                      </div>
                      <div>
                        <span className="font-medium">Total Hours:</span> {moa.totalHours} hours
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          moa.status === "Fully Signed" ? "bg-green-100 text-green-800" :
                          moa.status === "Pending Academy Signature" ? "bg-yellow-100 text-yellow-800" :
                          moa.status === "Pending Company Signature" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {moa.status}
                        </span>
                      </div>
                      {moa.signedDate && (
                        <div className="md:col-span-2">
                          <span className="font-medium">Academy Signed:</span> {new Date(moa.signedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {!moa.academySigned && moa.companySigned && (
                      <button
                        onClick={() => handleSignMOA(moa)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-all"
                      >
                        Sign MOA
                      </button>
                    )}
                    <button
                      onClick={() => handleViewMOA(moa)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-all"
                    >
                      View MOA
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onRequestClose={() => setIsSignModalOpen(false)}
        className="bg-white p-6 rounded-lg max-w-2xl mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Sign MOA Agreement
        </h2>
        {selectedMOA && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p><strong>Student:</strong> {selectedMOA.studentName}</p>
            <p><strong>Company:</strong> {selectedMOA.companyName}</p>
            <p><strong>Internship:</strong> {selectedMOA.internshipTitle}</p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academy Representative Signature
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
            onClick={saveSignature}
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

      {/* View MOA Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
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
            top: '50px',
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
        {viewMOA && (
          <div>
            <div ref={moaPrintRef}>
              <MOAViewer
                moaData={generateMOAContent(viewMOA)}
                companySignature={viewMOA.companySignature}
                academySignature={viewMOA.academySignature}
                companySignedDate={viewMOA.companySignedDate}
                academySignedDate={viewMOA.signedDate}
              />
            </div>
            <div className="flex justify-end p-4 bg-gray-50 border-t">
              <button
                onClick={handlePrintMOA}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                </svg>
                Print MOA
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .signature-canvas {
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AcademyMOAPage;
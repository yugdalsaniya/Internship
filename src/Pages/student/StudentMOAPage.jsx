import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSectionData } from "../../Utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import MOAViewer from "../../Components/MOAViewer";

Modal.setAppElement("#root");

const StudentMOAPage = () => {
  const navigate = useNavigate();
  const [moaAgreements, setMoaAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewMOA, setViewMOA] = useState(null);
  const moaPrintRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    if (user.role !== "student") {
      navigate("/");
      return;
    }
    fetchStudentMOAs();
  }, [user.role, navigate]);

  const fetchStudentMOAs = async () => {
    try {
      setLoading(true);
      
      // Find job posts where this student is selected
      const jobPosts = await fetchSectionData({
        dbName: "internph",
        collectionName: "jobpost",
        query: {
          "sectionData.jobpost.applicants": {
            $elemMatch: {
              text: user.userid,
              status: "Selected"
            }
          }
        },
        projection: { sectionData: 1, createdBy: 1 },
      });

      if (jobPosts.length === 0) {
        setMoaAgreements([]);
        setLoading(false);
        return;
      }

      const moaList = [];
      
      for (const jobPost of jobPosts) {
        const selectedApplicant = jobPost.sectionData.jobpost.applicants.find(
          app => app.status === "Selected" && app.text === user.userid
        );

        if (selectedApplicant) {
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
          
          if (companyRepResponse.length > 0) {
            const repData = companyRepResponse[0].sectionData.appuser || {};
            companyRep = repData.legalname || "Company Representative";
            companyRepPosition = repData.cdesignation ? repData.cdesignation.replace(/&amp;quot;/g, '"').replace(/&quot;/g, '"').replace(/&amp;/g, '&') : "Representative";
          }

          // Get student's academy info
          const studentData = await fetchSectionData({
            dbName: "internph",
            collectionName: "appuser",
            query: { _id: user.userid },
            projection: { sectionData: 1 },
          });

          const organisationCollegeId = studentData[0]?.sectionData?.appuser?.organisationcollege;
          let academyName = "Academy";
          let academyAddress = "Academy Address";
          let academyRep = "Academy Representative";
          let academyRepPosition = "Position";
          
          if (organisationCollegeId) {
            const instituteData = await fetchSectionData({
              dbName: "internph",
              collectionName: "institute",
              query: { _id: organisationCollegeId },
              projection: { sectionData: 1 },
            });
            
            if (instituteData.length > 0) {
              const institute = instituteData[0].sectionData?.institute || {};
              academyName = institute.institutionname || "Academy";
              academyAddress = `${institute.municipalitycity || ""}, ${institute.province || ""}`.trim() || "Academy Address";
            }

            // Fetch academy representative data
            const academyRepResponse = await fetchSectionData({
              dbName: "internph",
              collectionName: "appuser",
              query: { 
                "sectionData.appuser.organisationcollege": organisationCollegeId,
                "sectionData.appuser.role": "1747903042943"
              },
              projection: { sectionData: 1 },
            });

            if (academyRepResponse.length > 0) {
              const repData = academyRepResponse[0].sectionData?.appuser || {};
              academyRep = repData.legalname || "Academy Representative";
              
              if (repData.post) {
                const postResponse = await fetchSectionData({
                  dbName: "internph",
                  collectionName: "post",
                  query: { _id: repData.post },
                  projection: { sectionData: 1 },
                });
                
                if (postResponse.length > 0) {
                  academyRepPosition = postResponse[0].sectionData?.post?.name || "Position";
                }
              }
            }
          }

          moaList.push({
            id: `${jobPost._id}_${user.userid}`,
            jobPostId: jobPost._id,
            studentName: user.legalname || "Student",
            companyName: company.organizationName || "Unknown Company",
            companyAddress: company.organizationcity || "Company Address",
            companyRep: companyRep,
            companyRepPosition: companyRepPosition,
            academyName: academyName,
            academyAddress: academyAddress,
            academyRep: academyRep,
            academyRepPosition: academyRepPosition,
            internshipTitle: jobPost.sectionData.jobpost.title || "Internship",
            startDate: selectedApplicant.startdate || "",
            endDate: selectedApplicant.enddate || "",
            totalHours: selectedApplicant.totalHours || 0,
            companySigned: selectedApplicant.companySigned || false,
            academySigned: selectedApplicant.academySigned || false,
            companySignature: selectedApplicant.companySignature || "",
            academySignature: selectedApplicant.academySignature || "",
            companySignedDate: selectedApplicant.companySignedDate || "",
            academySignedDate: selectedApplicant.academySignedDate || "",
            status: getSignatureStatus(selectedApplicant)
          });
        }
      }

      setMoaAgreements(moaList);
    } catch (err) {
      console.error("Error fetching student MOAs:", err);
      setError("Failed to load MOA agreements");
      toast.error("Failed to load MOA agreements", { autoClose: 3000 });
    } finally {
      setLoading(false);
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

  const generateMOAContent = (moa) => {
    return {
      companyName: moa.companyName,
      companyAddress: moa.companyAddress,
      companyRep: moa.companyRep,
      companyRepPosition: moa.companyRepPosition,
      schoolName: moa.academyName,
      schoolAddress: moa.academyAddress,
      schoolRep: moa.academyRep,
      schoolRepPosition: moa.academyRepPosition,
      startDate: moa.startDate,
      endDate: moa.endDate,
      internshipHours: `${moa.totalHours} hours`,
      signingDate: new Date().toLocaleDateString(),
      signingPlace: "Location",
    };
  };

  if (loading) return <div className="mx-12 py-4">Loading MOA agreements...</div>;
  if (error) return <div className="mx-12 py-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer />
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My MOA Agreements</h1>
          <p className="text-gray-600">View your Memorandum of Agreement documents for internships.</p>
        </div>

        {moaAgreements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 text-lg">No MOA agreements found.</p>
            <p className="text-gray-500 text-sm mt-2">MOA agreements will appear here when you are selected for internships.</p>
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
                        <span className="font-medium">Company:</span> {moa.companyName}
                      </div>
                      <div>
                        <span className="font-medium">Academy:</span> {moa.academyName}
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
                      {moa.companySigned && moa.companySignedDate && (
                        <div>
                          <span className="font-medium">Company Signed:</span> {new Date(moa.companySignedDate).toLocaleDateString()}
                        </div>
                      )}
                      {moa.academySigned && moa.academySignedDate && (
                        <div>
                          <span className="font-medium">Academy Signed:</span> {new Date(moa.academySignedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewMOA(moa)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-all"
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
                academySignedDate={viewMOA.academySignedDate}
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
    </div>
  );
};

export default StudentMOAPage;
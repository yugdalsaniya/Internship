import { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaCheckCircle, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import CertificatesForm from "./certificates-form/CertificatesForm";
import ProjectsForm from "./certificates-form/ProjectsForm";
import AchievementsForm from "./certificates-form/AchievementsForm";
import ResponsibilitiesForm from "./certificates-form/ResponsibilitiesForm";
import { fetchSectionData, mUpdate } from "../../Utils/api";

function Accomplishments({ userData, updateCompletionStatus }) {
  // Certificate states
  const [certificates, setCertificates] = useState([]);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [isEditingCertificate, setIsEditingCertificate] = useState(false);
  const [editingCertificateData, setEditingCertificateData] = useState(null);
  const [isCertificateSectionOpen, setIsCertificateSectionOpen] =
    useState(true);

  // Project states
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProjectData, setEditingProjectData] = useState(null);
  const [isProjectSectionOpen, setIsProjectSectionOpen] = useState(true);

  // Achievement states
  const [achievements, setAchievements] = useState([]);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [isEditingAchievement, setIsEditingAchievement] = useState(false);
  const [editingAchievementData, setEditingAchievementData] = useState(null);
  const [isAchievementSectionOpen, setIsAchievementSectionOpen] =
    useState(true);

  // Responsibility states
  const [responsibilities, setResponsibilities] = useState([]);
  const [showResponsibilityForm, setShowResponsibilityForm] = useState(false);
  const [isEditingResponsibility, setIsEditingResponsibility] = useState(false);
  const [editingResponsibilityData, setEditingResponsibilityData] =
    useState(null);
  const [isResponsibilitySectionOpen, setIsResponsibilitySectionOpen] =
    useState(true);

  const [userId, setUserId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchUserDataAndAccomplishments = async () => {
      try {
        const userString = localStorage.getItem("user");
        let userIdLocal;

        if (!userString) {
          console.error("Please log in to view your accomplishments.");
          return;
        }

        try {
          const user = JSON.parse(userString);
          userIdLocal = user.userid;
          setUserId(userIdLocal);
        } catch (parseError) {
          console.error("Invalid user data. Please log in again.");
          return;
        }

        const data = await fetchSectionData({
          collectionName: "appuser",
          query: { _id: userIdLocal },
          dbName: "internph",
        });

        if (data.length > 0 && data[0].sectionData?.appuser) {
          const userData = data[0].sectionData.appuser;

          // Set certificates
          setCertificates(userData.certificatesdetails || []);

          // Set projects
          setProjects(userData.projectdetails || []);

          // Set achievements
          setAchievements(userData.achievementsdetails || []);

          // Set responsibilities
          setResponsibilities(userData.responsibilitydetails || []);

          // Update completion status
          const hasAccomplishments =
            (userData.certificatesdetails?.length > 0 ||
             userData.projectdetails?.length > 0 ||
             userData.achievementsdetails?.length > 0 ||
             userData.responsibilitydetails?.length > 0);
          setIsCompleted(hasAccomplishments);
          if (updateCompletionStatus) {
            updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
          }
        } else {
          setIsCompleted(false);
          if (updateCompletionStatus) {
            updateCompletionStatus("Accomplishments & Initiatives", false);
          }
        }
      } catch (error) {
        console.error("Error fetching accomplishments data:", error);
        setIsCompleted(false);
        if (updateCompletionStatus) {
          updateCompletionStatus("Accomplishments & Initiatives", false);
        }
      }
    };

    fetchUserDataAndAccomplishments();
  }, [
    showCertificateForm,
    showProjectForm,
    showAchievementForm,
    showResponsibilityForm,
    updateCompletionStatus,
  ]);

  // Certificate handlers
  const handleCertificateFormClose = () => {
    setShowCertificateForm(false);
    setIsEditingCertificate(false);
    setEditingCertificateData(null);
    setIsCertificateSectionOpen(true);
    // Update completion status after form close
    const hasAccomplishments =
      certificates.length > 0 ||
      projects.length > 0 ||
      achievements.length > 0 ||
      responsibilities.length > 0;
    setIsCompleted(hasAccomplishments);
    if (updateCompletionStatus) {
      updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
    }
  };

  const handleAddCertificateClick = () => {
    setShowCertificateForm(true);
    setIsEditingCertificate(false);
    setEditingCertificateData(null);
    setIsCertificateSectionOpen(false);
  };

  const handleEditCertificateClick = (cert) => {
    setShowCertificateForm(true);
    setIsEditingCertificate(true);
    setEditingCertificateData(cert);
    setIsCertificateSectionOpen(false);
  };

  const handleDeleteCertificate = async (certToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to delete certificate: "${certToDelete.titleofcertificates}"?`
      )
    ) {
      return;
    }

    try {
      const updatedCertificates = certificates.filter(
        (cert) => cert.createdAt !== certToDelete.createdAt
      );

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.certificatesdetails": updatedCertificates,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setCertificates(updatedCertificates);
      const hasAccomplishments =
        updatedCertificates.length > 0 ||
        projects.length > 0 ||
        achievements.length > 0 ||
        responsibilities.length > 0;
      setIsCompleted(hasAccomplishments);
      if (updateCompletionStatus) {
        updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
      }
      alert("Certificate deleted successfully!");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete certificate. Please try again.");
    }
  };

  // Project handlers
  const handleProjectFormClose = () => {
    setShowProjectForm(false);
    setIsEditingProject(false);
    setEditingProjectData(null);
    setIsProjectSectionOpen(true);
    // Update completion status after form close
    const hasAccomplishments =
      certificates.length > 0 ||
      projects.length > 0 ||
      achievements.length > 0 ||
      responsibilities.length > 0;
    setIsCompleted(hasAccomplishments);
    if (updateCompletionStatus) {
      updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
    }
  };

  const handleAddProjectClick = () => {
    setShowProjectForm(true);
    setIsEditingProject(false);
    setEditingProjectData(null);
    setIsProjectSectionOpen(false);
  };

  const handleEditProjectClick = (project) => {
    setShowProjectForm(true);
    setIsEditingProject(true);
    setEditingProjectData(project);
    setIsProjectSectionOpen(false);
  };

  const handleDeleteProject = async (projectToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to delete project: "${projectToDelete.titleofproject}"?`
      )
    ) {
      return;
    }

    try {
      const updatedProjects = projects.filter(
        (project) => project.createdAt !== projectToDelete.createdAt
      );

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.projectdetails": updatedProjects,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setProjects(updatedProjects);
      const hasAccomplishments =
        certificates.length > 0 ||
        updatedProjects.length > 0 ||
        achievements.length > 0 ||
        responsibilities.length > 0;
      setIsCompleted(hasAccomplishments);
      if (updateCompletionStatus) {
        updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
      }
      alert("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  // Achievement handlers
  const handleAchievementFormClose = () => {
    setShowAchievementForm(false);
    setIsEditingAchievement(false);
    setEditingAchievementData(null);
    setIsAchievementSectionOpen(true);
    // Update completion status after form close
    const hasAccomplishments =
      certificates.length > 0 ||
      projects.length > 0 ||
      achievements.length > 0 ||
      responsibilities.length > 0;
    setIsCompleted(hasAccomplishments);
    if (updateCompletionStatus) {
      updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
    }
  };

  const handleAddAchievementClick = () => {
    setShowAchievementForm(true);
    setIsEditingAchievement(false);
    setEditingAchievementData(null);
    setIsAchievementSectionOpen(false);
  };

  const handleEditAchievementClick = (achievement) => {
    setShowAchievementForm(true);
    setIsEditingAchievement(true);
    setEditingAchievementData(achievement);
    setIsAchievementSectionOpen(false);
  };

  const handleDeleteAchievement = async (achievementToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to delete achievement: "${achievementToDelete.titleofachievement}"?`
      )
    ) {
      return;
    }

    try {
      const updatedAchievements = achievements.filter(
        (achievement) => achievement.createdAt !== achievementToDelete.createdAt
      );

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.achievementsdetails": updatedAchievements,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setAchievements(updatedAchievements);
      const hasAccomplishments =
        certificates.length > 0 ||
        projects.length > 0 ||
        updatedAchievements.length > 0 ||
        responsibilities.length > 0;
      setIsCompleted(hasAccomplishments);
      if (updateCompletionStatus) {
        updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
      }
      alert("Achievement deleted successfully!");
    } catch (error) {
      console.error("Error deleting achievement:", error);
      alert("Failed to delete achievement. Please try again.");
    }
  };

  // Responsibility handlers
  const handleResponsibilityFormClose = () => {
    setShowResponsibilityForm(false);
    setIsEditingResponsibility(false);
    setEditingResponsibilityData(null);
    setIsResponsibilitySectionOpen(true);
    // Update completion status after form close
    const hasAccomplishments =
      certificates.length > 0 ||
      projects.length > 0 ||
      achievements.length > 0 ||
      responsibilities.length > 0;
    setIsCompleted(hasAccomplishments);
    if (updateCompletionStatus) {
      updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
    }
  };

  const handleAddResponsibilityClick = () => {
    setShowResponsibilityForm(true);
    setIsEditingResponsibility(false);
    setEditingResponsibilityData(null);
    setIsResponsibilitySectionOpen(false);
  };

  const handleEditResponsibilityClick = (responsibility) => {
    setShowResponsibilityForm(true);
    setIsEditingResponsibility(true);
    setEditingResponsibilityData(responsibility);
    setIsResponsibilitySectionOpen(false);
  };

  const handleDeleteResponsibility = async (responsibilityToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to delete responsibility: "${responsibilityToDelete.positionofresponsibility}"?`
      )
    ) {
      return;
    }

    try {
      const updatedResponsibilities = responsibilities.filter(
        (responsibility) =>
          responsibility.createdAt !== responsibilityToDelete.createdAt
      );

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.responsibilitydetails":
              updatedResponsibilities,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setResponsibilities(updatedResponsibilities);
      const hasAccomplishments =
        certificates.length > 0 ||
        projects.length > 0 ||
        achievements.length > 0 ||
        updatedResponsibilities.length > 0;
      setIsCompleted(hasAccomplishments);
      if (updateCompletionStatus) {
        updateCompletionStatus("Accomplishments & Initiatives", hasAccomplishments);
      }
      alert("Responsibility deleted successfully!");
    } catch (error) {
      console.error("Error deleting responsibility:", error);
      alert("Failed to delete responsibility. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const Main = () => (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-400 text-xl" />
          )}
          <span>Accomplishments & Initiatives</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Accomplishments & Initiatives
          </p>
          <div className="grid grid-cols-1 gap-4">
            {/* Certificate Section */}
            {certificates.length === 0 ? (
              <div
                onClick={handleAddCertificateClick}
                className="bg-purple-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-purple-100"
              >
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span>🎖</span>
                </div>
                <p className="font-semibold text-gray-700">Add Certificates</p>
                <p className="text-sm text-gray-600">
                  Boost your profile with a certificate to impress employers
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-purple-50 cursor-pointer hover:bg-purple-100 transition"
                  onClick={() =>
                    setIsCertificateSectionOpen(!isCertificateSectionOpen)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                      <span>🎖</span>
                    </div>
                    <p className="font-semibold text-gray-700">Certificate</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPlus
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCertificateClick();
                      }}
                      className="cursor-pointer hover:text-purple-600"
                    />
                    {isCertificateSectionOpen ? (
                      <FaChevronUp className="text-xl" />
                    ) : (
                      <FaChevronDown className="text-xl" />
                    )}
                  </div>
                </div>

                {/* Certificate Section Content */}
                {isCertificateSectionOpen && (
                  <div className="p-4 bg-white">
                    <div className="space-y-4">
                      {certificates.map((cert, index) => (
                        <div
                          key={cert.createdAt || index}
                          className="border rounded-lg p-4 space-y-2 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {cert.titleofcertificates}
                            </h4>
                            <p className="text-gray-600">
                              {cert.issuingorganization}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(cert.certificatestartdate)}
                              {cert.hasexpirydate &&
                                cert.certificateenddate &&
                                ` - ${formatDate(cert.certificateenddate)}`}
                              {!cert.hasexpirydate && " - No Expiry"}
                            </p>
                            {cert.certificateskill &&
                              cert.certificateskill.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {cert.certificateskill.map((skill, i) => (
                                    <span
                                      key={i}
                                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            {cert.certificatedescription && (
                              <p className="text-sm text-gray-600 mt-2">
                                {cert.certificatedescription}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditCertificateClick(cert)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCertificate(cert)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Project Section */}
            {projects.length === 0 ? (
              <div
                onClick={handleAddProjectClick}
                className="bg-blue-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-blue-100"
              >
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span>📜</span>
                </div>
                <p className="font-semibold text-gray-700">Add Projects</p>
                <p className="text-sm text-gray-600">
                  Boost your profile with a project to impress employers
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition"
                  onClick={() => setIsProjectSectionOpen(!isProjectSectionOpen)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <span>📜</span>
                    </div>
                    <p className="font-semibold text-gray-700">Projects</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPlus
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProjectClick();
                      }}
                      className="cursor-pointer hover:text-blue-600"
                    />
                    {isProjectSectionOpen ? (
                      <FaChevronUp className="text-xl" />
                    ) : (
                      <FaChevronDown className="text-xl" />
                    )}
                  </div>
                </div>

                {/* Project Section Content */}
                {isProjectSectionOpen && (
                  <div className="p-4 bg-white">
                    <div className="space-y-4">
                      {projects.map((project, index) => (
                        <div
                          key={project.createdAt || index}
                          className="border rounded-lg p-4 space-y-2 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {project.titleofproject}
                            </h4>
                            <p className="text-gray-600">
                              {project.projecttype}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(project.projectstartdate)}
                              {project.ongoing
                                ? " - Ongoing"
                                : project.projectenddate
                                ? ` - ${formatDate(project.projectenddate)}`
                                : ""}
                            </p>
                            {project.projectskill &&
                              project.projectskill.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.projectskill.map((skill, i) => (
                                    <span
                                      key={i}
                                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                            {project.projectdescription && (
                              <p className="text-sm text-gray-600 mt-2">
                                {project.projectdescription}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditProjectClick(project)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Achievement Section */}
            {achievements.length === 0 ? (
              <div
                onClick={handleAddAchievementClick}
                className="bg-yellow-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-yellow-100"
              >
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span>🏆</span>
                </div>
                <p className="font-semibold text-gray-700">Add Achievements</p>
                <p className="text-sm text-gray-600">
                  Boost your profile with an achievement to impress employers
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-yellow-50 cursor-pointer hover:bg-yellow-100 transition"
                  onClick={() =>
                    setIsAchievementSectionOpen(!isAchievementSectionOpen)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
                      <span>🏆</span>
                    </div>
                    <p className="font-semibold text-gray-700">Achievements</p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPlus
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddAchievementClick();
                      }}
                      className="cursor-pointer hover:text-yellow-600"
                    />
                    {isAchievementSectionOpen ? (
                      <FaChevronUp className="text-xl" />
                    ) : (
                      <FaChevronDown className="text-xl" />
                    )}
                  </div>
                </div>

                {/* Achievement Section Content */}
                {isAchievementSectionOpen && (
                  <div className="p-4 bg-white">
                    <div className="space-y-4">
                      {achievements.map((achievement, index) => (
                        <div
                          key={achievement.createdAt || index}
                          className="border rounded-lg p-4 space-y-2 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {achievement.titleofachievement}
                            </h4>
                            {achievement.achievementdescription && (
                              <p className="text-sm text-gray-600 mt-2">
                                {achievement.achievementdescription}
                              </p>
                            )}
                            {achievement.achievementskill &&
                              achievement.achievementskill.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {achievement.achievementskill.map(
                                    (skill, i) => (
                                      <span
                                        key={i}
                                        className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() =>
                                handleEditAchievementClick(achievement)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteAchievement(achievement)
                              }
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Responsibility Section */}
            {responsibilities.length === 0 ? (
              <div
                onClick={handleAddResponsibilityClick}
                className="bg-green-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-green-100"
              >
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span>🌱</span>
                </div>
                <p className="font-semibold text-gray-700">
                  Add Responsibilities
                </p>
                <p className="text-sm text-gray-600">
                  Boost your profile with a responsibility to impress employers
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-green-50 cursor-pointer hover:bg-green-100 transition"
                  onClick={() =>
                    setIsResponsibilitySectionOpen(!isResponsibilitySectionOpen)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                      <span>🌱</span>
                    </div>
                    <p className="font-semibold text-gray-700">
                      Responsibilities
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaPlus
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddResponsibilityClick();
                      }}
                      className="cursor-pointer hover:text-green-600"
                    />
                    {isResponsibilitySectionOpen ? (
                      <FaChevronUp className="text-xl" />
                    ) : (
                      <FaChevronDown className="text-xl" />
                    )}
                  </div>
                </div>

                {/* Responsibility Section Content */}
                {isResponsibilitySectionOpen && (
                  <div className="p-4 bg-white">
                    <div className="space-y-4">
                      {responsibilities.map((responsibility, index) => (
                        <div
                          key={responsibility.createdAt || index}
                          className="border rounded-lg p-4 space-y-2 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">
                              {responsibility.positionofresponsibility}
                            </h4>
                            <p className="text-gray-600">
                              {responsibility.responsibilityorganization}
                            </p>
                            <p className="text-sm text-gray-500">
                              {responsibility.remote
                                ? "Remote"
                                : responsibility.responsibilitylocation}
                              {" • "}
                              {formatDate(
                                responsibility.responsibilitystartdate
                              )}
                              {responsibility.currentlyworking
                                ? " - Present"
                                : responsibility.responsibilityenddate
                                ? ` - ${formatDate(
                                    responsibility.responsibilityenddate
                                  )}`
                                : ""}
                            </p>
                            {responsibility.responsibilityskill &&
                              responsibility.responsibilityskill.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {responsibility.responsibilityskill.map(
                                    (skill, i) => (
                                      <span
                                        key={i}
                                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                                </div>
                              )}
                            {responsibility.responsibilitydescription && (
                              <p className="text-sm text-gray-600 mt-2">
                                {responsibility.responsibilitydescription}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() =>
                                handleEditResponsibilityClick(responsibility)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteResponsibility(responsibility)
                              }
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      {showCertificateForm ? (
        <CertificatesForm
          onBack={handleCertificateFormClose}
          existingCertificate={editingCertificateData}
          isEditing={isEditingCertificate}
        />
      ) : showProjectForm ? (
        <ProjectsForm
          onBack={handleProjectFormClose}
          existingProject={editingProjectData}
          isEditing={isEditingProject}
        />
      ) : showAchievementForm ? (
        <AchievementsForm
          onBack={handleAchievementFormClose}
          existingAchievement={editingAchievementData}
          isEditing={isEditingAchievement}
        />
      ) : showResponsibilityForm ? (
        <ResponsibilitiesForm
          onBack={handleResponsibilityFormClose}
          existingResponsibility={editingResponsibilityData}
          isEditing={isEditingResponsibility}
        />
      ) : (
        <Main />
      )}
    </div>
  );
}

export default Accomplishments;
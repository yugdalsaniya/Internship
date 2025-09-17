import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  BookOpen, 
  Briefcase, 
  ExternalLink,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Download,
  Star,
  ArrowLeft,
  Share2,
  Copy,
  User,
  Globe
} from 'lucide-react';
import { fetchSectionData } from '../../Utils/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SharedProfilePage = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const studentName = searchParams.get('student');
  const studentId = searchParams.get('id');

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    } else {
      setError('No student ID provided');
      setLoading(false);
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching student profile for ID:', studentId);
      
      const response = await fetchSectionData({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: studentId },
        projection: {
          "sectionData.appuser": 1,
          "editedAt": 1
        },
        lookups: [
          {
            $match: { _id: studentId }
          },
          {
            $addFields: {
              allSkillIds: {
                $setUnion: [
                  { $ifNull: ["$sectionData.appuser.skills", []] },
                  {
                    $reduce: {
                      input: { $ifNull: ["$sectionData.appuser.projectdetails", []] },
                      initialValue: [],
                      in: {
                        $setUnion: [
                          "$$value",
                          { $ifNull: ["$$this.projectskill", []] }
                        ]
                      }
                    }
                  },
                  {
                    $reduce: {
                      input: { $ifNull: ["$sectionData.appuser.workexperience2", []] },
                      initialValue: [],
                      in: {
                        $setUnion: [
                          "$$value",
                          { $ifNull: ["$$this.skills4", []] }
                        ]
                      }
                    }
                  }
                ]
              },
              allCourseIds: {
                $setUnion: [
                  {
                    $cond: [
                      { $isArray: "$sectionData.appuser.course" },
                      "$sectionData.appuser.course",
                      { $cond: [ "$sectionData.appuser.course", ["$sectionData.appuser.course"], [] ] }
                    ]
                  },
                  {
                    $reduce: {
                      input: { $ifNull: ["$sectionData.appuser.education", []] },
                      initialValue: [],
                      in: {
                        $setUnion: [
                          "$$value",
                          { $cond: [ "$$this.qualification1", ["$$this.qualification1"], [] ] },
                          { $cond: [ "$$this.course1", ["$$this.course1"], [] ] }
                        ]
                      }
                    }
                  }
                ]
              },
              allDesignationIds: {
                $reduce: {
                  input: { $ifNull: ["$sectionData.appuser.workexperience2", []] },
                  initialValue: [],
                  in: {
                    $setUnion: [
                      "$$value",
                      { $cond: [ "$$this.designation4", ["$$this.designation4"], [] ] }
                    ]
                  }
                }
              },
              allSpecializationIds: {
                $reduce: {
                  input: { $ifNull: ["$sectionData.appuser.education", []] },
                  initialValue: [],
                  in: {
                    $setUnion: [
                      "$$value",
                      { $cond: [ "$$this.specialization1", ["$$this.specialization1"], [] ] }
                    ]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: "skills",
              localField: "allSkillIds",
              foreignField: "_id",
              as: "allSkillsInfo"
            }
          },
          {
            $lookup: {
              from: "hobbies",
              localField: "sectionData.appuser.hobbies",
              foreignField: "_id",
              as: "hobbiesInfo"
            }
          },
          {
            $lookup: {
              from: "course",
              localField: "allCourseIds",
              foreignField: "_id",
              as: "allCourseInfo"
            }
          },
          {
            $lookup: {
              from: "designation",
              localField: "allDesignationIds",
              foreignField: "_id",
              as: "designationInfo"
            }
          },
          {
            $lookup: {
              from: "coursespecialization",
              localField: "allSpecializationIds",
              foreignField: "_id",
              as: "specializationInfo"
            }
          },
          {
            $set: {
              "sectionData.appuser.skills": {
                $map: {
                  input: { $ifNull: ["$sectionData.appuser.skills", []] },
                  as: "skillId",
                  in: {
                    $let: {
                      vars: {
                        index: {
                          $indexOfArray: [
                            "$allSkillsInfo._id",
                            "$$skillId"
                          ]
                        }
                      },
                      in: {
                        $cond: [
                          { $eq: ["$$index", -1] },
                          "$$skillId",
                          { $arrayElemAt: ["$allSkillsInfo.sectionData.skills.name", "$$index"] }
                        ]
                      }
                    }
                  }
                }
              },
              "sectionData.appuser.hobbies": {
                $map: {
                  input: { $ifNull: ["$sectionData.appuser.hobbies", []] },
                  as: "hobbyId",
                  in: {
                    $let: {
                      vars: {
                        index: {
                          $indexOfArray: [
                            "$hobbiesInfo._id",
                            "$$hobbyId"
                          ]
                        }
                      },
                      in: {
                        $cond: [
                          { $eq: ["$$index", -1] },
                          "$$hobbyId",
                          { $arrayElemAt: ["$hobbiesInfo.sectionData.hobbies.name", "$$index"] }
                        ]
                      }
                    }
                  }
                }
              },
              "sectionData.appuser.course": {
                $let: {
                  vars: {
                    index: {
                      $indexOfArray: [
                        "$allCourseInfo._id",
                        "$sectionData.appuser.course"
                      ]
                    }
                  },
                  in: {
                    $cond: [
                      { $eq: ["$$index", -1] },
                      "$sectionData.appuser.course",
                      { $arrayElemAt: ["$allCourseInfo.sectionData.course.name", "$$index"] }
                    ]
                  }
                }
              },
              "sectionData.appuser.education": {
                $map: {
                  input: { $ifNull: ["$sectionData.appuser.education", []] },
                  as: "edu",
                  in: {
                    $mergeObjects: [
                      "$$edu",
                      {
                        qualification1: {
                          $let: {
                            vars: {
                              index: {
                                $indexOfArray: [
                                  "$allCourseInfo._id",
                                  "$$edu.qualification1"
                                ]
                              }
                            },
                            in: {
                              $cond: [
                                { $eq: ["$$index", -1] },
                                "$$edu.qualification1",
                                { $arrayElemAt: ["$allCourseInfo.sectionData.course.name", "$$index"] }
                              ]
                            }
                          }
                        },
                        course1: {
                          $let: {
                            vars: {
                              index: {
                                $indexOfArray: [
                                  "$allCourseInfo._id",
                                  "$$edu.course1"
                                ]
                              }
                            },
                            in: {
                              $cond: [
                                { $eq: ["$$index", -1] },
                                "$$edu.course1",
                                { $arrayElemAt: ["$allCourseInfo.sectionData.course.name", "$$index"] }
                              ]
                            }
                          }
                        },
                        specialization1: {
                          $let: {
                            vars: {
                              index: {
                                $indexOfArray: [
                                  "$specializationInfo._id",
                                  "$$edu.specialization1"
                                ]
                              }
                            },
                            in: {
                              $cond: [
                                { $eq: ["$$index", -1] },
                                "$$edu.specialization1",
                                { $arrayElemAt: ["$specializationInfo.sectionData.coursespecialization.name", "$$index"] }
                              ]
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              },
              "sectionData.appuser.workexperience2": {
                $map: {
                  input: { $ifNull: ["$sectionData.appuser.workexperience2", []] },
                  as: "exp",
                  in: {
                    $mergeObjects: [
                      "$$exp",
                      {
                        designation4: {
                          $let: {
                            vars: {
                              index: {
                                $indexOfArray: [
                                  "$designationInfo._id",
                                  "$$exp.designation4"
                                ]
                              }
                            },
                            in: {
                              $cond: [
                                { $eq: ["$$index", -1] },
                                "$$exp.designation4",
                                { $arrayElemAt: ["$designationInfo.sectionData.designation.name", "$$index"] }
                              ]
                            }
                          }
                        },
                        skills4: {
                          $map: {
                            input: { $ifNull: ["$$exp.skills4", []] },
                            as: "sid",
                            in: {
                              $let: {
                                vars: {
                                  index: {
                                    $indexOfArray: [
                                      "$allSkillsInfo._id",
                                      "$$sid"
                                    ]
                                  }
                                },
                                in: {
                                  $cond: [
                                    { $eq: ["$$index", -1] },
                                    "$$sid",
                                    { $arrayElemAt: ["$allSkillsInfo.sectionData.skills.name", "$$index"] }
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              },
              "sectionData.appuser.projectdetails": {
                $map: {
                  input: { $ifNull: ["$sectionData.appuser.projectdetails", []] },
                  as: "proj",
                  in: {
                    $mergeObjects: [
                      "$$proj",
                      {
                        projectskill: {
                          $map: {
                            input: { $ifNull: ["$$proj.projectskill", []] },
                            as: "psid",
                            in: {
                              $let: {
                                vars: {
                                  pindex: {
                                    $indexOfArray: [
                                      "$allSkillsInfo._id",
                                      "$$psid"
                                    ]
                                  }
                                },
                                in: {
                                  $cond: [
                                    { $eq: ["$$pindex", -1] },
                                    "$$psid",
                                    { $arrayElemAt: ["$allSkillsInfo.sectionData.skills.name", "$$pindex"] }
                                  ]
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            $unset: [
              "allSkillIds",
              "allSkillsInfo",
              "hobbiesInfo",
              "allCourseIds",
              "allCourseInfo",
              "allDesignationIds",
              "designationInfo",
              "allSpecializationIds",
              "specializationInfo"
            ]
          }
        ]
      });

      console.log('API Response:', response);

      if (response && response.length > 0 && response[0].sectionData?.appuser) {
        setStudentData(response[0]);
      } else {
        setError('Student profile not found');
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
      setError('Failed to load student profile');
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const getSocialLinks = (appuser) => {
    const links = [];
    if (appuser.linkedIn) links.push({ type: 'linkedin', url: appuser.linkedIn, icon: Linkedin, color: 'text-blue-600' });
    if (appuser.github || appuser.git) links.push({ type: 'github', url: appuser.github || appuser.git, icon: Github, color: 'text-gray-800' });
    if (appuser.facebook) links.push({ type: 'facebook', url: appuser.facebook, icon: Facebook, color: 'text-blue-600' });
    if (appuser.instagram) links.push({ type: 'instagram', url: appuser.instagram, icon: Instagram, color: 'text-pink-600' });
    if (appuser.x) links.push({ type: 'x', url: appuser.x, icon: Globe, color: 'text-gray-800' });
    if (appuser.medium) links.push({ type: 'medium', url: appuser.medium, icon: Globe, color: 'text-gray-800' });
    if (appuser.dribbble) links.push({ type: 'dribbble', url: appuser.dribbble, icon: Globe, color: 'text-pink-600' });
    if (appuser.behance) links.push({ type: 'behance', url: appuser.behance, icon: Globe, color: 'text-blue-600' });
    return links;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile URL copied to clipboard!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${getStudentName()}'s Profile`,
          text: `Check out ${getStudentName()}'s professional profile`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const getStudentName = () => {
    if (!studentData?.sectionData?.appuser) return 'Student';
    const { appuser } = studentData.sectionData;
    return appuser.fullname || 
           appuser.legalname || 
           appuser.name || 
           `${appuser.firstname || ''} ${appuser.lastname || ''}`.trim() || 
           'Student';
  };

  const getProfileImage = () => {
    if (!studentData?.sectionData?.appuser) return '/default-avatar.png';
    const { appuser } = studentData.sectionData;
    const profileImage = appuser.profileImage || appuser.profile;
    // Validate that profileImage is a non-empty string and starts with http/https
    if (profileImage && typeof profileImage === 'string' && /^https?:\/\//.test(profileImage)) {
      return profileImage;
    }
    console.warn('Invalid or missing profile image URL:', profileImage);
    return '/default-avatar.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !studentData || !studentData.sectionData?.appuser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested student profile could not be found.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/ph/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { appuser } = studentData.sectionData;
  const socialLinks = getSocialLinks(appuser);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header Section */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4 sm:mb-0"
            > 
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Home</span>
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={shareProfile}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                <Copy size={16} />
                Copy Link
              </button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Profile Image and Basic Info */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative">
                <img
                  src={getProfileImage()}
                  alt={getStudentName()}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-md"
                  onError={(e) => {
                    if (e.target.src !== `${window.location.origin}/default-avatar.png`) {
                      console.error('Image failed to load:', e.target.src);
                      e.target.src = '/default-avatar.png';
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              
              {/* Download Resume */}
              {(appuser.resume || appuser.cv || appuser.resumeurl) && (
                <a
                  href={appuser.resume || appuser.cv || appuser.resumeurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <Download size={16} />
                  Download Resume
                </a>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {getStudentName()}
                  </h1>
                  <p className="text-lg text-gray-600 mb-4">
                    {appuser.usertype || 'Student'} 
                    {appuser.coursename && ` • ${appuser.coursename}`}
                    {appuser.institutename && ` • ${appuser.institutename}`}
                  </p>
                  
                  {/* Contact Info */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 mb-4">
                    {appuser.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={16} />
                        <span className="text-sm truncate max-w-[200px]">{appuser.email}</span>
                      </div>
                    )}
                    {(appuser.mobile || appuser.phonenumber) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={16} />
                        <span className="text-sm">{appuser.mobile || appuser.phonenumber}</span>
                      </div>
                    )}
                    {appuser.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span className="text-sm truncate max-w-[200px]">{appuser.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info Tags */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm mb-4">
                    {appuser.Gender && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {appuser.Gender}
                      </span>
                    )}
                    {appuser.startyear && appuser.endyear && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        {appuser.startyear} - {appuser.endyear}
                      </span>
                    )}
                    {appuser.course && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {appuser.course}
                      </span>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex gap-3 mt-4 lg:mt-0 justify-center lg:justify-end">
                    {socialLinks.map(({ type, url, icon: Icon, color }) => (
                      <a
                        key={type}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-all duration-200 group"
                        title={`View ${type} profile`}
                      >
                        <Icon size={20} className={`${color} group-hover:scale-110 transition-transform`} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {[
              { id: 'about', label: 'About', icon: User },
              { id: 'education', label: 'Education', icon: BookOpen },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'certificates', label: 'Certificates', icon: Award },
              { id: 'projects', label: 'Projects', icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border p-6 sm:p-8">
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">About</h3>
                <div className="text-gray-700 leading-relaxed max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {appuser.about || appuser.bio ? (
                    <p className="whitespace-pre-wrap break-words">{appuser.about || appuser.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description available.</p>
                  )}
                </div>
              </div>

              {appuser.skills && appuser.skills.length > 0 && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {appuser.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-200 hover:bg-blue-200 transition-colors"
                      >
                        {skill || 'Unknown Skill'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {appuser.hobbies && appuser.hobbies.length > 0 && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Hobbies & Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {appuser.hobbies.map((hobby, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm border border-gray-200 hover:bg-gray-200 transition-colors"
                      >
                        {hobby || 'Unknown Hobby'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Education</h3>
              {appuser.education && appuser.education.length > 0 ? (
                <div className="space-y-6">
                  {appuser.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-6 py-4 bg-blue-50/50 rounded-r-lg transition-all hover:shadow-md">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {edu.qualification1} {edu.course1 && `in ${edu.course1}`}
                        </h4>
                        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded mt-2 sm:mt-0">
                          {edu.startyear1} - {edu.endyear1 || 'Present'}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium">{edu.college1}</p>
                      {edu.specialization1 && (
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">Specialization:</span> {edu.specialization1}
                        </p>
                      )}
                      {edu.percentage1 && (
                        <p className="text-gray-600 text-sm mt-1">
                          <span className="font-medium">Grade:</span> {edu.percentage1}% ({edu.grade1})
                        </p>
                      )}
                      {edu.description1 && (
                        <p className="text-gray-700 text-sm mt-2 italic">{edu.description1}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No education details available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Work Experience</h3>
              {appuser.workexperience2 && appuser.workexperience2.length > 0 ? (
                <div className="space-y-6">
                  {appuser.workexperience2.map((exp, index) => (
                    <div key={index} className="border-l-4 border-green-600 pl-6 py-4 bg-green-50/50 rounded-r-lg transition-all hover:shadow-md">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {exp.designation4}
                        </h4>
                        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded mt-2 sm:mt-0">
                          {formatDate(exp.startdate4)} - {exp.currentlyworking4 ? 'Present' : formatDate(exp.enddate4)}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium">{exp.organisation4}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                        <span className="px-2 py-1 bg-white rounded border">{exp.employmenttype4}</span>
                        {exp.location4 && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                            <MapPin size={14} />
                            {exp.location4}
                          </span>
                        )}
                        {exp.remote4 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-200">Remote</span>
                        )}
                      </div>
                      {exp.description4 && (
                        <p className="text-gray-700 text-sm mt-2 italic">{exp.description4}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No work experience available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Certificates</h3>
              {appuser.certificatesdetails && appuser.certificatesdetails.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {appuser.certificatesdetails.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 transition-all hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">
                          {cert.titleofcertificates}
                        </h4>
                        {cert.certificatelink && (
                          <a
                            href={cert.certificatelink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 ml-2"
                            title="View certificate"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 font-medium">{cert.issuingorganization}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <Calendar size={14} className="inline mr-1" />
                        Issued: {formatDate(cert.certificatestartdate)}
                        {cert.certificateenddate && ` - ${formatDate(cert.certificateenddate)}`}
                      </p>
                      {cert.certificatedescription && (
                        <p className="text-gray-700 text-sm mt-2 italic">{cert.certificatedescription}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No certificates available.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Projects</h3>
              {appuser.projectdetails && appuser.projectdetails.length > 0 ? (
                <div className="space-y-6">
                  {appuser.projectdetails.map((project, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-gradient-to-br from-white to-purple-50 transition-all hover:shadow-md">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">
                          {project.titleofproject}
                        </h4>
                        <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded mt-2 sm:mt-0">
                          {formatDate(project.projectstartdate)} - 
                          {project.ongoing ? 'Ongoing' : formatDate(project.projectenddate)}
                        </span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm border border-purple-200">
                          {project.projecttype}
                        </span>
                        {project.ongoing && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm border border-green-200">
                            Ongoing
                          </span>
                        )}
                      </div>
                      {project.projectdescription && (
                        <p className="text-gray-700 text-sm mb-3 italic">{project.projectdescription}</p>
                      )}
                      {project.projectskill && project.projectskill.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.projectskill.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm border"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No projects available.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedProfilePage;
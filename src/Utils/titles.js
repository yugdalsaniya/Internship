export const getPageTitle = (pathname, location) => {
  const titles = {
    '/': 'Top Internships & OJT Programs in the Philippines | Career Launch',
    '/signup': 'Sign Up for Internships & OJT Programs in the Philippines',
    '/otp': 'Verify Your Account | Internship & OJT Platform',
    '/forgotpassword': 'Reset Your Password | Internship & OJT Platform',
    '/login': 'Log In to Your Internship & OJT Account',
    '/privacy-policy': 'Privacy Policy | Internship & OJT Platform Philippines',
    '/editprofile/*': 'Edit Your Profile | Internship & OJT Platform',
    '/sidebar/*': 'User Dashboard | Internship & OJT Platform',
    '/internship': 'Explore Internships & OJT Opportunities in the Philippines',
    '/about': 'About Us | Internship & OJT Platform Philippines',
    '/contact': 'Contact Us | Internship & OJT Platform Philippines',
    '/post-internship': 'Post an Internship Opportunity | Employer Dashboard',
    '/post-internship/form': 'Create a New Internship Listing | Employer Dashboard',
    '/manage-internships': 'Manage Your Internship Listings | Employer Dashboard',
    '/StudentPostForm': 'Post Your Internship Profile | Student Dashboard',
    '/interns': 'Browse Student Interns | Employer Dashboard',
    '/my-applications': 'My Internship Applications | Student Dashboard',
    '/requested-internships': 'Requested Internships | Student Dashboard',
    '/all-employers': 'Top Employers Offering Internships in the Philippines',
    '/all-academies': 'Academy Partners for Internships & OJT Programs',
    '/news-and-blog': 'News & Blog | Internship & OJT Platform Philippines',
  };

  // Handle dynamic routes
  if (pathname.startsWith('/signup/')) {
    const role = location.pathname.split('/')[2] || 'User';
    return `Join as a ${role.charAt(0).toUpperCase() + role.slice(1)} for Internships & OJT Programs`;
  }
  if (pathname.startsWith('/internshipdetail/')) {
    // Note: Fetch internship title dynamically in the component if possible
    return 'Internship Details | Loading...';
  }
  if (pathname.startsWith('/applyinternshipform/')) {
    // Note: Fetch internship title dynamically in the component if possible
    return 'Apply for Internship | Loading...';
  }
  if (pathname.startsWith('/internship/') && pathname.includes('/candidates')) {
    // Note: Fetch internship title dynamically in the component if possible
    return 'Candidates for Internship | Loading...';
  }
  if (pathname.match(/^\/[a-zA-Z0-9-]+\/internships\/\d+$/)) {
    const categoryName = location.pathname.split('/')[1].replace(/-/g, ' ');
    return `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Internships in the Philippines`;
  }
  if (pathname.match(/^\/[a-zA-Z0-9-]+\/\d+$/) || pathname.startsWith('/company/')) {
    // Note: Fetch company name dynamically in the component if possible
    return 'Company Profile | Internship & OJT Platform';
  }
  if (pathname.startsWith('/newsandblog/')) {
    // Note: Fetch blog title dynamically in the component if possible
    return 'News & Blog | Loading...';
  }
  if (pathname.startsWith('/academy/')) {
    // Note: Fetch academy name dynamically in the component if possible
    return 'Academy Profile | Internship & OJT Platform';
  }

  return titles[pathname] || 'Internship & OJT Platform Philippines';
};
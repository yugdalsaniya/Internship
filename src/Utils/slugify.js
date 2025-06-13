export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/interrnship/g, 'internship') // Fix common typo
    .substring(0, 100); // Limit length for SEO
};

export const generateInternshipSlug = (title, location, company, id) => {
  const baseSlug = `${slugify(title)}-in-${slugify(location)}-at-${slugify(company)}`;
  return `${baseSlug}-${id}`;
};
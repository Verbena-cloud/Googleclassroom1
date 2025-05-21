/**
 * Utility functions for class/course related features
 */

/**
 * Generates a random color for course cards based on the course name
 * @param {string} text - Text to use as seed (usually course name)
 * @returns {string} - Hex color code
 */
export const getClassColor = (text) => {
  if (!text || typeof text !== 'string') return '#4285F4'; // Default Google blue
  
  const colors = [
    '#4285F4', // Google blue
    '#EA4335', // Google red
    '#FBBC05', // Google yellow
    '#34A853', // Google green
    '#8E24AA', // Purple
    '#F06292', // Pink
    '#FF7043', // Deep orange
    '#039BE5', // Light blue
    '#0097A7', // Teal
    '#689F38', // Light green
    '#FFA000', // Amber
    '#5E35B1', // Deep purple
    '#3949AB', // Indigo
    '#43A047', // Green
    '#C0CA33', // Lime
    '#00ACC1', // Cyan
  ];
  
  // Use the sum of character codes as a deterministic seed
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed += text.charCodeAt(i);
  }
  
  return colors[seed % colors.length];
};

/**
 * Generates a gradient background style for course cards
 * @param {string} text - Text to use as seed (usually course name)
 * @returns {string} - CSS gradient background
 */
export const getClassBackground = (text) => {
  if (!text || typeof text !== 'string') {
    // Default gradient
    return 'linear-gradient(135deg, #4285F4 0%, #5B8DEF 50%, #7DA9F9 100%)';
  }
  
  // Gradient patterns similar to Google Classroom
  const gradients = [
    // Blue variants
    'linear-gradient(135deg, #4285F4 0%, #5B8DEF 50%, #7DA9F9 100%)',
    'linear-gradient(135deg, #1A73E8 0%, #5B8DEF 80%, #7DA9F9 100%)',
    
    // Red variants
    'linear-gradient(135deg, #EA4335 0%, #F87B73 50%, #FADAD9 100%)',
    'linear-gradient(135deg, #DB4437 0%, #E67C73 80%, #FADAD9 100%)',
    
    // Green variants
    'linear-gradient(135deg, #34A853 0%, #7CB342 50%, #AEEA00 100%)',
    'linear-gradient(135deg, #0F9D58 0%, #57BB8A 80%, #B7E1CD 100%)',
    
    // Yellow/Orange variants
    'linear-gradient(135deg, #FBBC05 0%, #FDD663 50%, #FEE8A2 100%)',
    'linear-gradient(135deg, #F4B400 0%, #FDD663 80%, #FEE8A2 100%)',
    
    // Purple variants
    'linear-gradient(135deg, #8E24AA 0%, #AB47BC 50%, #CE93D8 100%)',
    'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 80%, #D1C4E9 100%)',
    
    // Teal variants
    'linear-gradient(135deg, #0097A7 0%, #26C6DA 50%, #80DEEA 100%)',
    'linear-gradient(135deg, #00796B 0%, #26A69A 80%, #B2DFDB 100%)',
    
    // Pink variants
    'linear-gradient(135deg, #F06292 0%, #F48FB1 50%, #F8BBD0 100%)',
    'linear-gradient(135deg, #E91E63 0%, #F06292 80%, #F8BBD0 100%)',
    
    // Orange variants
    'linear-gradient(135deg, #FF7043 0%, #FF9E80 50%, #FFCCBC 100%)',
    'linear-gradient(135deg, #FF5722 0%, #FF8A65 80%, #FFCCBC 100%)'
  ];
  
  // Use the sum of character codes as a deterministic seed
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed += text.charCodeAt(i);
  }
  
  return gradients[seed % gradients.length];
};

/**
 * Generates the initials for a class avatar
 * @param {string} className - The name of the class
 * @returns {string} - One or two character initials
 */
export const getClassInitials = (className) => {
  if (!className || typeof className !== 'string') return '?';
  
  // Split by spaces and get first letters of first two words
  const words = className.trim().split(/\s+/);
  
  if (words.length === 1) {
    // If only one word, return the first letter
    return words[0].charAt(0).toUpperCase();
  } else {
    // If multiple words, return first letter of first two words
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
};

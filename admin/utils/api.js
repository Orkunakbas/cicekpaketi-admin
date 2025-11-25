// API Base URL Helper
export const getApiUrl = (path) => {
  // Development'ta rewrites kullan
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  
  // Production'da NEXT_PUBLIC_API_URL kullan
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl}${path}`;
};

export default getApiUrl;



// Define API URL based on environment
export const getApiUrl = (endpoint: string): string => {
    // During development, use the full URL to your local backend
    if (import.meta.env.DEV) {
      return `http://localhost:5001${endpoint}`;
    }
    
    // In production on Vercel, use relative path
    return `/api${endpoint}`;
  };
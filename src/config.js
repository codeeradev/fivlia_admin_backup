export const getEnvFromApi = async () => {
  try {
    const res = await fetch("https://api.fivlia.in/getSmsType");
    const data = await res.json();

    return {
      REACT_APP_GOOGLE_MAPS_API_KEY: data.Map_Api?.[0]?.google?.api_key || "",
      REACT_APP_OLA_MAPS_API_KEY: data.Map_Api?.[0]?.ola?.api_key || "6892e43ddb979dd4fb138b36",
    };
  } catch (error) {
    console.error("Error loading env from API:", error);
    return {
      REACT_APP_GOOGLE_MAPS_API_KEY: "",
      REACT_APP_OLA_MAPS_API_KEY: "6892e43ddb979dd4fb138b36",
    };
  }
};

// Function to get the appropriate maps API key with fallback
export const getMapsApiKey = () => {
  const googleKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const olaKey = process.env.REACT_APP_OLA_MAPS_API_KEY || "6892e43ddb979dd4fb138b36";
  
  // Return Google Maps API key if available, otherwise fallback to Ola
  return googleKey || olaKey;
};

// Function to check if Google Maps is available
export const isGoogleMapsAvailable = () => {
  return !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
};

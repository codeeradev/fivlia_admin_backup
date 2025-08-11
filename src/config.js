export const getEnvFromApi = async () => {
  try {
    const res = await fetch("https://api.fivlia.in/getSmsType");
    const data = await res.json();

    return {
      REACT_APP_GOOGLE_MAPS_API_KEY: data.Map_Api?.[0]?.google?.api_key || "",
    };
  } catch (error) {
    console.error("Error loading env from API:", error);
    return {
      REACT_APP_GOOGLE_MAPS_API_KEY: "",
    };
  }
};

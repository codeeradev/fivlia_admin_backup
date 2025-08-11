import React, { useState, useRef, useEffect, useCallback } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Button } from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom"; // <-- import useLocation
import "./City.css";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

function EditCity() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();  // <-- to get passed state

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [cityCoordinates, setCityCoordinates] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [id,setId]=useState('')
  const searchRef = useRef(null);

  useEffect(() => {
   
    if (location.state) {
      const cityData = location.state;
      setId(cityData.id)
     
      
      setSelectedCity(cityData.name || cityData.city || "");
      setSelectedState(cityData.state || "");
      setFullAddress(cityData.fullAddress || cityData.name || "");
      setSearchTerm(cityData.fullAddress || cityData.name || "");
      if (cityData.latitude && cityData.longitude) {
        setCityCoordinates({ lat: cityData.latitude, lng: cityData.longitude });
      } else if (cityData.lat && cityData.lng) {
        setCityCoordinates({ lat: cityData.lat, lng: cityData.lng });
      }
    }
  }, [location.state]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        value
      )}&addressdetails=1`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const handleSelectSuggestion = (item) => {
    const { lat, lon, address, display_name } = item;
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.state_district ||
      "Unknown City";
    const state = address.state || "Unknown State";

    setSelectedCity(city);
    setSelectedState(state);
    setFullAddress(display_name);
    setSearchTerm(display_name);
    setCityCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
    setSuggestions([]);
  };

  const handleMapClick = useCallback(
    async (e) => {
      if (!isLoaded) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const address = data.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.locality ||
        address.municipality ||
        address.state_district ||
        "Unknown City";
      const state = address.state || "Unknown State";
      const fullAddress = data.display_name || "";

      setSelectedCity(city);
      setSelectedState(state);
      setFullAddress(fullAddress);
      setSearchTerm(fullAddress);
      setCityCoordinates({ lat, lng });
      setSuggestions([]);
    },
    [isLoaded]
  );

  const handleSave = async () => {
    if (!cityCoordinates) {
      alert("Please select a city/location first!");
      return;
    }

    const dataToSave = {
      city: selectedCity,
      state: selectedState,
      fullAddress,
      latitude: cityCoordinates.lat,
      longitude: cityCoordinates.lng,
    };

    try {
      const result = await fetch(`https://api.fivlia.in/updateCityStatus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (result.status === 200) {
        alert("Success");
        navigate(-1);
      }
    } catch (err) {
      console.error("Error saving city:", err);
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="city-container">
        <h2 style={{ textAlign: "center", color: "green", fontWeight: 500, marginTop: "-30px" }}>
          EDIT CITY
        </h2>
        <div className="add-city-box">
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
            <div>
              <h3 style={{ textAlign: "center", marginLeft: "70px" }}>City</h3>
            </div>
            <div style={{ width: "33%", position: "relative", marginRight: "30px" }} ref={searchRef}>
              <input
                type="text"
                placeholder="Search City"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              {suggestions.length > 0 && (
                <ul className="suggestion-list">
                  {suggestions.map((item, index) => (
                    <li key={index} onClick={() => handleSelectSuggestion(item)}>
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div
            style={{
              width: "70%",
              height: "400px",
              marginTop: "50px",
              display: "flex",
              marginLeft: "180px",
            }}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={cityCoordinates || defaultCenter}
              zoom={cityCoordinates ? 12 : 4}
              onClick={handleMapClick}
            >
              {cityCoordinates && <Marker position={cityCoordinates} />}
            </GoogleMap>
          </div>

          <div style={{ display:'flex',gap:'20px',marginTop: "30px",justifyContent:"center",alignItems:'center' }}>
            <Button
              style={{
                backgroundColor: "#00c853",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              style={{
                backgroundColor: "gray",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default EditCity;

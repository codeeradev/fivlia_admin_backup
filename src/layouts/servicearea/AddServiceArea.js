import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Slider,
  Button,
} from "@mui/material";
import { Marker, Circle } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import { Autocomplete as GooglePlacesAutocomplete } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places"];

function AddServiceArea() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { apiType, googleFatalError } = useMapsApi();
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    if (apiType === 'google' && !googleFatalError) {
      const check = () => {
        const ready = !!(window.google && window.google.maps && window.google.maps.places);
        setIsGoogleReady(ready);
      };
      check();
      const interval = setInterval(check, 300);
      return () => clearInterval(interval);
    }
    setIsGoogleReady(false);
  }, [apiType, googleFatalError]);

  const [range, setRange] = useState(3.2);
  const [areaTitle, setAreaTitle] = useState("");
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [title,setTitle]=useState('')

  const autocompleteRef = useRef(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch("https://api.fivlia.in/getAviableCity");
        const data = await res.json();
        if (data && data.length > 0) {
          setCities(data);
          const firstCity = data[0];
          setCity(firstCity);
          const coords = { lat: firstCity.latitude, lng: firstCity.longitude };
          setMarkerPosition(coords);
          setLatitude(coords.lat);
          setLongitude(coords.lng);
        }
      } catch (err) {
        console.error("Failed to fetch cities", err);
        alert("Failed to load cities from API.");
      }
    }
    fetchCities();
  }, []);

  const handleRangeChange = (_, newValue) => setRange(newValue);

  const handleCityChange = (event) => {
    const selectedCity = cities.find((c) => c._id === event.target.value);
    if (selectedCity) {
      const coords = { lat: selectedCity.latitude, lng: selectedCity.longitude };
      setCity(selectedCity);
      setMarkerPosition(coords);
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setAreaTitle("");
    }
  };

  const handleSave = async () => {
    try {
      if (!city) {
        alert("Please select a city");
        return;
      }
      if (!areaTitle) {
        alert("Please enter/select a zone");
        return;
      }
      if(!title){
        alert('Invalid Title')
        return
      }

      const payload = {
        city: city.city,
        zoneTitle:title,
        address: areaTitle,
        latitude,
        longitude,
        range: range * 1000,
      };

      const result = await fetch("https://node-m8jb.onrender.com/addLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (result.status === 200) {
        alert("Area Saved Successfully");
        navigate(-1);
      } else {
        const errRes = await result.json();
        alert("Failed to save area: " + errRes.message);
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving area.");
    }
  };

  const handleMapClick = (e) => {
    // Google click
    if (e?.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            setAreaTitle(results[0].formatted_address);
          } else {
            setAreaTitle("");
          }
        });
      } else {
        setAreaTitle(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
      return;
    }

    // Leaflet/Ola click
    if (typeof e?.lat === 'number' && typeof e?.lng === 'number') {
      const lat = e.lat;
      const lng = e.lng;
      setLatitude(lat);
      setLongitude(lng);
      setMarkerPosition({ lat, lng });
      setAreaTitle(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2}>
      <div style={{ padding: "20px", maxWidth: "80%", margin: "0 auto", fontFamily: "Arial" }}>
        <h2 style={{ textAlign: "center", color: "green", marginBottom: "40px" }}>ADD NEW ZONE</h2>

        {/* City Dropdown */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>City</label>
          <select style={{ width: "70%" }} onChange={handleCityChange} value={city?._id || ""}>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.city}
              </option>
            ))}
          </select>
        </div>

         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone Title</label>
           <input type="text" style={{ width: "70%" }} placeholder="Enter Zone Title" 
           onChange={(e)=>setTitle(e.target.value)}
           />
        </div>

        {/* Google Places Autocomplete */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone</label>
          <div style={{ width: "70%" }}>
            {apiType === 'google' && isGoogleReady ? (
              <GooglePlacesAutocomplete
              onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete;
              }}
              onPlaceChanged={() => {
                const place = autocompleteRef.current.getPlace();
                if (place.geometry) {
                  const lat = place.geometry.location.lat();
                  const lng = place.geometry.location.lng();
                  setAreaTitle(place.formatted_address);
                  setLatitude(lat);
                  setLongitude(lng);
                  setMarkerPosition({ lat, lng });
                }
              }}
              >
                <TextField
                  fullWidth
                  placeholder="Search for a location"
                  value={areaTitle}
                  onChange={(e) => setAreaTitle(e.target.value)}
                />
              </GooglePlacesAutocomplete>
            ) : (
              <TextField
                fullWidth
                placeholder="Search for a location"
                value={areaTitle}
                onChange={(e) => setAreaTitle(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Map and Steps Section */}
        <div style={{ display: "flex", flexDirection: "row", gap: "30px", marginBottom: "30px" }}>
          {/* Steps */}
          <div style={{ flex: "1", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>Steps to Add a New Service Area</h3>
            <ul style={{ paddingLeft: "20px", fontSize: "14px", lineHeight: "1.5", color: "#555" }}>
              <li style={{ marginBottom: "10px" }}>
                <strong>Step 1:</strong> Select a city for the service area.
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Step 2:</strong> Search and select a zone from suggestions.
              </li>
              <li style={{ marginBottom: "10px" }}>
                <strong>Step 3:</strong> Adjust the range using the slider.
              </li>
              <li>
                <strong>Step 4:</strong> Click Save to add the zone.
              </li>
            </ul>
          </div>

          {/* Map */}
          <div
            style={{
              flex: "2",
              height: "375px",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          >
            <AdaptiveMap
              style={mapContainerStyle}
              center={markerPosition}
              zoom={13}
              onClick={handleMapClick}
              radiusMeters={range * 1000}
            >
              <Marker position={markerPosition} />
              <Circle
                center={markerPosition}
                radius={range * 1000}
                options={{
                  strokeColor: "red",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  fillColor: "red",
                  fillOpacity: 0.2,
                }}
              />
            </AdaptiveMap>
          </div>
        </div>

        {/* Range Slider */}
        <label>Select Range</label>
        <Slider
          value={range}
          onChange={handleRangeChange}
          min={0.1}
          max={50}
          step={0.1}
          valueLabelDisplay="auto"
          style={{ color: "#007bff", marginBottom: "10px" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>0.1 km</span>
          <span>{range.toFixed(1)} km</span>
          <span>50 km</span>
        </div>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: "20px", backgroundColor: "#00c853" }}
          onClick={handleSave}
        >
          <h4 style={{ color: "white", fontSize: "15px" }}>Save Service Area</h4>
        </Button>
      </div>
    </MDBox>
  );
}

export default AddServiceArea;

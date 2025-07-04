import React, { useState, useEffect } from "react";
import {
  TextField,
  Slider,
  Button,
} from "@mui/material";
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
  Autocomplete as GMapsAutocomplete,
} from "@react-google-maps/api";
import { useNavigate, useLocation } from "react-router-dom";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const libraries = ["places"];

function EditZone() {
  const location = useLocation();
  const { zone: initialZone } = location.state || {};
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [range, setRange] = useState(3.2);
  const [areaTitle, setAreaTitle] = useState("");
  const [zones, setZones] = useState([]);
  const [zoneTitle,setZoneTitle]=useState('')
  const [zone, setZone] = useState(null);
  const [markerPosition, setMarkerPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [id, setId] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDnXzpb-5ImxSpoTdmOWlAqBcjtnfw4QLU",
    libraries,
  });

  useEffect(() => {
    if (initialZone) {
      setId(initialZone._id);
      setAreaTitle(initialZone.address);
      setZoneTitle(initialZone.zoneTitle)
      if (initialZone.latitude && initialZone.longitude) {
        const coords = {
          lat: initialZone.latitude,
          lng: initialZone.longitude,
        };
        setMarkerPosition(coords);
        setLatitude(coords.lat);
        setLongitude(coords.lng);
      }
      if (initialZone.range) {
        setRange(initialZone.range / 1000);
      }
    }
  }, [initialZone]);

  useEffect(() => {
    async function fetchZones() {
      try {
        const res = await fetch("https://api.fivlia.in/getAviableCity");
        const data = await res.json();
        if (data && data.length > 0) {
          setZones(data);

          if (initialZone && initialZone.city) {
            const matchedZone = data.find(
              (z) => z.city.toLowerCase() === initialZone.city.toLowerCase()
            );
            if (matchedZone) {
              setZone(matchedZone);
              const coords = { lat: matchedZone.latitude, lng: matchedZone.longitude };
              setMarkerPosition(coords);
              setLatitude(coords.lat);
              setLongitude(coords.lng);
              return;
            }
          }

          const firstZone = data[0];
          setZone(firstZone);
          const coords = { lat: firstZone.latitude, lng: firstZone.longitude };
          setMarkerPosition(coords);
          setLatitude(coords.lat);
          setLongitude(coords.lng);
        }
      } catch (err) {
        console.error("Failed to fetch zones", err);
        alert("Failed to load zones from API.");
      }
    }
    fetchZones();
  }, [initialZone]);

  const handleRangeChange = (_, newValue) => setRange(newValue);

  const handleZoneChange = (event) => {
    const selectedZone = zones.find((z) => z._id === event.target.value);
    if (selectedZone) {
      const coords = { lat: selectedZone.latitude, lng: selectedZone.longitude };
      setZone(selectedZone);
      setMarkerPosition(coords);
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setAreaTitle("");
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || "";
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      return "";
    }
  };

  const updateZone = async () => {
    const dataToSave = {
      city: zone?.city,
      state: zone?.state,
      address: areaTitle,
      zoneTitle:zoneTitle,
      latitude,
      longitude,
      range: range * 1000,
    };

    try {
      const res = await fetch(`https://api.fivlia.in/updateZoneStatus/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        alert("Zone updated successfully!");
        navigate(-1);
      } else {
        alert("Failed to update zone");
      }
    } catch (error) {
      console.error("Error updating zone:", error);
      alert("Error updating zone.");
    }
  };

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2}>
      <div style={{ padding: "20px", maxWidth: "65%", margin: "0 auto", fontFamily: "Arial" }}>
        <h2 style={{ textAlign: "center", color: "green", marginBottom: "40px" }}>EDIT ZONE</h2>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>City</label>
          <select
            style={{ width: "70%" }}
            onChange={handleZoneChange}
            value={zone?._id || ""}
          >
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.city}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone Title</label>
          <input type="text" value={zoneTitle} placeholder="Enter Zone Title"
           style={{width:'70%'}}
           onChange={(e) => setZoneTitle(e.target.value)}
           />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
          <label>Zone Address</label>
          <div style={{ width: "70%" }}>
            <GMapsAutocomplete
              onLoad={(autocomplete) => {
                window.autocompleteInstance = autocomplete;
              }}
              onPlaceChanged={() => {
                if (window.autocompleteInstance) {
                  const place = window.autocompleteInstance.getPlace();
                  if (place.geometry) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const coords = { lat, lng };
                    setMarkerPosition(coords);
                    setLatitude(lat);
                    setLongitude(lng);
                    setAreaTitle(place.formatted_address || place.name);
                  }
                }
              }}
            >
              <TextField
                fullWidth
                placeholder="Search Zone Address"
                value={areaTitle}
                onChange={(e) => setAreaTitle(e.target.value)}
              />
            </GMapsAutocomplete>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "250px",
            border: "1px solid #ccc",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={markerPosition}
            zoom={13}
            onClick={async (e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              const coords = { lat, lng };
              setMarkerPosition(coords);
              setLatitude(lat);
              setLongitude(lng);
              const address = await reverseGeocode(lat, lng);
              setAreaTitle(address);
            }}
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
          </GoogleMap>
        </div>

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
          onClick={updateZone}
        >
          <h4 style={{ color: "white", fontSize: "15px" }}>Edit Service Area</h4>
        </Button>
      </div>
    </MDBox>
  );
}

export default EditZone;

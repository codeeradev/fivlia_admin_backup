import React, { useEffect, useRef, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import "./AddStore.css";
import { Button, Switch } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Marker, Circle } from "@react-google-maps/api"; // works for Ola via AdaptiveMap
import AdaptiveMap from "../../components/Maps/AdaptiveMap";
import { useMapsApi } from "../../hooks/useMapsApi";
import { startLoading, stopLoading } from "components/loader/appSlice";

function AddStore() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
 const { apiType } = useMapsApi();
  // Form states
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [markerPosition, setMarkerPosition] = useState({ lat: 29.1492, lng: 75.7217 });
  const [range, setRange] = useState(3);
  const [selectedZone, setSelectedZone] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [des, setDescription] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [cities, setCities] = useState([]);
  const [availableZones, setAvailableZones] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const dispatch = useDispatch();
  
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstance = useRef(null);

  const location = useLocation();
  const storedetails = location.state;
  const [id, setId] = useState('')

  useEffect(() => {
    if (storedetails && storedetails.store) {
      const zoneIds = Array.isArray(storedetails?.store?.zone)
        ? storedetails.store.zone.map((zone) => zone._id)
        : [];
      setId(storedetails.store._id);
      setStoreName(storedetails.store.storeName);
      setOwnerName(storedetails.store.ownerName);
      setPhone(storedetails.store.PhoneNumber);
      setEmail(storedetails.store.email || '');
      setPassword(storedetails.store.password);
      setSelectedCity(storedetails.store.city?._id);
      setSelectedZone(zoneIds);
      setLatitude(storedetails.store.Latitude);
      setLongitude(storedetails.store.Longitude);
      setDescription(storedetails.store.Description);
      setIsAuthorized(storedetails.store.Authorized_Store);
      setSelectedImage(storedetails.store.image);
      setSelectedCategory(storedetails.store.Category);
    if (storedetails.store.Latitude && storedetails.store.Longitude) {
      setMarkerPosition({
        lat: parseFloat(storedetails.store.Latitude),
        lng: parseFloat(storedetails.store.Longitude),
      });
    }
  }
  }, []);

  useEffect(() => {
    const getMainCategory = async () => {
      try {
        const data = await fetch("https://api.fivlia.in/getMainCategory");
        if (data.status === 200) {
          const result = await data.json();
          setMainCategories(result.result);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    const fetchCities = async () => {
      try {
        const res = await fetch("https://api.fivlia.in/getAllZone");
        const data = await res.json();
        if (data) {
          setCities(data);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    getMainCategory();
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const cityObj = cities.find((c) => c._id === selectedCity);
      if (cityObj && Array.isArray(cityObj.zones)) {
        setAvailableZones(cityObj.zones);
      } else {
        setAvailableZones([]);
      }
      setSelectedZone([]);
    } else {
      setAvailableZones([]);
      setSelectedZone([]);
    }
  }, [selectedCity, cities]);

 const handleMapClick = (e) => {
  let lat, lng;

  if (typeof e.lat === "number" && typeof e.lng === "number") {
    // Ola click
    lat = e.lat;
    lng = e.lng;
  } else if (e?.latLng) {
    // Google click fallback
    lat = e.latLng.lat();
    lng = e.latLng.lng();
  }

  if (lat && lng) {
    setMarkerPosition({ lat, lng });
    setLatitude(lat.toString());
    setLongitude(lng.toString());
  }
};

  const handleSwitchChange = (event) => {
    setIsAuthorized(event.target.checked);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 500 * 1024;
      if (file.size > maxSize) {
        alert("Image size must be less than 500KB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value && !selectedCategory.includes(value)) {
      setSelectedCategory((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  const handleRemoveCategory = (catId) => {
    setSelectedCategory((prev) => prev.filter((id) => id !== catId));
  };

  const handleZoneChange = (e) => {
    const value = e.target.value;
    if (value && !selectedZone.includes(value)) {
      setSelectedZone((prev) => [...prev, value]);
    }
    e.target.value = "";
  };

  const handleRemoveZone = (zoneId) => {
    setSelectedZone((prev) => prev.filter((id) => id !== zoneId));
  };

  const handleStore = async () => {
    if (!storeName || !ownerName || !phone || !email || !latitude || !longitude || !selectedCity) {
      alert("Please fill all required fields.");
      return;
    }

    if (isAuthorized && selectedCategory.length === 0) {
      alert("Please select at least one category for authorized store.");
      return;
    }

    if (selectedZone.length === 0) {
      alert("Please select at least one zone.");
      return;
    }

    try {
      const formData = new FormData();
      dispatch(startLoading());
      formData.append("storeName", storeName);
      formData.append("ownerName", ownerName);
      formData.append("PhoneNumber", phone);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("city", selectedCity);
      formData.append("zone", JSON.stringify(selectedZone));
      formData.append("Latitude", latitude);
      formData.append("Longitude", longitude);
      formData.append("Description", des);
      formData.append("isAuthorized", isAuthorized);
      formData.append("Category", JSON.stringify(selectedCategory));

if (selectedImage instanceof File) {
  formData.append("image", selectedImage);
}

      let response;
      if (storedetails && storedetails.store) {
        response = await fetch(`https://api.fivlia.in/storeEdit/${id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        formData.append("password", password);
        response = await fetch("https://api.fivlia.in/createStore", {
          method: "POST",
          body: formData,
        });
      }

      if (response.status === 201) {
        dispatch(stopLoading());
        alert("Store added successfully!");
        navigate(-1);
      } else if (response.status === 200) {
        dispatch(stopLoading());
        alert("Store Updated successfully!");
        navigate(-1);
      } else {
        const errorData = await response.json();
        dispatch(stopLoading());
        alert(`Error: ${errorData.message || "Failed to add store"}`);
      }
    } catch (error) {
      dispatch(stopLoading());
      alert("Error adding store: " + error.message);
    }
  };

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      {/* Store Details */}
      <div className="store-container">
        <div className="store-header">Store Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Store Name</label>
              <input
                type="text"
                placeholder="Enter Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Owner Name</label>
              <input
                type="text"
                placeholder="Enter Owner Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Store Phone Number</label>
              <input
                type="text"
                placeholder="Store Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Password</label>
              <input
                type="text"
                placeholder="Enter Store Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Select City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">---Select City---</option>
                {cities.length > 0 ? (
                  cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.city}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading cities...</option>
                )}
              </select>
            </div>
            <div className="store-input">
              <label>Select Zone</label>
              <select
                value=""
                onChange={handleZoneChange}
                style={{ width: "100%", padding: "8px" }}
              >
                <option value="">---Select Zone---</option>
                {availableZones.length > 0 ? (
                  availableZones.map((zone) => (
                    <option key={zone._id} value={zone._id}>
                      {zone.zoneTitle || zone.address || "Unnamed Zone"}
                    </option>
                  ))
                ) : (
                  <option disabled>
                    {selectedCity ? "No zones available for this city" : "Select a city first"}
                  </option>
                )}
              </select>
              {selectedZone.length > 0 && (
                <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedZone.map((zoneId) => {
                    const zone = availableZones.find((z) => z._id === zoneId);
                    if (!zone) return null;
                    return (
                      <span
                        key={zone._id}
                        style={{
                          backgroundColor: "#e0e0e0",
                          padding: "5px 10px",
                          borderRadius: "15px",
                          display: "flex",
                          alignItems: "center",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleRemoveZone(zone._id)}
                      >
                        {zone ? (zone.zoneTitle || zone.address || "Unnamed Zone") : zoneId}
                        <span style={{ marginLeft: "5px", color: "#ff0000", fontWeight: "bold" }}>
                          ×
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Latitude</label>
              <input type="text" value={latitude} readOnly />
            </div>
            <div className="store-input">
              <label>Longitude</label>
              <input type="text" value={longitude} readOnly />
            </div>
          </div>

           <div style={{ height: "400px", width: "100%" }}>
      <AdaptiveMap
        center={markerPosition}
        zoom={13}
        onClick={handleMapClick}
        radiusMeters={range * 1000}
      >
        <Marker position={markerPosition} />
        <Circle center={markerPosition} radius={range * 1000} />
      </AdaptiveMap>
    </div>

          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Description</label>
              <textarea
                placeholder="Type your text here..."
                rows={4}
                value={des}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="store-container">
        <div className="store-header">Category Selection</div>
        <div className="store-form" style={{ marginBottom: "30px" }}>
          <div className="store-row">
            <div className="store-input">
              <label>Authorized Store</label>
              <Switch
                checked={isAuthorized}
                onChange={handleSwitchChange}
                color="success"
              />
              <p>Status: {isAuthorized ? "Authorized Store" : "Not Authorized"}</p>
            </div>

            {isAuthorized && (
              <div className="store-input" style={{ flex: "1 1 100%" }}>
                <label>Select Category</label>
                <select
                  value=""
                  onChange={handleCategoryChange}
                  style={{ width: "100%", padding: "8px" }}
                >
                  <option value="">---Select Category---</option>
                  {mainCategories.length > 0 ? (
                    mainCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading categories...</option>
                  )}
                </select>

                {selectedCategory.length > 0 && (
                  <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {selectedCategory.map((catId) => {
                      const category = mainCategories.find((cat) => cat._id === catId);
                      return (
                        <span
                          key={catId}
                          style={{
                            backgroundColor: "#e0e0e0",
                            padding: "5px 10px",
                            borderRadius: "15px",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleRemoveCategory(catId)}
                        >
                          {category ? category.name : catId}
                          <span style={{ marginLeft: "5px", color: "#ff0000", fontWeight: "bold" }}>
                            ×
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="store-container">
        <div className="store-header">Gallery</div>
        <div className="store-form">
          <div className="store-input" style={{ flex: "1 1 100%" }}>
            <label>Choose Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {selectedImage && (
              <div style={{ textAlign: "center", marginTop: "10px" }}>
                <img
                  src={`${process.env.REACT_APP_IMAGE_LINK}${selectedImage}`}
                  alt="Preview"
                  style={{
                    width: "80%",
                    maxHeight: "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <Button
          variant="contained"
          style={{
            backgroundColor: "#00c853",
            color: "white",
            fontSize: "15px",
          }}
          onClick={handleStore}
        >
          SAVE
        </Button>

        <Button
          variant="contained"
          style={{
            backgroundColor: "#00c853",
            color: "white",
            fontSize: "15px",
          }}
          onClick={() => navigate(-1)}
        >
          BACK
        </Button>
      </div>
    </MDBox>
  );
}

export default AddStore;
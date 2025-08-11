import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import { startLoading, stopLoading } from "components/loader/appSlice";
import { useDispatch } from "react-redux";

function EditBanner() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const location = useLocation();

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null)
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [main, setMain] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [type, setType] = useState("");
  const [mainId, setMainId] = useState("");
  const [subId, setSubId] = useState("");
  const [subsubId, setSubsubId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const dispatch = useDispatch();
  // Load initial data from location.state and fetch locations & categories
  useEffect(() => {
    const data = location.state;
    if (data) {
      
      setId(data._id);
      setName(data.title);
      setSelectedCityId(data.city?._id || "");
      if (Array.isArray(data.zones)) {
        setZones(
          data.zones.map((z) => ({
            address: z.address,
            latitude: z.latitude,
            longitude: z.longitude,
            range: z.range
          }))
        );
      }
      setType(data.type2 || "");

      if (data.mainCategory && data.mainCategory._id) {
        setMainId(data.mainCategory._id);
      } else {
        setMainId("");
      }

      if (data.subCategory && data.subCategory._id) {
        setSubId(data.subCategory._id);
      } else {
        setSubId("");
      }

      if (data.subSubCategory && data.subSubCategory._id) {
        setSubsubId(data.subSubCategory._id);
      } else {
        setSubsubId("");
      }

      if (data.storeId) {
        setStoreId(data.storeId);
      } else {
        setStoreId("");
      }

      if (data.image) {
        setImage(data.image);
        setImagePreview(`${process.env.REACT_APP_IMAGE_LINK}${data.image}`);

      } else {
        setImage(null);
        setImagePreview(null)
      }
    }

    const fetchLocations = async () => {
      try {
        const res = await fetch("https://node-m8jb.onrender.com/getlocations");
        const data = await res.json();
        setLocations(data.result || []);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch("https://api.fivlia.in/getMainCategory");
        const data = await res.json();
        setMain(data.result || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchLocations();
    fetchCategories();
  }, [location.state]);

  useEffect(() => {
    if (!selectedCityId) {
      setZones([]);
      return;
    }

    const selectedCity = locations.find((loc) => loc._id === selectedCityId);
    if (selectedCity && Array.isArray(selectedCity.zones)) {
      const allZones = selectedCity.zones.map((zone) => ({
        address: zone.address,
        latitude: zone.latitude,
        longitude: zone.longitude,
        range: zone.range
      }));
      setZones(allZones);
    } else {
      setZones([]);
    }
  }, [selectedCityId, locations]);

  // Fetch stores when zones change
  useEffect(() => {
    const fetchStores = async () => {
      if (zones.length === 0) {
        setStores([]);
        setStoreId("");
        return;
      }

      try {
        const zoneAddresses = zones.map((zone) => zone.address);
        const res = await fetch("https://node-m8jb.onrender.com/getStoresByZone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zoneAddresses }),
        });
        const data = await res.json();
        const fetchedStores = data.result || [];
console.log('data.result',data.result)
        // Remove duplicates based on store ID
        const uniqueStores = Array.from(
          new Map(fetchedStores.map((store) => [store._id, store])).values()
        );

        setStores(uniqueStores);

        // Reset storeId if not in new stores list
        if (storeId && !uniqueStores.some((store) => store._id === storeId)) {
          setStoreId("");
        }
      } catch (err) {
        console.error("Error fetching stores:", err);
        setStores([]);
        setStoreId("");
      }
    };

    fetchStores();
  }, [zones, storeId]);

  // Image preview handler
  const ImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove zone handler
  const handleRemoveZone = (addressToRemove) => {
    setZones(zones.filter((zone) => zone.address !== addressToRemove));
  };

  // Shorten address for display
  const getShortAddress = (address) => {
    if (typeof address !== "string") return "";
    const parts = address.split(",");
    return parts.length > 1 ? `${parts[0]},${parts[1]}` : address;
  };

  // Handle banner save
  const handleBanner = async () => {
  if (!name || !type || !selectedCityId || zones.length === 0) {
    alert("Please fill all required fields.");
    return;
  }

  // Get the file input element and selected file
  const imageFile = document.querySelector('input[type="file"]').files[0];

  // If no new image file selected and no existing image, alert
  if (!imageFile && !image) {
    alert("Please select an image file.");
    return;
  }

  const formData = new FormData();
  dispatch(startLoading());
  formData.append("title", name);
  formData.append('city',selectedCityId)
  formData.append("type", type);
  formData.append("mainCategory", mainId);
  formData.append("subcategory", subId);
  formData.append("subSubCategory", subsubId);
  formData.append("storeId", storeId || "");
  formData.append("zones", JSON.stringify(zones));

  // If new image selected, append the new file
  if (imageFile) {
    formData.append("image", imageFile);
  } else if (image && typeof image === "string") {
    formData.append("existingImage", image);
  }

  try {
    const response = await fetch(`https://api.fivlia.in/admin/banner/${id}/status`, {
      method: "PATCH",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      dispatch(stopLoading());
      alert("✅ Banner Updated Successfully!");
      navigate(-1);
    } else {
      dispatch(stopLoading());
      console.error("Response error:", result);
      alert("Something went wrong: " + (result.message || "Server Error"));
    }
  } catch (error) {
    dispatch(stopLoading());
    console.error("Network or Server Error:", error);
    alert("Server Error. Please try again.");
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
      <div
        style={{
          width: "95%",
          margin: "0 auto",
          padding: "20px",
          borderRadius: "15px",
          border: "1px solid gray",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "green",
            fontWeight: "bold",
            marginBottom: "50px",
          }}
        >
          UPDATE BANNER
        </h2>

        {/* Name */}
        <div style={formRowStyle}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            placeholder="Enter Banner Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Image */}
        <div style={formRowStyle}>
          <label style={labelStyle}>Image</label>
          <div style={{ display: "flex", alignItems: "center", width: "50%" }}>
            <input
              type="file"
              onChange={ImagePreview}
              style={{ ...inputStyle, marginRight: "20px" }}
              accept="image/*"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                style={{
                  width: "238px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}
          </div>
        </div>

        {/* City */}
        <div style={formRowStyle}>
          <label style={labelStyle}>City</label>
          <select
            style={inputStyle}
            value={selectedCityId}
            onChange={(e) => {
              setSelectedCityId(e.target.value);
            }}
          >
            <option value="">-- Select City --</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.city}
              </option>
            ))}
          </select>
        </div>

        {/* Display Selected Zones */}
        {selectedCityId && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Selected Zones</label>
            <div style={{ width: "50%", marginRight: "20px" }}>
              {zones.length > 0 ? (
                <div style={tagsContainerStyle}>
                  {zones.map((zone, index) => (
                    <div
                      key={index}
                      style={{
                        ...tagStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title={`${zone.address} (Lat: ${zone.latitude}, Long: ${zone.longitude})`}
                    >
                      {getShortAddress(zone.address)}
                      <button
                        onClick={() => handleRemoveZone(zone.address)}
                        style={{
                          marginLeft: "8px",
                          border: "none",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "20px",
                          lineHeight: "1",
                          color: "red",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: "gray" }}>
                  No zones available for this city.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Store Selection (Only show if zones are selected) */}
        {zones.length > 0 && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Store</label>
            <select
              style={inputStyle}
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
            >
              <option value="">--Select Store--</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.name} ({getShortAddress(store.zoneAddress)})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Type */}
        <div style={formRowStyle}>
          <label style={labelStyle}>Type</label>
          <select
            style={inputStyle}
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setMainId("");
              setSubId("");
              setSubsubId("");
            }}
          >
            <option value="">--Select Type--</option>
            <option value="Category">Category</option>
            <option value="SubCategory">Sub-Category</option>
            <option value="Sub Sub-Category">Sub Sub-Category</option>
          </select>
        </div>

        {/* Category / SubCategory / SubSubCategory */}
        {type === "Category" && (
          <div style={formRowStyle}>
            <label style={labelStyle}>Select Category</label>
            <select
              style={{ ...inputStyle, marginRight: "30px" }}
              value={mainId}
              onChange={(e) => setMainId(e.target.value)}
            >
              <option value="">--Select Category--</option>
              {main.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {type === "SubCategory" && (
          <>
            <div style={formRowStyle}>
              <label style={labelStyle}>Main Category</label>
              <select
                style={{ ...inputStyle, marginRight: "30px" }}
                value={mainId}
                onChange={(e) => {
                  setMainId(e.target.value);
                  setSubId("");
                }}
              >
                <option value="">--Select Main Category--</option>
                {main.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {mainId && (
              <div style={formRowStyle}>
                <label style={labelStyle}>Sub Category</label>
                <select
                  style={{ ...inputStyle, marginRight: "25px" }}
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                >
                  <option value="">--Select Sub Category--</option>
                  {(main.find((cat) => cat._id === mainId)?.subcat || []).map(
                    (sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </>
        )}

        {type === "Sub Sub-Category" && (
          <>
            <div style={formRowStyle}>
              <label style={labelStyle}>Main Category</label>
              <select
                style={{ ...inputStyle, marginRight: "30px" }}
                value={mainId}
                onChange={(e) => {
                  setMainId(e.target.value);
                  setSubId("");
                }}
              >
                <option value="">--Select Main Category--</option>
                {main.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {mainId && (
              <div style={formRowStyle}>
                <label style={labelStyle}>Sub Category</label>
                <select
                  style={{ ...inputStyle, marginRight: "30px" }}
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                >
                  <option value="">--Select Sub Category--</option>
                  {(main.find((cat) => cat._id === mainId)?.subcat || []).map(
                    (sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {subId && (
              <div style={formRowStyle}>
                <label style={labelStyle}>Sub Sub Category</label>
                <select
                  style={{ ...inputStyle, marginRight: "40px" }}
                  value={subsubId}
                  onChange={(e) => setSubsubId(e.target.value)}
                >
                  <option value="">--Select Sub Sub Category--</option>
                  {(
                    main
                      .find((cat) => cat._id === mainId)
                      ?.subcat.find((sub) => sub._id === subId)?.subsubcat || []
                  ).map((subsub) => (
                    <option key={subsub._id} value={subsub._id}>
                      {subsub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Submit Buttons */}
        <div
          style={{
            display: "flex",
            gap: "50px",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "50px",
          }}
        >
          <Button
            variant="contained"
            style={{ backgroundColor: "#00c853", color: "white" }}
            onClick={handleBanner}
          >
            SAVE
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "#00c853", color: "white" }}
            onClick={() => navigate(-1)}
          >
            BACK
          </Button>
        </div>
      </div>
    </MDBox>
  );
}

const formRowStyle = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  marginBottom: "25px",
};

const labelStyle = {
  fontWeight: "500",
};

const inputStyle = {
  width: "50%",
  height: "45px",
  padding: "8px",
  borderRadius: "10px",
  border: "0.5px solid black",
  backgroundColor: "white",
};

const tagsContainerStyle = {
  marginTop: "10px",
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const tagStyle = {
  backgroundColor: "white",
  padding: "6px 10px",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "14px",
  color: "black",
  boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
};

export default EditBanner;

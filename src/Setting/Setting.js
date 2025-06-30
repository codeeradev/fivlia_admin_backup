import React, { useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { Button, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Setting() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Owner_Name: "",
    Owner_Email: "",
    Owner_Number: "",
    Store_Number: "",
    Password: "",
    Platform_Fee: "",
    GST_Number: "",
    Description: "",
    Delivery_Charges: "",
    DeliveryStatus: "",
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
  try {
    // Filter out empty fields from formData
    const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== "") acc[key] = value;
      return acc;
    }, {});

    const response = await fetch("http://localhost:5000/adminSetting", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filteredData),
    });

    const result = await response.json();
    if (response.ok) {
      alert("Settings updated successfully");
    } else {
      alert(result.message || "Update failed");
    }
  } catch (error) {
    console.error("Update error =>", error);
    alert("Something went wrong");
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
        <div className="store-header">Personal Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Owner Name</label>
              <input
                type="text"
                placeholder="Enter Owner Name"
                value={formData.Owner_Name}
                onChange={(e) => handleInputChange("Owner_Name", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Owner Email</label>
              <input
                type="email"
                placeholder="Enter Owner Email"
                value={formData.Owner_Email}
                onChange={(e) => handleInputChange("Owner_Email", e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Mobile Number</label>
              <input
                type="number"
                placeholder="Owner Mobile Number"
                value={formData.Owner_Number}
                onChange={(e) => handleInputChange("Owner_Number", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Store Phone Number"
                value={formData.Store_Number}
                onChange={(e) => handleInputChange("Store_Number", e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={formData.Password}
                onChange={(e) => handleInputChange("Password", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Enter Password Again"
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input">
              <label>Platform Fee</label>
              <input
                type="text"
                placeholder="Enter Platform Fee"
                value={formData.Platform_Fee}
                onChange={(e) => handleInputChange("Platform_Fee", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>GST Certificate Number</label>
              <input
                type="text"
                placeholder="Enter GST Number"
                value={formData.GST_Number}
                onChange={(e) => handleInputChange("GST_Number", e.target.value)}
              />
            </div>
          </div>

          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Description</label>
              <textarea
                placeholder="Type your text here..."
                rows={4}
                value={formData.Description}
                onChange={(e) => handleInputChange("Description", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Charges Section */}
      <div className="store-container">
        <div className="store-header">Delivery Charges</div>
        <div className="store-form">
          <div className="store-input" style={{ flex: "1 1 100%" }}>
            <label>Delivery Charge</label>
            <input
              type="number"
              placeholder="5"
              value={formData.Delivery_Charges}
              onChange={(e) => handleInputChange("Delivery_Charges", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="contained"
          style={{ backgroundColor: '#00c853', color: 'white', fontSize: '15px' }}
          onClick={handleSubmit}
        >
          SAVE
        </Button>

        <Button
          variant="contained"
          style={{ backgroundColor: '#00c853', color: 'white', fontSize: '15px' }}
          onClick={() => navigate(-1)}
        >
          BACK
        </Button>
      </div>
    </MDBox>
  );
}

export default Setting;

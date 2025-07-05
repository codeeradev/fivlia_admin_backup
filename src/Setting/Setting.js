import React, { useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { Button, Switch } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";

function Setting() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    Owner_Name: "",
    Owner_Email: "",
    Owner_Number: "",
    GST_Number: "",
    Platform_Fee: "",
    Description: "",
    Delivery_Charges: "",
    codLimit: "",
    PaymentGatewayStatus: false,
    RazorPayKey_test: "",
    RazorPayKey_live: "",
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    dispatch(startLoading());
    try {
      const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== "") acc[key] = value;
        return acc;
      }, {});

      // Group RazorPayKey
      if (filteredData.RazorPayKey_test || filteredData.RazorPayKey_live) {
        filteredData.RazorPayKey = {
          test: filteredData.RazorPayKey_test || "",
          live: filteredData.RazorPayKey_live || "",
        };
        delete filteredData.RazorPayKey_test;
        delete filteredData.RazorPayKey_live;
      }

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
        navigate(-1);
      } else {
        alert(result.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error =>", error);
      alert("Something went wrong");
    } finally {
      dispatch(stopLoading());
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
      <div className="store-container">
        <div className="store-header">Personal Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Owner Name</label>
              <input
                type="text"
                value={formData.Owner_Name}
                onChange={(e) => handleInputChange("Owner_Name", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Owner Email</label>
              <input
                type="email"
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
                value={formData.Owner_Number}
                onChange={(e) => handleInputChange("Owner_Number", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>GST Number</label>
              <input
                type="text"
                value={formData.GST_Number}
                onChange={(e) => handleInputChange("GST_Number", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input">
              <label>Platform Fee</label>
              <input
                type="text"
                value={formData.Platform_Fee}
                onChange={(e) => handleInputChange("Platform_Fee", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Description</label>
              <textarea
                rows={4}
                value={formData.Description}
                onChange={(e) => handleInputChange("Description", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Delivery Details</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Delivery Charges</label>
              <input
                type="number"
                value={formData.Delivery_Charges}
                onChange={(e) => handleInputChange("Delivery_Charges", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>COD Limit</label>
              <input
                type="number"
                value={formData.codLimit}
                onChange={(e) => handleInputChange("codLimit", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Payment Gateway</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Enable Payment Gateway</label>
              <Switch
                checked={formData.PaymentGatewayStatus}
                onChange={(e) => handleInputChange("PaymentGatewayStatus", e.target.checked)}
              />
            </div>
            <div className="store-input">
              <label>Razorpay Test Key</label>
              <input
                type="text"
                value={formData.RazorPayKey_test}
                onChange={(e) => handleInputChange("RazorPayKey_test", e.target.value)}
              />
            </div>
            <div className="store-input">
              <label>Razorpay Live Key</label>
              <input
                type="text"
                value={formData.RazorPayKey_live}
                onChange={(e) => handleInputChange("RazorPayKey_live", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "30px", alignItems: "center", justifyContent: "center" }}>
        <Button
          variant="contained"
          style={{ backgroundColor: "#00c853", color: "white", fontSize: "15px" }}
          onClick={handleSubmit}
        >
          SAVE
        </Button>
        <Button
          variant="contained"
          style={{ backgroundColor: "#00c853", color: "white", fontSize: "15px" }}
          onClick={() => navigate(-1)}
        >
          BACK
        </Button>
      </div>
    </MDBox>
  );
}

export default Setting;
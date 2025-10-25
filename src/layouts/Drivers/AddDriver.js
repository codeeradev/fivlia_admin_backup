import React, { useState,useEffect } from "react";
import { Button, TextField, Switch, FormControlLabel } from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";

function AddDriver() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [driverName, setDriverName] = useState("");
  const [status, setStatus] = useState(true);
  const [image, setImage] = useState(null);
  const [mobileNo, setMobileNo] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [policeVerification, setPoliceVerification] = useState(null);
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [dlFront, setDlFront] = useState(null);
  const [dlBack, setDlBack] = useState(null);
  const dispatch = useDispatch();


  const handleFileChange = (e, setter) => {
    setter(e.target.files[0]);
  };

  useEffect(() => {
  const fetchCities = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getCity`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setCities(data);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    }
  };

  fetchCities();
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || !policeVerification || !aadharFront || !aadharBack || !dlFront || !dlBack) {
      alert("Please upload all required files");
      return;
    }
dispatch(startLoading());
    const formData = new FormData();
    
    formData.append("driverName", driverName);
    formData.append("status", status ? "true" : "false");
    formData.append("image", image);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("Police_Verification_Copy", policeVerification);
formData.append("aadharCard", aadharFront); // index 0
formData.append("aadharCard", aadharBack);  // index 1

formData.append("drivingLicence", dlFront); // index 0
formData.append("drivingLicence", dlBack);  
    formData.append(
      "address",
      JSON.stringify({
        mobileNo,
        locality,
        city,
      })
    );

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/driver`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        dispatch(stopLoading());
        alert("Driver added successfully");
        navigate("/drivers");
      } else {
        dispatch(stopLoading());
        alert(result.message || "Failed to add driver");
      }
    } catch (err) {
      dispatch(stopLoading());
      console.error("Upload error:", err);
      alert("Something went wrong!");
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={3}>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 600,
          margin: "auto",
          background: "#fff",
          padding: 30,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#00c853" }}>Add Driver</h2>

        <TextField
          label="Driver Name"
          fullWidth
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Email"
          fullWidth
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Password"
          fullWidth
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
        />

        <FormControlLabel
          control={
            <Switch
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              color="primary"
            />
          }
          label="Status"
        />

        <TextField
          label="Mobile Number"
          fullWidth
          value={mobileNo}
          onChange={(e) => setMobileNo(e.target.value)}
          margin="normal"
          required
        />

        <TextField
          label="Locality"
          fullWidth
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          margin="normal"
          required
        />

<TextField
  select
  label=""
  fullWidth
  value={city}
  onChange={(e) => setCity(e.target.value)}
  margin="normal"
  required
  SelectProps={{ native: true }}
>
  <option value="">-- Select City --</option>
  {cities.map((c, index) => (
    <option key={index} value={c.city}>
      {c.city}
    </option>
  ))}
</TextField>


        <div style={{ margin: "20px 0" }}>
          <label>Upload Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setImage)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Police Verification Copy:</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileChange(e, setPoliceVerification)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Aadhar Card (Front):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setAadharFront)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Aadhar Card (Back):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setAadharBack)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Driving License (Front):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setDlFront)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ margin: "20px 0" }}>
          <label>Upload Driving License (Back):</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, setDlBack)}
            required
            style={{ marginTop: 10, display: "block" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            style={{ minWidth: 100 }}
          >
            Submit
          </Button>
          <Button
            variant="contained"
            style={{ backgroundColor: "gray", color: "white", minWidth: 100 }}
            onClick={() => navigate("/drivers")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </MDBox>
  );
}

export default AddDriver;
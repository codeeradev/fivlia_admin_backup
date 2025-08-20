import React, { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { Button, Switch, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import { Paper, Grid, Typography } from "@mui/material";

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
    minPrice: "",
    maxPrice: "",
    minWithdrawal: "", 
    PaymentGatewayStatus: false,
    activeGateway: "None", // Tracks the selected gateway (Razorpay, PhonePe, or None)
    activeMode: "", // Tracks the selected mode (test or live)
    RazorPayKey_test: "",
    RazorPayKey_live: "",
    RazorPayKey_secret: "",
    PhonePe_test: "",
    PhonePe_live: "",
    PhonePe_secret: "",
    Map_Api: {
      google: { key: "", status: false },
      apple: { key: "", status: false },
      ola: { key: "", status: false }
    },
    Auth: [
      {
        firebase: { status: false },
        whatsApp: { appKey: "", authKey: "", status: false }
      }
    ],
    imageLink: "",
  });

  // Fetch settings data on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      dispatch(startLoading());
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getSettings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        if (response.ok && result.settings) {
          // Determine active gateway and mode based on available keys
          const razorpayTest = result.settings.PaymentGateways?.RazorPayKey?.test || "";
          const razorpayLive = result.settings.PaymentGateways?.RazorPayKey?.live || "";
          const phonepeTest = result.settings.PaymentGateways?.PhonePe?.test || "";
          const phonepeLive = result.settings.PaymentGateways?.PhonePe?.live || "";
          let activeGateway = "None";
          let activeMode = "";
          
          if (razorpayTest) {
            activeGateway = "Razorpay";
            activeMode = "test";
          } else if (razorpayLive) {
            activeGateway = "Razorpay";
            activeMode = "live";
          } else if (phonepeTest) {
            activeGateway = "PhonePe";
            activeMode = "test";
          } else if (phonepeLive) {
            activeGateway = "PhonePe";
            activeMode = "live";
          }

          const mapApi = result.settings.Map_Api?.[0] || {
            google: { api_key: "", status: false },
            apple: { api_key: "", status: false },
            ola: { api_key: "", status: false }
          };

          setFormData({
            Owner_Name: result.settings.Owner_Name || "",
            Owner_Email: result.settings.Owner_Email || "",
            Owner_Number: result.settings.Owner_Number || "",
            GST_Number: result.settings.GST_Number || "",
            Platform_Fee: result.settings.Platform_Fee || "",
            Description: result.settings.Description || "",
            Delivery_Charges: result.settings.Delivery_Charges || "",
            codLimit: result.settings.codLimit || "",
            minPrice: result.settings.minPrice || "",
            maxPrice: result.settings.maxPrice || "",
            minWithdrawal: result.settings.minWithdrawal || "",
            PaymentGatewayStatus: result.settings.PaymentGatewayStatus || false,
            activeGateway,
            activeMode,
            RazorPayKey_test: razorpayTest,
            RazorPayKey_live: razorpayLive,
            RazorPayKey_secret: result.settings.PaymentGateways?.RazorPayKey?.secretKey || "",
            PhonePe_test: phonepeTest,
            PhonePe_live: phonepeLive,
            PhonePe_secret: result.settings.PaymentGateways?.PhonePe?.secretKey || "",
            Map_Api: {
              google: { api_key: mapApi.google?.api_key || "", status: mapApi.google?.status || false },
              apple: { api_key: mapApi.apple?.api_key || "", status: mapApi.apple?.status || false },
              ola: { api_key: mapApi.ola?.api_key || "", status: mapApi.ola?.status || false }
            },
            Auth: result.settings.Auth && result.settings.Auth.length > 0
              ? result.settings.Auth
              : [
                  {
                    firebase: { status: false },
                    whatsApp: { appKey: "", authKey: "", status: false }
                  }
                ],
            imageLink: result.settings.imageLink || "",
          });
        } else {
          dispatch(stopLoading());
          alert(result.message || "Failed to fetch settings");
        }
      } catch (error) {
        dispatch(stopLoading());
        console.error("Fetch settings error =>", error);
        alert("Something went wrong while fetching settings");
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchSettings();
  }, [dispatch]);

const handleInputChange = (field, value) => {
  setFormData(prevFormData => ({
    ...prevFormData,
    [field]: value,
  }));
};

  const handleGatewayChange = (gateway) => {
    setFormData((prev) => ({
      ...prev,
      activeGateway: gateway,
      activeMode: "",
    }));
  };

  const handleModeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      activeMode: mode,
      // Reset the non-selected mode's key
    }));
  };

  const handleMapApiKeyChange = (provider, value) => {
    setFormData((prev) => ({
      ...prev,
      Map_Api: {
        ...prev.Map_Api,
        [provider]: { ...prev.Map_Api[provider], api_key: value }
      }
    }));
  };

  const handleMapApiStatusChange = (provider) => {
    setFormData((prev) => ({
      ...prev,
      Map_Api: {
        google: { ...prev.Map_Api.google, status: provider === "google" },
        apple: { ...prev.Map_Api.apple, status: provider === "apple" },
        ola: { ...prev.Map_Api.ola, status: provider === "ola" }
      }
    }));
  };

  const handleSubmit = async () => {
    dispatch(startLoading());
    try {
      const filteredData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== "" && key !== "activeGateway" && key !== "activeMode") acc[key] = value;
        return acc;
      }, {});

      // Structure PaymentGateways to send only the active gateway's selected mode key
      filteredData.PaymentGateways = {};
       if (formData.activeGateway === "Razorpay") {
          filteredData.PaymentGateways.RazorPayKey = {
            test: formData.RazorPayKey_test || "",
            live: formData.RazorPayKey_live || "",
            status: true,
            secretKey: formData.RazorPayKey_secret || "",
            activeMode: formData.activeMode
          };
          filteredData.PaymentGateways.PhonePe = {
            test: formData.PhonePe_test || "",
            live: formData.PhonePe_live || "",
            status: false,
            secretKey: ""
          };
        } else if (formData.activeGateway === "PhonePe") {
          filteredData.PaymentGateways.PhonePe = {
            test: formData.PhonePe_test || "",
            live: formData.PhonePe_live || "",
            status: true,
            secretKey: formData.PhonePe_secret || "",
            activeMode: formData.activeMode
          };
          filteredData.PaymentGateways.RazorPayKey = {
            test: formData.RazorPayKey_test || "",
            live: formData.RazorPayKey_live || "",
            status: false,
            secretKey: ""
          };
         } else {
          filteredData.PaymentGateways.RazorPayKey = {
            test: formData.RazorPayKey_test || "",
            live: formData.RazorPayKey_live || "",
            status: false,
            secretKey: ""
          };
          filteredData.PaymentGateways.PhonePe = {
            test: formData.PhonePe_test || "",
            live: formData.PhonePe_live || "",
            status: false,
            secretKey: ""
          };
         }


      const mapApi = formData.Map_Api;
      filteredData.Map_Api = [
        {
          google: { api_key: mapApi.google.api_key, status: mapApi.google.status },
          apple: { api_key: mapApi.apple.api_key, status: mapApi.apple.status },
          ola: { api_key: mapApi.ola.api_key, status: mapApi.ola.status }
        }
      ];

      // Add Auth to payload
      filteredData.Auth = formData.Auth;

      // Remove temporary fields
      delete filteredData.RazorPayKey_test;
      delete filteredData.RazorPayKey_live;
      delete filteredData.PhonePe_test;
      delete filteredData.PhonePe_live;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/adminSetting`, {
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
              <label>Platform Fee(%)</label>
              <input
                type="text"
                value={formData.Platform_Fee}
                onChange={(e) => handleInputChange("Platform_Fee", e.target.value)}
              />
            </div>
          </div>
          <div className="store-row">
            <div className="store-input" style={{ flex: "1 1 100%" }}>
              <label>Image Link</label>
              <input
                type="text"
                value={formData.imageLink}
                onChange={(e) => handleInputChange("imageLink", e.target.value)}
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
            <div className="store-input">
              <label>Minimum Item Price</label>
              <input
                type="number"
                value={formData.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.targnpet.value)}
              />
            </div>
            <div className="store-input">
              <label>Maximum Item Price</label>
              <input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
              />
            </div>
            <div className="store-input">
            <label>Minimum Withdrawal</label>
            <input
              type="number"
              value={formData.minWithdrawal}
              onChange={(e) => handleInputChange("minWithdrawal", e.target.value)}
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
          </div>
          <div className="store-row">
            <FormControl component="fieldset">
              <FormLabel component="legend">Select Payment Gateway</FormLabel>
              <RadioGroup
                row
                value={formData.activeGateway}
                onChange={(e) => handleGatewayChange(e.target.value)}
              >
                <FormControlLabel value="Razorpay" control={<Radio />} label="Razorpay" />
                <FormControlLabel value="PhonePe" control={<Radio />} label="PhonePe" />
              </RadioGroup>
            </FormControl>
          </div>
          {(formData.activeGateway === "Razorpay" || formData.activeGateway === "PhonePe") && (
            <div className="store-row">
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Mode</FormLabel>
                <RadioGroup
                  row
                  value={formData.activeMode}
                  onChange={(e) => handleModeChange(e.target.value)}
                >
                  <FormControlLabel value="test" control={<Radio />} label="Test" />
                  <FormControlLabel value="live" control={<Radio />} label="Live" />
                </RadioGroup>
              </FormControl>
            </div>
          )}
          {formData.activeGateway === "Razorpay" && formData.activeMode && (
  <>
    <div className="store-row">
      <div className="store-input">
        <label>{`Razorpay ${formData.activeMode === "test" ? "Test" : "Live"} Key`}</label>
        <input
          type="text"
          value={formData.activeMode === "test" ? formData.RazorPayKey_test : formData.RazorPayKey_live}
          onChange={(e) =>
            handleInputChange(
              formData.activeMode === "test" ? "RazorPayKey_test" : "RazorPayKey_live",
              e.target.value
            )
          }
        />
      </div>
    </div>
    <div className="store-row">
      <div className="store-input">
        <label>{`Razorpay ${formData.activeMode === "test" ? "Test" : "Live"} Secret Key`}</label>
        <input
          type="text"
          value={formData.RazorPayKey_secret}
          onChange={(e) => handleInputChange("RazorPayKey_secret", e.target.value)}
        />
      </div>
    </div>
  </>
)}

{formData.activeGateway === "PhonePe" && formData.activeMode && (
  <>
    <div className="store-row">
      <div className="store-input">
        <label>{`PhonePe ${formData.activeMode === "test" ? "Test" : "Live"} Key`}</label>
        <input
          type="text"
          value={formData.activeMode === "test" ? formData.PhonePe_test : formData.PhonePe_live}
          onChange={(e) =>
            handleInputChange(
              formData.activeMode === "test" ? "PhonePe_test" : "PhonePe_live",
              e.target.value
            )
          }
        />
      </div>
    </div>
    <div className="store-row">
      <div className="store-input">
        <label>{`PhonePe ${formData.activeMode === "test" ? "Test" : "Live"} Secret Key`}</label>
        <input
          type="text"
          value={formData.PhonePe_secret}
          onChange={(e) => handleInputChange("PhonePe_secret", e.target.value)}
        />
      </div>
    </div>
  </>
)}

        </div>
      </div>

      <div className="store-container">
        <div className="store-header">Map API Keys</div>
        <div className="store-form">
          <RadioGroup
            row
            name="mapApiStatus"
            value={["google", "apple", "ola"].find((p) => formData.Map_Api[p].status) || ""}
            onChange={(e) => handleMapApiStatusChange(e.target.value)}
          >
            {["google", "apple", "ola"].map((provider) => (
              <Paper
                key={provider}
                elevation={2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px",
                  marginBottom: "16px",
                  width: "100%",
                  gap: "16px",
                }}
              >
                <FormControlLabel
                  value={provider}
                  control={<Radio color="primary" />}
                  label={
                    <Typography variant="subtitle1" style={{ textTransform: "capitalize", fontWeight: 600 }}>
                      {provider}
                    </Typography>
                  }
                  style={{ marginRight: "24px" }}
                />
                <input
                  type="text"
                  placeholder={`Enter ${provider} API Key`}
                  value={formData.Map_Api[provider].api_key}
                  onChange={(e) => handleMapApiKeyChange(provider, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "15px",
                  }}
                />
                {formData.Map_Api[provider].status && (
                  <span style={{ color: "#00c853", fontWeight: 500, marginLeft: 12 }}>
                    (Active)
                  </span>
                )}
              </Paper>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Auth Section */}
      <div className="store-container">
        <div className="store-header">Authentication</div>
        <div className="store-form">
          <div className="store-row">
            <div className="store-input">
              <label>Firebase Status</label>
              <Switch
                checked={formData.Auth[0].firebase.status}
                disabled={formData.Auth[0].whatsApp.status}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    Auth: [{
                      ...prev.Auth[0],
                      firebase: { status: e.target.checked },
                      whatsApp: { ...prev.Auth[0].whatsApp, status: e.target.checked ? false : prev.Auth[0].whatsApp.status }
                    }]
                  }))
                }
              />
            </div>
            <div className="store-input">
              <label>WhatsApp App Key</label>
              <input
                type="text"
                value={formData.Auth[0].whatsApp.appKey}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    Auth: [{
                      ...prev.Auth[0],
                      whatsApp: { ...prev.Auth[0].whatsApp, appKey: e.target.value }
                    }]
                  }))
                }
              />
            </div>
            <div className="store-input">
              <label>WhatsApp Auth Key</label>
              <input
                type="text"
                value={formData.Auth[0].whatsApp.authKey}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    Auth: [{
                      ...prev.Auth[0],
                      whatsApp: { ...prev.Auth[0].whatsApp, authKey: e.target.value }
                    }]
                  }))
                }
              />
            </div>
            <div className="store-input">
              <label>WhatsApp Status</label>
              <Switch
                checked={formData.Auth[0].whatsApp.status}
                disabled={formData.Auth[0].firebase.status}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    Auth: [{
                      ...prev.Auth[0],
                      firebase: { status: e.target.checked ? false : prev.Auth[0].firebase.status },
                      whatsApp: { ...prev.Auth[0].whatsApp, status: e.target.checked }
                    }]
                  }))
                }
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
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  TextField,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MDBox from "components/MDBox";
import { showAlert } from "components/commonFunction/alertsLoader";

const OrderSetting = ({ miniSidenav }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm")); // <=600px
  const isMd = useMediaQuery(theme.breakpoints.down("md")); // <=900px

  const [formData, setFormData] = useState({
    minPrice: 0,
    maxPrice: 0,
    minWithdrawal: 0,
    freeDeliveryLimit: 0,
    minimumOrderCancelTime: 0,
    codLimit: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch current settings
  const fetchSettings = async () => {
    setLoading(true);
    showAlert("loading", "Fetching order settings...");
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/getSmsType`
      );

      if (data.setting && data.setting[0]) {
        const s = data.setting[0];
        setFormData({
          minPrice: Number(s.minPrice ?? 0),
          maxPrice: Number(s.maxPrice ?? 0),
          minWithdrawal: Number(s.minWithdrawal ?? 0),
          freeDeliveryLimit: Number(s.freeDeliveryLimit ?? 0),
          minimumOrderCancelTime: Number(s.minimumOrderCancelTime ?? 0),
          codLimit: Number(s.codLimit ?? 0),
        });
        showAlert("info", "", 1);
      } else {
        showAlert("info", "No settings found, please configure first.");
      }
    } catch (err) {
      console.error("Fetch settings failed:", err);
      showAlert("error", "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value === "" ? 0 : Number(value),
  }));
};


  // Submit updated settings
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    showAlert("loading", "Saving settings...");

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/adminSetting`, formData);
      showAlert("success", "Settings updated successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      showAlert("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MDBox
      // responsive left margin: 0 on xs, small margin on sm, depends on miniSidenav on md+
      sx={{
        ml: {
          xs: 0,
          sm: 0,
          md: miniSidenav ? "80px" : "250px",
        },
        p: { xs: 1, sm: 2 },
        marginTop: "30px",
      }}
    >
      <Card
        sx={{
          maxWidth: 1100,
          margin: "0 auto",
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          boxShadow: 3,
          transition: "all 0.3s ease",
        }}
      >
        <Typography
          variant={isSm ? "h6" : "h5"}
          fontWeight="bold"
          mb={3}
          sx={{ color: (theme) => theme.palette.text.primary, textAlign: { xs: "center", md: "left" } }}
        >
          Order Settings
        </Typography>

        {loading ? (
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="160px"
            sx={{ py: 4 }}
          >
            <CircularProgress color="primary" />
          </MDBox>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              {/* Minimum Price */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Price"
                  name="minPrice"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.minPrice}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Maximum Price */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Maximum Price"
                  name="maxPrice"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.maxPrice}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Minimum Withdrawal */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Minimum Withdrawal"
                  name="minWithdrawal"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.minWithdrawal}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Free Delivery Limit */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Free Delivery Limit"
                  name="freeDeliveryLimit"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.freeDeliveryLimit}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>

              {/* Auto Cancel Time */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Order Auto-Cancel Time (Minutes)"
                  name="minimumOrderCancelTime"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.minimumOrderCancelTime}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Time (in minutes) after which an unassigned order is auto-cancelled"
                />
              </Grid>

              {/* COD Limit */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="COD Limit"
                  name="codLimit"
                  type="number"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={formData.codLimit}
                  onChange={handleChange}
                  variant="outlined"
                  helperText="Maximum allowed cash-on-delivery amount"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: isSm ? "stretch" : "center", mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={saving}
                  fullWidth={isSm} // full width on small screens
                  sx={{
                    px: { xs: 2, sm: 5 },
                    py: 1.1,
                    borderRadius: 2,
                    fontWeight: 600,
                    color: "#fff",
                    textTransform: "none",
                    maxWidth: isSm ? "100%" : 360,
                    width: isSm ? "100%" : "auto",
                    transition: "all 0.2s ease",
                  }}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Card>
    </MDBox>
  );
};

export default OrderSetting;

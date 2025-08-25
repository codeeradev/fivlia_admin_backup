import React, { useState, useEffect, useCallback } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Switch,
  TextField,
  MenuItem,
  Box,
  Typography,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";

export default function SetCommission() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [openRows, setOpenRows] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Fetch main categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/getMainCategory?page=1`);
        if (res.ok) {
          const result = await res.json();
          setMainCategories(result.result || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Fetch subcategories when a main category is selected
  const fetchSubCategories = async (mainCatId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/categories?id=${mainCatId}`);
      if (!res.ok) return;
      const result = await res.json();

      const subs = (result.category?.subCategories || []).map((sub) => {
        // Try different possible ID field names
        const subId = sub._id || sub.id || sub.subCategoryId || sub.subcategoryId;
        
        return {
          _id: subId,
          name: sub.name,
          status: sub.status ?? true,
          commission: Number(sub.commission) || 0,
          subSubCategories: (sub.subSubCategories || sub.subsubcategories || sub.subSubCat || []).map((ssc) => {
            const sscId = ssc._id || ssc.id || ssc.subSubCategoryId || ssc.subsubcategoryId;
            console.log('Sub-sub category ID found:', sscId, 'from ssc:', ssc);
            
            return {
              _id: sscId,
              name: ssc.name,
              commission: Number(ssc.commission) || 0,
            };
          }),
        };
      });

      setSubCategories(subs);
      setOpenRows({});
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle public/private status
  const handleToggle = useCallback((subId) => {
    setSubCategories((prev) => {
      const updated = prev.map((s) =>
        s._id === subId ? { ...s, status: !s.status } : s
      );
      const toggled = updated.find((s) => s._id === subId);

      (async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/setCommison`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              id: subId, 
              commison: toggled.status ? 1 : 0, 
              level: 'sub' 
            }),
          });
          if (res.ok) {
            const result = await res.json();
            console.log('Status updated successfully:', result);
            showSnack("Status updated");
          } else {
            const error = await res.json();
            console.error('Failed to update status:', error);
            showSnack("Failed to update status", "error");
          }
        } catch (e) {
          console.error('Error updating status:', e);
          showSnack("Failed to update status", "error");
        }
      })();

      return updated;
    });
  }, []);

  // Change commission for sub-category
  const handleSubCommissionChange = useCallback((subId, value) => {
    setSubCategories((prev) =>
      prev.map((s) =>
        s._id === subId ? { ...s, commission: Math.max(0, Number(value) || 0) } : s
      )
    );
  }, []);

  // Change commission for sub-sub-category
  const handleSSCCommissionChange = useCallback((subId, sscId, value) => {
    setSubCategories((prev) =>
      prev.map((s) =>
        s._id !== subId
          ? s
          : {
              ...s,
              subSubCategories: s.subSubCategories.map((ssc) =>
                ssc._id === sscId
                  ? { ...ssc, commission: Math.max(0, Number(value) || 0) }
                  : ssc
              ),
            }
      )
    );
  }, []);

  // Save commission (sub or sub-sub)
  const saveCommission = async (id, commission, level) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/setCommison`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: id, 
          commison: commission, 
          level: level 
        }),
      });
      
      
      if (res.ok) {
        const result = await res.json();
        console.log('Commission saved successfully:', result);
        showSnack("Commission updated");
      } else {
        const error = await res.json();
        console.error('Failed to save commission:', error);
        console.error('Response headers:', res.headers);
        showSnack("Failed to update commission", "error");
      }
    } catch (e) {
      console.error('Error saving commission:', e);
      showSnack("Error updating commission", "error");
    }
  };

  // Toggle expand/collapse of row
  const toggleRow = useCallback((id) => {
    setOpenRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ mt: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Set Commission</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              Set commissions for sub-categories and sub-subcategories
            </p>
          </div>
        </div>

        {/* Main category selector */}
        <Box mb={3} sx={{ width: "100%", maxWidth: 500 }}>
          <TextField
            select
            label="Select Main Category"
            value={selectedMain}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedMain(id);
              fetchSubCategories(id);
            }}
            fullWidth
            InputLabelProps={{ shrink: true }}
            SelectProps={{ displayEmpty: true }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: "#fff",
                height: "50px",
                px: 2,
              },
              "& .MuiInputLabel-root": {
                fontSize: 16,
                backgroundColor: "#fff",
                px: 0.5,
              },
              "& .MuiSelect-select": {
                py: 1.5,
              },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#007bff" },
            }}
          >
            {mainCategories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Subcategories Table */}
        {subCategories.length > 0 && (
          <Paper sx={{ width: "100%", overflow: "hidden" }}>
            {/* Table Header */}
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "25% 30% 15% 30%",
              backgroundColor: "#007bff",
              color: "#fff",
              fontWeight: "bold",
              borderBottom: "1px solid #e0e0e0"
            }}>
              <Box sx={{ padding: "12px 16px", textAlign: "left" }}>
                Sub-Category
              </Box>
              <Box sx={{ padding: "12px 16px", textAlign: "center" }}>
                Commission
              </Box>
              <Box sx={{ padding: "12px 16px", textAlign: "center" }}>
                Public
              </Box>
              <Box sx={{ padding: "12px 16px", textAlign: "center" }}>
                Sub-Sub Categories
              </Box>
            </Box>

            {/* Table Body */}
            {subCategories.map((sub, idx) => (
              <Box key={`${sub._id}-${idx}`} sx={{ 
                display: "grid", 
                gridTemplateColumns: "25% 30% 15% 30%",
                borderBottom: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "#f5f5f5" }
              }}>
                {/* Sub-category name */}
                <Box sx={{ padding: "12px 16px", textAlign: "left", verticalAlign: "top" }}>
                  <Typography variant="body2" fontWeight="medium">
                    {sub.name}
                  </Typography>
                </Box>

                {/* Commission input */}
                <Box sx={{ padding: "12px 16px", textAlign: "center", verticalAlign: "top" }}>
                  <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                    <TextField
                      type="number"
                      value={sub.commission}
                      onChange={(e) =>
                        handleSubCommissionChange(sub._id, e.target.value)
                      }
                      size="small"
                      sx={{ width: 100 }}
                      InputProps={{
                        inputProps: { min: 0, max: 100 },
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        height: 36,
                        backgroundColor: "#007bff",
                        "&:hover": { backgroundColor: "#0056b3" },
                      }}
                      onClick={() => {
                        saveCommission(sub._id, sub.commission, 'sub');
                      }}
                    >
                      Save
                    </Button>
                  </Box>
                </Box>

                {/* Public toggle */}
                <Box sx={{ padding: "12px 16px", textAlign: "center", verticalAlign: "top" }}>
                  <Switch
                    checked={!!sub.status}
                    onChange={() => handleToggle(sub._id)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "green" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "green !important",
                      },
                      "& .MuiSwitch-track": { backgroundColor: "red", opacity: 1 },
                    }}
                  />
                </Box>

                {/* Sub-sub categories */}
                <Box sx={{ padding: "12px 16px", textAlign: "center", verticalAlign: "top" }}>
                  {sub.subSubCategories?.length > 0 ? (
                    <Box>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          textTransform: "none",
                          borderColor: "#007bff",
                          color: "#007bff",
                          fontSize: 14,
                        }}
                        onClick={() => toggleRow(sub._id)}
                      >
                        {openRows[sub._id] ? "Hide" : "Show"} (
                        {sub.subSubCategories.length})
                      </Button>

                      <Collapse in={!!openRows[sub._id]} timeout="auto" unmountOnExit>
                        <Box mt={2} sx={{ 
                          backgroundColor: "#f8f9fa", 
                          borderRadius: "8px", 
                          padding: "12px",
                          border: "1px solid #e0e0e0"
                        }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: "bold", 
                            color: "#333", 
                            mb: 1.5,
                            textAlign: "center",
                            fontSize: "13px"
                          }}>
                            Sub-Sub Categories ({sub.subSubCategories.length})
                          </Typography>
                          {sub.subSubCategories.map((ssc, sIdx) => (
                            <Box
                              key={`${ssc._id}-${sIdx}`}
                              display="flex"
                              flexDirection="column"
                              gap={1}
                              p={1.5}
                              mb={1}
                              border="1px solid #dee2e6"
                              borderRadius="6px"
                              bgcolor="#fff"
                              sx={{
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                  transform: "translateY(-1px)"
                                }
                              }}
                            >
                              <Typography variant="body2" sx={{ 
                                fontWeight: "500", 
                                color: "#333",
                                fontSize: "13px"
                              }}>
                                {ssc.name}
                              </Typography>
                              <Box display="flex" alignItems="center" gap={1} sx={{ flexWrap: "wrap" }}>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={ssc.commission}
                                  onChange={(e) =>
                                    handleSSCCommissionChange(
                                      sub._id,
                                      ssc._id,
                                      e.target.value
                                    )
                                  }
                                  sx={{ 
                                    width: 80,
                                    "& .MuiOutlinedInput-root": {
                                      height: "28px",
                                      fontSize: "12px"
                                    }
                                  }}
                                  InputProps={{
                                    inputProps: { min: 0, max: 100 },
                                    endAdornment: (
                                      <InputAdornment position="end" sx={{ fontSize: "11px" }}>
                                        %
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  sx={{
                                    height: 28,
                                    backgroundColor: "#28a745",
                                    "&:hover": { backgroundColor: "#218838" },
                                    fontSize: "11px",
                                    textTransform: "none",
                                    fontWeight: "500",
                                    minWidth: "50px"
                                  }}
                                  onClick={() => {
                                    console.log('Sub-sub category data:', ssc);
                                    console.log('Sub-sub category ID:', ssc._id);
                                    console.log('Sub-sub category commission:', ssc.commission);
                                    saveCommission(ssc._id, ssc.commission, 'subsub');
                                  }}
                                >
                                  Save
                                </Button>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No sub-sub categories
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={2500}
          onClose={closeSnack}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={closeSnack} severity={snack.severity} variant="filled">
            {snack.message}
          </Alert>
        </Snackbar>
      </div>
    </MDBox>
  );
}

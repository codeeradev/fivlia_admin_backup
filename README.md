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
        const subId = sub._id || sub.id || sub.subCategoryId || sub.subcategoryId;
        return {
          _id: subId,
          name: sub.name,
          status: sub.status ?? true,
          commission: Number(sub.commison) || 0,
          subSubCategories: (sub.subSubCategories || sub.subsubcategories || sub.subSubCat || []).map(
            (ssc) => {
              const sscId = ssc._id || ssc.id || ssc.subSubCategoryId || ssc.subsubcategoryId;
              return {
                _id: sscId,
                name: ssc.name,
                commission: Number(ssc.commison) || 0,
              };
            }
          ),
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
            body: JSON.stringify({ id: subId, commison: toggled.status ? 1 : 0, level: "sub" }),
          });
          if (res.ok) {
            showSnack("Status updated");
          } else {
            showSnack("Failed to update status", "error");
          }
        } catch (e) {
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
        body: JSON.stringify({ id, commison: commission, level }),
      });
      if (res.ok) {
        showSnack("Commission updated");
      } else {
        showSnack("Failed to update commission", "error");
      }
    } catch (e) {
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
          <TableContainer component={Paper} sx={{ width: "100%", overflow: "hidden" }}>
            <Table sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#007bff" }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textAlign: "left", width: "25%", padding: "12px 16px" }}>
                    Sub-Category
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textAlign: "center", width: "30%", padding: "12px 16px" }}>
                    Commission
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textAlign: "center", width: "15%", padding: "12px 16px" }}>
                    Public
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textAlign: "center", width: "30%", padding: "12px 16px" }}>
                    Sub-Sub Categories
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subCategories.map((sub, idx) => (
                  <React.Fragment key={`${sub._id}-${idx}`}>
                    <TableRow sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                      {/* Sub-category name */}
                      <TableCell sx={{ textAlign: "left", verticalAlign: "top", width: "25%", padding: "12px 16px" }}>
                        <Typography variant="body2" fontWeight="medium">
                          {sub.name}
                        </Typography>
                      </TableCell>

                      {/* Commission input */}
                      <TableCell sx={{ textAlign: "center", verticalAlign: "top", width: "30%", padding: "12px 16px" }}>
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1} sx={{ maxWidth: "200px", margin: "0 auto" }}>
                          <TextField
                            type="number"
                            value={sub.commission}
                            onChange={(e) => handleSubCommissionChange(sub._id, e.target.value)}
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
                              color: "white !important",
                              backgroundColor: "#007bff",
                              "&:hover": { backgroundColor: "#0056b3" },
                              minWidth: "60px",
                            }}
                            onClick={() => {
                              saveCommission(sub._id, sub.commission, "sub");
                            }}
                          >
                            Save
                          </Button>
                        </Box>
                      </TableCell>

                      {/* Public toggle */}
                      <TableCell sx={{ textAlign: "center", verticalAlign: "top", width: "15%", padding: "12px 16px" }}>
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
                      </TableCell>

                      {/* Sub-sub categories */}
                      <TableCell sx={{ textAlign: "center", verticalAlign: "top", width: "30%", padding: "12px 16px" }}>
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
                              {openRows[sub._id] ? "Hide" : "Show"} ({sub.subSubCategories.length})
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            No sub-sub categories
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Sub-sub categories table */}
                    {sub.subSubCategories?.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ padding: 0, borderBottom: "none" }}>
                          <Collapse in={!!openRows[sub._id]} timeout="auto" unmountOnExit>
                            <TableContainer
                              component={Paper}
                              sx={{ mt: 2, backgroundColor: "#f8f9fa", borderRadius: "8px" }}
                            >
                              <Table size="small" sx={{ tableLayout: "fixed" }}>
                                <TableHead>
                                  <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                                    <TableCell sx={{ fontWeight: "bold", color: "#333", width: "40%", padding: "8px 16px" }}>
                                      Sub-Sub Category
                                    </TableCell>
                                    <TableCell
                                      sx={{ fontWeight: "bold", color: "#333", textAlign: "center", width: "30%", padding: "8px 16px" }}
                                    >
                                      Commission
                                    </TableCell>
                                    <TableCell
                                      sx={{ fontWeight: "bold", color: "#333", textAlign: "center", width: "30%", padding: "8px 16px" }}
                                    >
                                      Action
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sub.subSubCategories.map((ssc, sIdx) => (
                                    <TableRow
                                      key={`${ssc._id}-${sIdx}`}
                                      sx={{ "&:hover": { backgroundColor: "#f1f1f1" } }}
                                    >
                                      <TableCell sx={{ color: "#333", fontSize: "13px", width: "40%", padding: "8px 16px" }}>
                                        {ssc.name}
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", width: "30%", padding: "8px 16px" }}>
                                        <TextField
                                          type="number"
                                          size="small"
                                          value={ssc.commission}
                                          onChange={(e) =>
                                            handleSSCCommissionChange(sub._id, ssc._id, e.target.value)
                                          }
                                          sx={{
                                            width: 80,
                                            "& .MuiOutlinedInput-root": {
                                              height: "28px",
                                              fontSize: "12px",
                                            },
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
                                      </TableCell>
                                      <TableCell sx={{ textAlign: "center", width: "30%", padding: "8px 16px" }}>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          sx={{
                                            height: 28,
                                            color: "white !important",
                                            backgroundColor: "#28a745",
                                            "&:hover": { backgroundColor: "#218838" },
                                            fontSize: "11px",
                                            textTransform: "none",
                                            minWidth: "50px",
                                          }}
                                          onClick={() => {
                                            saveCommission(ssc._id, ssc.commission, "subsub");
                                          }}
                                        >
                                          Save
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  TextField,
  Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DataTable from "react-data-table-component";
import moment from "moment";

export default function SalesReport() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(100);

  // Dropdown data
  const [categories, setCategories] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [zones, setZones] = useState([]);

  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    getCategories();
    getCities();
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory._id);
      if (selectedCity) params.append("city", selectedCity._id);
      if (selectedZone) params.append("zone", selectedZone);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/get-seller-report?${params}`);
      const data = await res.json();
      setReports(data.data || []);
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getMainCategory`);
      const data = await res.json();
      setCategories(data.result || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const getCities = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getAllZone`);
      const data = await res.json();
      setCityData(data || []);
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setSelectedZone(null);
    if (city && city.zones) {
      setZones(city.zones.map((z) => z.zoneTitle));
    } else {
      setZones([]);
    }
  };

  useEffect(() => {
    if (selectedCategory || selectedCity || selectedZone) {
      fetchReport();
    }
  }, [selectedCategory, selectedCity, selectedZone]);

  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedOrder(null);
    setDetailsModalOpen(false);
  };

  const columns = [
    {
      name: "Order ID",
      selector: (row) => row.orderId,
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <Tooltip title="View Order Details" arrow>
          <Typography
            sx={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "primary.main",
              fontWeight: 500,
            }}
            onClick={() => handleOpenDetailsModal(row)}
          >
            {row.orderId}
          </Typography>
        </Tooltip>
      ),
    },
    { name: "Seller Name", selector: (row) => row.sellerName, sortable: true, minWidth: "150px" },
    { name: "City", selector: (row) => row.city || "-", sortable: true, minWidth: "120px" },
    { name: "Zone", selector: (row) => row.zone || "-", sortable: true, minWidth: "140px" },
    {
      name: "Order At",
      selector: (row) =>
        row.createdAt ? moment(row.createdAt).format("DD MMM YYYY") : "-",
      minWidth: "100px",
    },
    {
      name: "Amount",
      selector: (row) => row.totalPrice?.toFixed(2),
      minWidth: "100px",
    },
    {
      name: "Commission",
      selector: (row) => row.commission?.toFixed(2) ?? "-",
      minWidth: "80px",
    },
  ];

  return (
    <MDBox
      sx={{
        ml: { xs: 0, sm: miniSidenav ? "80px" : "250px" },
        mt: "30px",
        p: { xs: 1, sm: 2 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Sales Report
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Filter by Category, City, and Zone to refine report results.
          </Typography>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2.5,
            mb: 3,
          }}
        >
          {/* Category */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={categories}
            value={selectedCategory}
            getOptionLabel={(option) => option?.name || ""}
            onChange={(e, val) => setSelectedCategory(val)}
            renderInput={(params) => (
              <TextField {...params} label="Category" size="small" variant="outlined" />
            )}
          />

          {/* City */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={cityData}
            value={selectedCity}
            getOptionLabel={(option) => option?.city || ""}
            onChange={(e, val) => handleCityChange(val)}
            renderInput={(params) => (
              <TextField {...params} label="City" size="small" variant="outlined" />
            )}
          />

          {/* Zone */}
          <Autocomplete
            sx={{ minWidth: 250 }}
            options={zones}
            value={selectedZone}
            onChange={(e, val) => setSelectedZone(val)}
            disabled={!zones.length}
            renderInput={(params) => (
              <TextField {...params} label="Zone" size="small" variant="outlined" />
            )}
          />

          <Button
            variant="contained"
            onClick={fetchReport}
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "8px",
              px: 3,
              py: 1.4,
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1565c0" },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Apply Filters"}
          </Button>
        </Box>

        {/* Data Table */}
        <Box sx={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={reports}
            progressPending={loading}
            pagination
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[100, 200, 300, 500, 1000]}
            onChangeRowsPerPage={(newPerPage) => setPerPage(newPerPage)}
            highlightOnHover
            pointerOnHover
            dense
            customStyles={{
              headCells: {
                style: {
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                  fontSize: "14px",
                },
              },
              cells: { style: { fontSize: "13px" } },
              pagination: {
                style: {
                  fontSize: "14px",
                  minHeight: "56px",
                  backgroundColor: "#fafafa",
                },
              },
            }}
            noDataComponent="No sales reports found"
          />
        </Box>
      </Paper>

      {/* Order Details Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          },
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pb: 1,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Order Details
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Order ID: {selectedOrder.orderId}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDetailsModal}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1, pb: 3 }}>
              {selectedOrder.items.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 80px 120px",
                    alignItems: "center",
                    py: 1.5,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <Box textAlign="center">
                    <Avatar
                      src={`${process.env.REACT_APP_IMAGE_LINK}${item.image}`}
                      alt={item.productName}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mx: "auto", border: "1px solid #ddd" }}
                    />
                  </Box>
                  <Box>{item.productName}</Box>
                  <Box textAlign="center">{item.quantity}</Box>
                  <Box textAlign="right">₹{item.price.toFixed(2)}</Box>
                </Box>
              ))}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    backgroundColor: "#f1f8e9",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                  }}
                >
                  Total: ₹{selectedOrder.totalPrice?.toFixed(2)}
                </Typography>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </MDBox>
  );
}

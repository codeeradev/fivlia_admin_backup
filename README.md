import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Switch,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import { Visibility, VisibilityOff, Store, Phone, Email, CheckCircle, Cancel } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import db from "components/firebase";
import { doc, getDoc } from "firebase/firestore";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import driverImg from "assets/images/driverFivlia.png";

export default function Drivers() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [drivers, setDrivers] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [walletBalances, setWalletBalances] = useState({});
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editDriverData, setEditDriverData] = useState({
    driverName: "",
    status: false,
    email: "",
    password: "",
    image: null,
    Police_Verification_Copy: null,
    aadharCard: { front: null, back: null },
    drivingLicence: { front: null, back: null },
    address: { city: "", locality: "", mobileNo: "" },
  });
  const [searchLocation, setSearchLocation] = useState("");
  const [driverLocation, setDriverLocation] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [referralStores, setReferralStores] = useState([]);
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState("");

  const bikeIcon = L.icon({
    iconUrl: driverImg,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // =============== FETCH LOCATION ===============
  const fetchDriverLocation = async (driverId) => {
    try {
      const docRef = doc(db, "updates", driverId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { lat: data.latitude || 0, lng: data.longitude || 0 };
      }
      return null;
    } catch (err) {
      console.error("Error fetching driver location:", err);
      return null;
    }
  };

  const handleTrackDriver = async (driver) => {
    const loc = await fetchDriverLocation(driver.id);
    if (loc) {
      setDriverLocation(loc);
      setSelectedDriver(driver);
      setMapModalOpen(true);
    } else {
      alert("Location not available");
    }
  };

  // =============== REFERRALS (IMPROVED UI) ===============
  const handleViewReferrals = async (driver) => {
    try {
      setSelectedDriver(driver);
      setReferralError("");
      setReferralMessage("");
      setReferralStores([]);
      dispatch(startLoading());
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get-driver-referral-seller`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: driver.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Failed to fetch referrals");
      setReferralMessage(data?.message || "");
      setReferralStores(Array.isArray(data?.stores) ? data.stores : []);
      setReferralModalOpen(true);
    } catch (e) {
      setReferralError(e.message || "Failed to fetch referrals");
      setReferralModalOpen(true);
    } finally {
      dispatch(stopLoading());
    }
  };

  // =============== WALLET ===============
  const fetchWalletBalances = async () => {
    try {
      const promises = drivers.map(async (driver) => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/transactionList/${driver.id}`);
        const data = await response.json();
        return { driverId: driver.id, totalAmount: data.totalAmount || 0 };
      });
      const balances = await Promise.all(promises);
      const balanceMap = balances.reduce((acc, { driverId, totalAmount }) => {
        acc[driverId] = totalAmount;
        return acc;
      }, {});
      setWalletBalances(balanceMap);
    } catch (err) {
      console.error("Failed to fetch wallet balances:", err);
      setError("Failed to fetch wallet balances. Please try again.");
    }
  };

  // =============== FETCH DRIVERS & WITHDRAWALS ===============
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        dispatch(startLoading());
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getDriver`);
        const data = await response.json();
        if (Array.isArray(data.Driver)) {
          const formattedDrivers = data.Driver.map((driver) => ({
            id: driver._id,
            name: driver.driverName || "",
            driverId: driver.driverId || "",
            status: driver.status === "true" || driver.status === true,
            email: driver.email || "",
            password: driver.password || "",
            image: driver.image || "",
            Police_Verification_Copy: driver.Police_Verification_Copy || "",
            aadharCard: driver.aadharCard || { front: "", back: "" },
            drivingLicence: driver.drivingLicence || { front: "", back: "" },
            address: driver.address || { city: "", locality: "", mobileNo: "" },
          })).sort((a, b) => {
            const aNum = Number(a.driverId.replace(/\D/g, "")) || 0;
            const bNum = Number(b.driverId.replace(/\D/g, "")) || 0;
            return bNum - aNum;
          });
          setDrivers(formattedDrivers);
        } else {
          setError("Invalid driver data format");
        }
      } catch (error) {
        console.error("Failed to fetch drivers:", error);
        setError("Failed to fetch drivers. Please try again.");
      } finally {
        dispatch(stopLoading());
      }
    };

    const fetchWithdrawalRequests = async () => {
      try {
        dispatch(startLoading());
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getWithdrawalRequest`);
        const data = await response.json();
        if (Array.isArray(data.requests)) {
          const formattedRequests = data.requests.map((request) => ({
            id: request._id,
            driverId: request.driverId,
            amount: request.amount,
            type: request.type,
            description: request.description,
            status: request.status,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt,
          }));
          setWithdrawalRequests(formattedRequests);
        }
      } catch (error) {
        setError("Failed to fetch withdrawal requests.");
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchDrivers();
    fetchWithdrawalRequests();
  }, [dispatch]);

  useEffect(() => {
    if (drivers.length > 0) fetchWalletBalances();
  }, [drivers]);

  // =============== FILTER & PAGINATION ===============
  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredDrivers.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex);

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value));
    setCurrentPage(1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handlePrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  // =============== STATUS TOGGLE ===============
  const toggleStatus = async (id) => {
    const driverToUpdate = drivers.find((d) => d.id === id);
    if (!driverToUpdate) return;
    const newStatus = !driverToUpdate.status;
    try {
      dispatch(startLoading());
      const response = await fetch(`${process.env.REACT_APP_API_URL}/editDriver/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error((await response.json()).message || "Failed");
      setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
    } catch (error) {
      setError(`Failed to update status: ${error.message}`);
    } finally {
      dispatch(stopLoading());
    }
  };

  // =============== DELETE DRIVER ===============
  const handleDeleteDriver = async (id) => {
    const driverToDelete = drivers.find((d) => d.id === id);
    if (!driverToDelete) return;
    const confirmed = window.confirm(`Delete "${driverToDelete.name}"?`);
    if (!confirmed) return;
    try {
      dispatch(startLoading());
      const response = await fetch(`${process.env.REACT_APP_API_URL}/deleteDriver/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed");
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      setError(`Delete failed: ${error.message}`);
    } finally {
      dispatch(stopLoading());
    }
  };

  // =============== EDIT DRIVER ===============
  const handleEditDriver = async () => {
    const formData = new FormData();
    formData.append("driverName", editDriverData.driverName);
    formData.append("status", editDriverData.status.toString());
    formData.append("email", editDriverData.email);
    if (editDriverData.password) formData.append("password", editDriverData.password);
    formData.append("address", JSON.stringify(editDriverData.address));
    if (editDriverData.image) formData.append("image", editDriverData.image);
    if (editDriverData.Police_Verification_Copy) formData.append("Police_Verification_Copy", editDriverData.Police_Verification_Copy);
    if (editDriverData.aadharCard.front) formData.append("aadharCard", editDriverData.aadharCard.front);
    if (editDriverData.aadharCard.back) formData.append("aadharCard", editDriverData.aadharCard.back);
    if (editDriverData.drivingLicence.front) formData.append("drivingLicence", editDriverData.drivingLicence.front);
    if (editDriverData.drivingLicence.back) formData.append("drivingLicence", editDriverData.drivingLicence.back);

    try {
      dispatch(startLoading());
      const response = await fetch(`${process.env.REACT_APP_API_URL}/${selectedDriver.id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error((await response.json()).message || "Update failed");
      const updated = await response.json();
      setDrivers((prev) => prev.map((d) => (d.id === updated.edit._id ? { ...d, ...updated.edit } : d)));
      setEditModalOpen(false);
    } catch (error) {
      setError(`Update failed: ${error.message}`);
    } finally {
      dispatch(stopLoading());
    }
  };

  const handleOpenEditModal = (driver) => {
    setSelectedDriver(driver);
    setEditDriverData({
      driverName: driver.name,
      status: driver.status,
      email: driver.email,
      password: "",
      image: null,
      Police_Verification_Copy: null,
      aadharCard: { front: null, back: null },
      drivingLicence: { front: null, back: null },
      address: { ...driver.address },
    });
    setEditModalOpen(true);
  };

  const handleOpenImageModal = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      {/* ==================== STYLES ==================== */}
      <style jsx>{`
        .drivers-table {
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
          font-family: "Urbanist", sans-serif;
          border: 1px solid #007BFF;
        }
        .drivers-table th,
        .drivers-table td {
          padding: 12px 8px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .drivers-table th {
          background: #007bff;
          color: white;
          font-weight: bold;
          font-size: 16px;
        }
        .drivers-table td { background: white; font-size: 15px; }

        .referral-card {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          background: #fafafa;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .referral-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #333;
        }
        .referral-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 14px;
          color: #555;
          margin-top: 8px;
        }
        @media (max-width: 768px) {
          .referral-info { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ==================== MAIN LAYOUT ==================== */}
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Driver List</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>View and manage all drivers</p>
          </div>
          <Button
            variant="contained"
            style={{ backgroundColor: "#00c853", height: 45, width: 150 }}
            onClick={() => navigate("/add-driver")}
          >
            + Add Driver
          </Button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 17 }}>Show Entries </label>
            <select
              value={entriesToShow}
              onChange={handleEntriesChange}
              style={{ fontSize: 16, padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
            >
              {[5, 10, 20, 30].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search drivers..."
              style={{
                padding: "8px 34px",
                borderRadius: "8px",
                height: "42px",
                width: "220px",
                border: "1px solid #ccc",
                fontSize: 16,
              }}
            />
          </div>
        </div>

        {error && <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</div>}

        {/* ==================== TABLE (FIXED ALIGNMENT) ==================== */}
        <table className="drivers-table" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th style={{ width: "5%" }}>Sr No</th>
              <th style={{ width: "8%" }}>Driver ID</th>
              <th style={{ width: "14%" }}>Driver Name</th>
              <th style={{ width: "14%" }}>Email</th>
              <th style={{ width: "10%" }}>Mobile No</th>
              <th style={{ width: "8%" }}>Wallet</th>
              <th style={{ width: "8%" }}>Referrals</th>
              <th style={{ width: "9%" }}>Details</th>
              <th style={{ width: "7%" }}>Status</th>
              <th style={{ width: "10%" }}>Action</th>
              <th style={{ width: "7%" }}>Locate</th>
            </tr>
          </thead>
          <tbody>
            {currentDrivers.length > 0 ? (
              currentDrivers.map((driver, index) => (
                <tr key={driver.id} style={{ backgroundColor: selectedDriver?.id === driver.id ? "#f1f1f1" : "white" }}>
                  <td>{startIndex + index + 1}</td>
                  <td>{driver.driverId}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Avatar src={`${process.env.REACT_APP_IMAGE_LINK}${driver.image}`} sx={{ width: 36, height: 36, flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{driver.name}</span>
                    </div>
                  </td>
                  <td>{driver.email || "-"}</td>
                  <td>{driver.address?.mobileNo || "-"}</td>
                  <td>
                    <div
                      style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
                      onClick={() => navigate("/driverTransaction", { state: { driverId: driver.id } })}
                    >
                      ₹{walletBalances[driver.id]?.toFixed(2) || "0.00"}
                    </div>
                  </td>
                  <td>
                    <Button size="small" variant="outlined" onClick={() => handleViewReferrals(driver)}>View</Button>
                  </td>
                  <td>
                    <Button size="small" variant="outlined" onClick={() => { setSelectedDriver(driver); setModalOpen(true); }}>
                      View
                    </Button>
                  </td>
                  <td>
                    <Switch checked={driver.status} onChange={() => toggleStatus(driver.id)} color="success" />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <Button size="small" variant="contained" onClick={() => handleOpenEditModal(driver)}>Edit</Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleDeleteDriver(driver.id)}>Delete</Button>
                    </div>
                  </td>
                  <td>
                    <Button size="small" variant="outlined" onClick={() => handleTrackDriver(driver)}>Track</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="11" style={{ padding: "20px", textAlign: "center" }}>No drivers found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>Showing {startIndex + 1} to {Math.min(endIndex, filteredDrivers.length)} of {filteredDrivers.length} entries</div>
          <div>
            <Button onClick={handlePrevious} disabled={currentPage === 1} variant="outlined" sx={{ mr: 1 }}>Previous</Button>
            <Button onClick={handleNext} disabled={currentPage === totalPages} variant="outlined">Next</Button>
          </div>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      {/* Map */}
      <Dialog open={mapModalOpen} onClose={() => setMapModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Driver Location - {selectedDriver?.name}</DialogTitle>
        <DialogContent>
          {driverLocation ? (
            <div style={{ height: "400px" }}>
              <MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={bikeIcon}>
                  <Popup>{selectedDriver?.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <Typography>No location data</Typography>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setMapModalOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Details */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Driver Details</DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {/* ... your existing details UI ... */}
        </DialogContent>
        <DialogActions><Button onClick={() => setModalOpen(false)} color="error">Close</Button></DialogActions>
      </Dialog>

      {/* Image */}
      <Dialog open={imageModalOpen} onClose={() => setImageModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Image Preview</DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          {selectedImage && <img src={selectedImage} alt="preview" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 8 }} />}
        </DialogContent>
        <DialogActions><Button onClick={() => setImageModalOpen(false)} color="error">Close</Button></DialogActions>
      </Dialog>

      {/* Edit */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Driver</DialogTitle>
        <DialogContent dividers>
          {/* ... your edit form ... */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="error">Cancel</Button>
          <Button onClick={handleEditDriver} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* ==================== REFERRAL MODAL (NEW UI) ==================== */}
      <Dialog open={referralModalOpen} onClose={() => setReferralModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Referrals by {selectedDriver?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {referralError && <Typography color="error" sx={{ mb: 2 }}>{referralError}</Typography>}
          {referralMessage && <Typography sx={{ mb: 2, fontStyle: "italic" }}>{referralMessage}</Typography>}

          {referralStores.length > 0 ? (
            <div>
              {referralStores.map((s) => (
                <div key={s._id} className="referral-card">
                  <div className="referral-header">
                    <Store sx={{ color: "#007bff" }} />
                    <span>{s.storeName || "Unnamed Store"}</span>
                    <Chip
                      label={s.approveStatus || "Pending"}
                      size="small"
                      color={s.approveStatus === "Approved" ? "success" : s.approveStatus === "Declined" ? "error" : "warning"}
                      sx={{ ml: "auto" }}
                    />
                  </div>
                  <div className="referral-info">
                    <div><strong>City:</strong> {s.city || "-"}</div>
                    <div><Phone sx={{ fontSize: 14 }} /> {s.PhoneNumber || "-"}</div>
                    <div><Email sx={{ fontSize: 14 }} /> {s.email || "-"}</div>
                    <div><strong>Status:</strong> {String(s.status)}</div>
                    <div><strong>Commission:</strong> ₹{Number(s.commission || 0).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !referralError && <Typography color="text.secondary">No referrals found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReferralModalOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";

export default function Notifications() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editNotificationData, setEditNotificationData] = useState({
    title: "",
    description: "",
    city: "",
    image: null,
  });

  const headerCell = {
    padding: "14px 12px",
    border: "1px solid #ddd",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#007bff",
    color: "white",
  };

  const bodyCell = {
    padding: "12px",
    border: "1px solid #eee",
    fontSize: 17,
    backgroundColor: "#fff",
    textAlign: "center",
  };

  const modalLabelStyle = {
    fontFamily: '"Urbanist", sans-serif',
    fontSize: "17px",
    fontWeight: "bold",
    color: "#333",
    marginRight: "8px",
  };

  const modalValueStyle = {
    fontFamily: '"Urbanist", sans-serif',
    fontSize: "16px",
    color: "#555",
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("https://api.fivlia.in/getNotification"); // Corrected endpoint
        const data = await response.json();

        if (Array.isArray(data.notifications)) {
          const formattedNotifications = data.notifications.map((notification) => ({
            id: notification._id,
            title: notification.title || "",
            description: notification.description || "",
            city: notification.city || "",
            image: notification.image || "",
            createdAt: notification.createdAt || "",
          }));
          setNotifications(formattedNotifications);
        } else {
          alert("Invalid notification data format");
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        alert("Failed to fetch notifications. Please try again.");
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) =>
    (n.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNotifications.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleOpenImageModal = (image) => {
    setSelectedNotification({ image });
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedNotification(null);
  };

  const handleOpenAddModal = () => {
    setEditNotificationData({ title: "", description: "", city: "", image: null });
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (notification) => {
    setSelectedNotification(notification);
    setEditNotificationData({
      title: notification.title || "",
      description: notification.description || "",
      city: notification.city || "",
      image: null,
    });
    setEditModalOpen(true);
  };

  const handleAddNotification = async () => {
    const formData = new FormData();
    formData.append("title", editNotificationData.title);
    formData.append("description", editNotificationData.description);
    formData.append("city", editNotificationData.city);
    if (editNotificationData.image) {
      formData.append("image", editNotificationData.image);
    }

    try {
      const response = await fetch("https://api.fivlia.in/notification", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add notification");
      }

      const newNotification = await response.json();
      setNotifications((prev) => [
        ...prev,
        {
          id: newNotification.notification._id,
          title: newNotification.notification.title,
          description: newNotification.notification.description,
          city: newNotification.notification.city,
          image: newNotification.notification.image,
          createdAt: newNotification.notification.createdAt,
        },
      ]);
      setAddModalOpen(false);
      setEditNotificationData({ title: "", description: "", city: "", image: null });
    } catch (error) {
      console.error("Error adding notification:", error);
      alert(`Failed to add notification: ${error.message}`);
    }
  };

  const handleEditNotification = async () => {
    if (!selectedNotification) return;

    const formData = new FormData();
    formData.append("title", editNotificationData.title);
    formData.append("description", editNotificationData.description);
    formData.append("city", editNotificationData.city);
    if (editNotificationData.image) {
      formData.append("image", editNotificationData.image);
    }

    try {
      const response = await fetch(`https://api.fivlia.in/editNotification/${selectedNotification.id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update notification");
      }

      const updated = await response.json();
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === selectedNotification.id
            ? {
                ...n,
                title: updated.edit?.title || n.title,
                description: updated.edit?.description || n.description,
                city: updated.edit?.city || n.city,
                image: updated.edit?.image || n.image,
              }
            : n
        )
      );
      setEditModalOpen(false);
      setSelectedNotification(null);
      setEditNotificationData({ title: "", description: "", city: "", image: null });
    } catch (error) {
      console.error("Error updating notification:", error);
      alert(`Failed to update notification: ${error.message}`);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(`https://api.fivlia.in/deleteNotification/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete notification");
      }

      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert(`Failed to delete notification: ${error.message}`);
    }
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Notification List</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              View and manage all notifications
            </p>
          </div>
          <Button
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 150,
              fontSize: 12,
              color: "white",
              letterSpacing: "1px",
            }}
            onClick={handleOpenAddModal}
          >
            + Add Notification
          </Button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 17 }}>Show Entries </label>
            <select
              value={entriesToShow}
              onChange={handleEntriesChange}
              style={{
                fontSize: 16,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              {[5, 10, 20, 30].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: "420px" }}>
            <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search notifications..."
              style={{
                padding: "8px 34px",
                borderRadius: "8px",
                height: "42px",
                width: "220px",
                border: "1px solid #ccc",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>
        </div>
        
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: '"Urbanist", sans-serif',
            fontSize: "17px",
            border: "1px solid #007BFF",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={headerCell}>Sr No</th>
              <th style={headerCell}>Title</th>
              <th style={headerCell}>Description</th>
              <th style={headerCell}>City</th>
              <th style={headerCell}>Image</th>
              <th style={headerCell}>Created At</th>
              <th style={headerCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentNotifications.length > 0 ? (
              currentNotifications.map((notification, index) => (
                <tr
                  key={notification.id}
                  style={{
                    backgroundColor: selectedNotification?.id === notification.id ? "#f1f1f1" : "white",
                    cursor: "pointer",
                  }}
                >
                  <td style={bodyCell}>{startIndex + index + 1}</td>
                  <td style={bodyCell}>{notification.title || "-"}</td>
                  <td style={bodyCell}>{notification.description || "-"}</td>
                  <td style={bodyCell}>{notification.city || "-"}</td>
                  <td style={bodyCell}>
                    {notification.image ? (
                      <Avatar
                        src={`${process.env.REACT_APP_IMAGE_LINK}${notification.image}`}
                        alt={notification.title}
                        sx={{ width: 40, height: 40, cursor: "pointer" }}
                        onClick={() => handleOpenImageModal(notification.image)}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={bodyCell}>
                    {new Date(notification.createdAt).toLocaleDateString() || "-"}
                  </td>
                  <td style={bodyCell}>
                    <Button
                      onClick={() => handleOpenEditModal(notification)}
                      style={{
                        backgroundColor: "#007BFF",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        marginRight: "8px",
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteNotification(notification.id)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No notifications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredNotifications.length)} of{" "}
            {filteredNotifications.length} entries
          </div>
          <div>
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === 1 ? "#ccc" : "#007BFF",
                color: currentPage === 1 ? "#666" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                marginRight: "8px",
              }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 18px",
                backgroundColor: currentPage === totalPages ? "#ccc" : "#007BFF",
                color: currentPage === totalPages ? "#666" : "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      <Dialog open={imageModalOpen} onClose={handleCloseImageModal} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}>
          Image Preview
        </DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "24px" }}>
          {selectedNotification?.image && (
            <img
              src={`${process.env.REACT_APP_IMAGE_LINK}${selectedNotification.image}`}
              alt="Notification Image"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={handleCloseImageModal}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Notification Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}>
          Add Notification
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px" }}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={editNotificationData.title}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, title: e.target.value }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={editNotificationData.description}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, description: e.target.value }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={editNotificationData.city}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, city: e.target.value }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Image"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, image: e.target.files[0] }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setAddModalOpen(false)}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNotification}
            color="primary"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Notification Modal */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Urbanist", sans-serif', fontSize: "24px", fontWeight: "bold" }}>
          Edit Notification
        </DialogTitle>
        <DialogContent dividers sx={{ padding: "24px" }}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={editNotificationData.title}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, title: e.target.value }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={editNotificationData.description}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, description: e.target.value }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            value={editNotificationData.city}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, city: e.target.value }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
          <TextField
            label="Image"
            type="file"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={(e) =>
              setEditNotificationData((prev) => ({ ...prev, image: e.target.files[0] }))
            }
            sx={{ fontFamily: '"Urbanist", sans-serif' }}
          />
        </DialogContent>
        <DialogActions sx={{ padding: "16px 24px" }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            color="error"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditNotification}
            color="primary"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontSize: "14px",
              borderRadius: "6px",
              padding: "8px 16px",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
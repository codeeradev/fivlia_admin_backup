import React, { useEffect, useState } from "react";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import MDBox from "components/MDBox";

export default function DriversRequest() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const dispatch = useDispatch();

  const [driverRequests, setDriverRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");

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
    fontSize: 16,
    backgroundColor: "#fff",
  };

  // Fetch seller requests
  useEffect(() => {
    const fetchDriverRequests = async () => {
      try {
        dispatch(startLoading());
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getSellerRequest`);
        const data = await response.json();
        if (Array.isArray(data.requests)) {
          setDriverRequests(data.requests);
        } else {
          setError("Invalid seller requests data format");
        }
      } catch (error) {
        console.error("Failed to fetch seller requests:", error);
        setError("Failed to fetch seller requests. Please try again.");
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchDriverRequests();
  }, [dispatch]);

  // Approve or Decline seller request
  const handleDriverAction = async (id, action) => {
    try {
      dispatch(startLoading());
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/seller/${id}/${action}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} seller request`);
      }

      setDriverRequests((prev) =>
        prev.map((req) =>
          req._id === id
            ? { ...req, status: action === "approve" ? "approved" : "declined" }
            : req
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing seller request:`, error);
      setError(`Failed to ${action} seller request: ${error.message}`);
    } finally {
      dispatch(stopLoading());
    }
  };

  // Filter requests by search term
  const filteredRequests = driverRequests.filter(
    (req) =>
      req.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.mobileNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

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

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <div style={{ width: "100%", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>
              Seller Approval Requests
            </h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              Review and approve or decline new seller requests
            </p>
          </div>
        </div>

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
          <div style={{ marginLeft: "auto" }}>
            <label style={{ fontSize: 17, marginRight: 8 }}>Search:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by Store, Email, or Mobile..."
              style={{
                padding: "8px 34px",
                borderRadius: "8px",
                height: "42px",
                width: "260px",
                border: "1px solid #ccc",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: "red", textAlign: "center", margin: "10px 0" }}>{error}</div>
        )}

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
              <th style={headerCell}>Store Name</th>
              <th style={headerCell}>Owner</th>
              <th style={headerCell}>Mobile</th>
              <th style={headerCell}>Email</th>
              <th style={headerCell}>City</th>
              <th style={headerCell}>Status</th>
              <th style={headerCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length > 0 ? (
              currentRequests.map((request, index) => (
                <tr key={request._id}>
                  <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                  <td style={bodyCell}>{request.storeName}</td>
                  <td style={bodyCell}>{`${request.firstName} ${request.lastName}`}</td>
                  <td style={bodyCell}>{request.mobileNumber}</td>
                  <td style={bodyCell}>{request.email}</td>
                  <td style={bodyCell}>{request.city}</td>
                  <td style={bodyCell}>{request.status}</td>
                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    {request.status === "pending_admin_approval" ? (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleDriverAction(request._id, "approve")}
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDriverAction(request._id, "decline")}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{
                          color: request.status === "approved" ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {request.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No seller requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of{" "}
            {filteredRequests.length} entries
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
    </MDBox>
  );
}

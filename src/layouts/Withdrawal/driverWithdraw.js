import React, { useEffect, useState } from "react";
import { useMaterialUIController } from "context";
import MDBox from "components/MDBox";
import { get, put } from "api/apiClient";
import { ENDPOINTS } from "api/endPoints";
import { showAlert } from "components/commonFunction/alertsLoader";

export default function DriversWithdrawal() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

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
  };

  // Fetch withdrawal requests
    const fetchWithdrawalRequests = async () => {
      try {
        showAlert("loading", "Loading Requests....");
        const response = await get(ENDPOINTS.GET_WITHDRAWAL_REQUESTS);
        const data = response.data;
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
          showAlert("info","", 1);
        } else {
          showAlert("error", "Invalid withdrawal requests data format");
        }
      } catch (error) {
        console.error("Failed to fetch withdrawal requests:", error);
        showAlert("error", "Failed to fetch withdrawal requests. Please try again.");
      }
    };
      useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  // Handle Accept/Decline Withdrawal Request
  const handleWithdrawalAction = async (requestId, action) => {
    try {
      showAlert("loading", "Processing....");
      await put(`${ENDPOINTS.WITHDRAWAL_ACTION}/${requestId}/${action}`);

      setWithdrawalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: action === "accept" ? "Approved" : "Declined" } : req
        )
      );
      showAlert("success", `Withdrawal request ${action}ed successfully.`);
          await fetchWithdrawalRequests();

    } catch (error) {
      console.error(`Error ${action}ing withdrawal request:`, error);
      showAlert("error", `Failed to ${action} withdrawal request: ${error.message}`);
    }
  };

  const filteredRequests = withdrawalRequests.filter((req) =>
    req.driverId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h2 style={{ margin: 0, fontSize: "30px", fontWeight: "bold" }}>Withdrawal Requests</h2>
            <p style={{ margin: 0, fontSize: "18px", color: "#555" }}>
              View and manage all withdrawal requests
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
              placeholder="Search by Driver ID..."
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
              <th style={headerCell}>Driver ID</th>
              <th style={headerCell}>Amount</th>
              <th style={headerCell}>Type</th>
              <th style={headerCell}>Description</th>
              <th style={headerCell}>Status</th>
              <th style={headerCell}>Created At</th>
              <th style={headerCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length > 0 ? (
              currentRequests.map((request, index) => (
                <tr key={request.id}>
                  <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + index + 1}</td>
                  <td style={bodyCell}>{request.driverId}</td>
                  <td style={bodyCell}>₹{request.amount}</td>
                  <td style={bodyCell}>{request.type}</td>
                  <td style={bodyCell}>{request.description}</td>
                  <td style={bodyCell}>{request.status}</td>
                  <td style={bodyCell}>{new Date(request.createdAt).toLocaleString()}</td>
                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    {request.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleWithdrawalAction(request.driverId, "accept")}
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleWithdrawalAction(request.driverId, "decline")}
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
                      <span style={{ color: request.status === "Approved" ? "green" : "red" }}>
                        {request.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No withdrawal requests found.
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
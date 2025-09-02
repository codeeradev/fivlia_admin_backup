import React, { useEffect, useState } from "react";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import MDBox from "components/MDBox";

export default function SellerRequest() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const dispatch = useDispatch();

  const [sellerRequests, setSellerRequests] = useState([]);
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

  // fetch seller approval requests
  useEffect(() => {
    const fetchSellerRequests = async () => {
      try {
        dispatch(startLoading());
        const res = await fetch(`${process.env.REACT_APP_API_URL}/getSellerRequest`);
        const data = await res.json();
        if (Array.isArray(data?.requests)) {
          setSellerRequests(data.requests);
        } else {
          setError("Invalid response format: `requests` not found.");
        }
      } catch (e) {
        console.error(e);
        setError("Failed to fetch seller requests.");
      } finally {
        dispatch(stopLoading());
      }
    };
    fetchSellerRequests();
  }, [dispatch]);

  // approve / reject
  const handleSellerAction = async (id, action) => {
    try {
      dispatch(startLoading());
      const res = await fetch(`${process.env.REACT_APP_API_URL}/acceptDeclineRequest`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        id,
        approval: action === "approve" ? "approved" : "rejected",
      }),
    });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.message || `Failed to ${action === "approve" ? "approve" : "reject"} the seller request`
);
      }
      setSellerRequests((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, approveStatus: action === "approve" ? "approved" : "rejected" } : r
        )
      );
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      dispatch(stopLoading());
    }
  };

  // filter by your fields
  const normalized = (v) => (v || "").toString().toLowerCase();
  const filtered = sellerRequests.filter((r) => {
    const haystack = [
      r.storeName,
      r.firstName,
      r.lastName,
      r.email,
      r.mobileNumber,
      r.city,
      r.gstNumber,
      r.approveStatus,
    ]
      .map(normalized)
      .join(" ");
    return haystack.includes(normalized(searchTerm));
  });

  // pagination
  const totalPages = Math.ceil(filtered.length / entriesToShow) || 1;
  const startIndex = (currentPage - 1) * entriesToShow;
  const endIndex = startIndex + entriesToShow;
  const pageRows = filtered.slice(startIndex, endIndex);

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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
              Review and approve or reject new seller requests
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
              placeholder="Store, owner, email, mobile, city, GST, status…"
              style={{
                padding: "8px 34px",
                borderRadius: "8px",
                height: "42px",
                width: "320px",
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
              <th style={headerCell}>#</th>
              <th style={headerCell}>Store</th>
              <th style={headerCell}>Owner</th>
              <th style={headerCell}>Mobile</th>
              <th style={headerCell}>Email</th>
              <th style={headerCell}>City</th>
              <th style={headerCell}>GST No.</th>
              <th style={headerCell}>Status</th>
              <th style={headerCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length > 0 ? (
              pageRows.map((r, idx) => (
                <tr key={r._id}>
                  <td style={{ ...bodyCell, textAlign: "center" }}>{startIndex + idx + 1}</td>
                  <td style={bodyCell}>{r.storeName || "-"}</td>
                  <td style={bodyCell}>{[r.firstName, r.lastName].filter(Boolean).join(" ") || r.ownerName || "-"}</td>
                  <td style={bodyCell}>{r.PhoneNumber || r.mobileNumber.mobileNO || "-"}</td>
                  <td style={bodyCell}>{r.email.Email || r.email ||"-"}</td>
                  <td style={bodyCell}>{r.city || "-"}</td>
                  <td style={bodyCell}>{r.gstNumber || "-"}</td>
                  <td style={bodyCell}>
                    <span
                      style={{
                        color:
                          r.approveStatus === "approved"
                            ? "green"
                            : r.approveStatus === "rejected"
                            ? "red"
                            : "#555",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      {r.approveStatus || "-"}
                    </span>
                  </td>
                  <td style={{ ...bodyCell, textAlign: "center" }}>
                    {r.approveStatus === "pending_admin_approval" ? (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleSellerAction(r._id, "approve")}
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
                          onClick={() => handleSellerAction(r._id, "rejected")}
                          style={{
                            backgroundColor: "#dc3545",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        style={{
                          color: r.approveStatus === "approved" ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {r.approveStatus}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                  No seller requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
          <div>
            Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filtered.length)} of {filtered.length} entries
          </div>
          <div>
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
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

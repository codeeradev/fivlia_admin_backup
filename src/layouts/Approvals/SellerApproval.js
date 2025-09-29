import React, { useEffect, useState, useMemo } from "react";
import { useMaterialUIController } from "context";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import DataTable from "react-data-table-component";

export default function ApprovalRequests() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const dispatch = useDispatch();

  const [sellerRequests, setSellerRequests] = useState([]);
  const [locationRequests, setLocationRequests] = useState([]);
  const [imageRequests, setImageRequests] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [brandRequests, setBrandRequests] = useState([]);
  const [requestType, setRequestType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(5);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productApprovalOpen, setProductApprovalOpen] = useState(false);
  const [confirmData, setConfirmData] = useState({ type: "", id: "", action: "", description: "" });
  const [productApprovalData, setProductApprovalData] = useState({ type: "", id: "", status: "", description: "" });

  // Image base URL
  const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_LINK || "";

  // Row color based on type
  const rowColor = (type) => {
    switch (type) {
      case "seller": return "#e3f2fd";
      case "location": return "#e8f5e9";
      case "image": return "#f3e5f5"; // New color for image requests
      case "product": return "#fffde7";
      case "brand": return "#fce4ec";
      default: return "#fff";
    }
  };

  // Fetch all approval requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        dispatch(startLoading());
        const res = await fetch(`http://127.0.0.1:8080/getSellerRequest`);
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setSellerRequests((data.requests || []).map((r) => ({ ...r, type: "seller" })));
        setLocationRequests((data.locationRequests || []).map((r) => ({ ...r, type: "location" })));
        setImageRequests((data.imageRequest || []).map((r) => ({ ...r, type: "image" })));
        setProductRequests((data.productRequest || []).map((r) => ({ ...r, type: "product" })));
        setBrandRequests((data.brandRequest || []).map((r) => ({ ...r, type: "brand" })));
      } catch (e) {
        console.error(e);
        setError("Failed to fetch requests.");
      } finally {
        dispatch(stopLoading());
      }
    };
    fetchRequests();
  }, [dispatch]);

  // Open confirmation modal for seller/location/image
  const openConfirm = (type, id, action) => {
    setConfirmData({ type, id, action, description: "" });
    setConfirmOpen(true);
  };

  // Open product approval modal
  const openProductApproval = (type, id) => {
    setProductApprovalData({ type, id, status: "pending_admin_approval", description: "" });
    setProductApprovalOpen(true);
  };

  // Handle confirmation for seller/location/image
  const handleConfirmAction = async () => {
    const { type, id, action, description } = confirmData;
    try {
      dispatch(startLoading());
      const approval = action === "approve" ? "approved" : "rejected";
      let body = { approval };

      if (type === "seller") {
        body.id = id;
      } else if (type === "location") {
        body.id = id;
        body.isLocation = true;
      } else if (type === "image") {
        body.id = id;
        body.isImage = true;
      }

      const res = await fetch(`http://127.0.0.1:8080/acceptDeclineRequest`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.message || `Failed to ${action} the request`);
      }

      if (type === "seller") {
        setSellerRequests((prev) => prev.filter((r) => r._id !== id));
      } else if (type === "location") {
        setLocationRequests((prev) => prev.filter((r) => r._id !== id));
      } else if (type === "image") {
        setImageRequests((prev) => prev.filter((r) => r._id !== id));
      }

      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      dispatch(stopLoading());
      setConfirmOpen(false);
    }
  };

  // Handle product/brand approval
  const handleProductApproval = async () => {
    const { type, id, status, description } = productApprovalData;
    try {
      dispatch(startLoading());
      const body = { productId: id, approval: status };
      if (description) body.description = description;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/acceptDeclineRequest`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.message || `Failed to update ${type} request`);
      }

      if (type === "product") {
        setProductRequests((prev) => prev.filter((r) => r._id !== id));
      } else if (type === "brand") {
        setBrandRequests((prev) => prev.filter((r) => r._id !== id));
      }

      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      dispatch(stopLoading());
      setProductApprovalOpen(false);
    }
  };

  // Combine and filter requests
  const allRequests = [...sellerRequests, ...locationRequests, ...imageRequests, ...productRequests, ...brandRequests];

  const normalized = (v) => (v || "").toString().toLowerCase();
  const filtered = allRequests.filter((r) => {
    if (requestType !== "all" && r.type !== requestType) return false;

    let haystack = [];
    if (r.type === "seller" || r.type === "location" || r.type === "image") {
      haystack = [
        r.storeName,
        r.firstName,
        r.lastName,
        r.ownerName,
        r.email,
        r.mobileNumber,
        r.PhoneNumber,
        r.city?.name,
        r.gstNumber,
        r.approveStatus,
        r.type,
      ];
      if (r.type === "location") {
        haystack.push(r.pendingAddressUpdate?.city?.name, r.pendingAddressUpdate?.status);
      } else if (r.type === "image") {
        haystack.push(r.pendingAdvertisementImages?.status);
      }
    } else if (r.type === "product" || r.type === "brand") {
      haystack = [
        r.productName,
        r.description,
        r.sku,
        r.category?.[0]?.name,
        r.subCategory?.[0]?.name,
        r.brand_Name?.name,
        r.sellerProductStatus,
        r.type,
      ];
      if (r.type === "brand") {
        haystack.push(r.brandApprovelDescription);
      }
    }
    return haystack.map(normalized).join(" ").includes(normalized(searchTerm));
  });

  const getStatus = (r) => {
    if (r.type === "seller") return r.approveStatus || "pending";
    if (r.type === "location") return r.pendingAddressUpdate?.status || "pending";
    if (r.type === "image") return r.pendingAdvertisementImages?.status || "pending";
    return r.sellerProductStatus || "pending";
  };

  const isPending = (r) => {
    const status = getStatus(r);
    return ["pending", "pending_admin_approval", "request_brand_approval", "submit_brand_approval"].includes(status);
  };

  const getDisplayValue = (r, field) => {
    if (r.type === "seller" || r.type === "location" || r.type === "image") {
      switch (field) {
        case "name":
          return r.storeName || "-";
        case "owner":
          return [r.firstName, r.lastName].filter(Boolean).join(" ") || r.ownerName || "-";
        case "mobile":
          return r.PhoneNumber || r.mobileNumber?.mobileNO || "-";
        case "email":
          return r.email?.Email || r.email || "-";
        case "city":
          if (r.type === "location") {
            return `${r.city?.name || "-"} → ${r.pendingAddressUpdate?.city?.name || "-"}`;
          } else if (r.type === "image") {
            return r.city?.name || "-";
          }
          return r.city?.name || "-";
        case "gst":
          return r.gstNumber || "-";
        default:
          return "-";
      }
    } else {
      switch (field) {
        case "name":
          return r.productName || "-";
        case "owner":
          return r.type === "brand"
            ? r.brandApprovelDescription || "-"
            : r.description || "-";
        case "mobile":
          return r.sku || "-";
        case "email":
          return r.category?.[0]?.name || "-";
        case "city":
          return r.subCategory?.[0]?.name || "-";
        case "gst":
          return r.brand_Name?.name || "-";
        default:
          return "-";
      }
    }
  };

  // DataTable columns
  const columns = useMemo(() => [
    {
      name: "#",
      selector: (row, idx) => filtered.indexOf(row) + 1,
      width: "80px",
      style: { justifyContent: "center" },
    },
    {
      name: "Type",
      selector: (row) => row.type.charAt(0).toUpperCase() + row.type.slice(1),
      width: "120px",
      style: { justifyContent: "center", fontWeight: "medium" },
    },
    {
      name: "Store/Product",
      selector: (row) => getDisplayValue(row, "name"),
      width: "240px",
      wrap: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Owner/Desc",
      selector: (row) => getDisplayValue(row, "owner"),
      width: "200px",
      wrap: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Mobile/SKU",
      selector: (row) => getDisplayValue(row, "mobile"),
      width: "150px",
      wrap: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Email/Category",
      selector: (row) => getDisplayValue(row, "email"),
      width: "150px",
      wrap: true,
      style: { justifyContent: "center" },
    },
    {
      name: "City/SubCategory",
      selector: (row) => getDisplayValue(row, "city"),
      width: "150px",
      wrap: true,
      style: { justifyContent: "center" },
    },
    {
      name: "GST/Brand",
      selector: (row) => getDisplayValue(row, "gst"),
      width: "150px",
      wrap: true,
      style: { justifyContent: "center" },
    },
    {
      name: "Status",
      selector: (row) => getStatus(row).replace(/_/g, " "),
      width: "150px",
      style: {
        justifyContent: "center",
        color: (row) => (getStatus(row) === "approved" ? "#2e7d32" : getStatus(row) === "rejected" ? "#d32f2f" : "#ed6c02"),
        fontWeight: "medium",
        textTransform: "capitalize",
      },
    },
    {
      name: "Action",
      cell: (row) =>
        isPending(row) ? (
          row.type === "product" || row.type === "brand" ? (
            <MDButton
              variant="contained"
              color="info"
              size="small"
              onClick={() => openProductApproval(row.type, row._id)}
              sx={{ minWidth: "120px", padding: "6px 12px" }}
            >
              Update Status
            </MDButton>
          ) : (
            <MDBox display="flex" gap={1} justifyContent="center" sx={{ minWidth: "120px" }}>
              <MDButton
                variant="contained"
                color="success"
                size="small"
                onClick={() => openConfirm(row.type, row._id, "approve")}
                startIcon={<CheckIcon />}
                sx={{ minWidth: "90px", padding: "8px 16px", fontSize: "0.85rem" }}
              >
                Approve
              </MDButton>
              <MDButton
                variant="contained"
                color="error"
                size="small"
                onClick={() => openConfirm(row.type, row._id, "reject")}
                startIcon={<CloseIcon />}
                sx={{ minWidth: "60px", padding: "6px 12px" }}
              >
                Reject
              </MDButton>
            </MDBox>
          )
        ) : (
          <MDTypography
            variant="body2"
            sx={{
              color: getStatus(row) === "approved" ? "#2e7d32" : "#d32f2f",
              fontWeight: "medium",
              textTransform: "capitalize",
            }}
          >
            {getStatus(row).replace(/_/g, " ")}
          </MDTypography>
        ),
      width: "200px",
      style: { justifyContent: "center" },
    },
    {
      name: "View",
      cell: (row) => (
        <IconButton onClick={() => { setSelectedRequest(row); setOpenDialog(true); }} color="primary">
          <VisibilityIcon />
        </IconButton>
      ),
      width: "80px",
      style: { justifyContent: "center" },
    },
  ], [filtered]);

  // DataTable custom styles
  const customStyles = {
    table: {
      style: {
        width: "100%",
        minWidth: "1000px",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#007bff",
        color: "white",
        fontWeight: 600,
        fontSize: "0.875rem",
      },
    },
    headCells: {
      style: {
        padding: "14px 16px",
        justifyContent: "center",
        textAlign: "center",
      },
    },
    cells: {
      style: {
        padding: "14px 16px",
        justifyContent: "center",
        textAlign: "center",
        wordBreak: "break-word",
        whiteSpace: "normal",
        fontSize: "0.9rem",
      },
    },
    rows: {
      style: {
        "&:not(:last-of-type)": {
          borderBottom: "1px solid #ddd",
        },
      },
    },
  };

  // Detailed view for dialog
  const renderRequestDetails = (request) => {
    const { type } = request;
    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        {type === "seller" || type === "location" || type === "image" ? (
          <>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">Store Information</MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDTypography variant="body2"><strong>Store Name:</strong> {request.storeName || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Owner:</strong> {request.ownerName || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Email:</strong> {request.email || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Phone:</strong> {request.PhoneNumber || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>GST:</strong> {request.gstNumber || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Address:</strong> {request.fullAddress || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>City:</strong> {request.city?.name || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Coordinates:</strong> {request.Latitude || "-"}, {request.Longitude || "-"}</MDTypography>
                </MDBox>
                {type === "location" && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Location Update</MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      <MDTypography variant="body2"><strong>New City:</strong> {request.pendingAddressUpdate?.city?.name || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>New Zone:</strong> {request.pendingAddressUpdate?.zone?.[0]?.name || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>New Coordinates:</strong> {request.pendingAddressUpdate?.Latitude || "-"}, {request.pendingAddressUpdate?.Longitude || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>Requested On:</strong> {request.pendingAddressUpdate?.requestedAt ? new Date(request.pendingAddressUpdate.requestedAt).toLocaleDateString() : "-"}</MDTypography>
                    </MDBox>
                  </>
                )}
                {type === "image" && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Pending Advertisement Images</MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                      {request.pendingAdvertisementImages?.image?.map((img, i) => (
                        <img key={i} src={`${IMAGE_BASE_URL}${img}`} alt={`Pending Image ${i + 1}`} style={{ maxWidth: "150px", borderRadius: "4px" }} />
                      ))}
                    </MDBox>
                    <MDTypography variant="body2" sx={{ mt: 1 }}><strong>Status:</strong> <Chip label={request.pendingAdvertisementImages?.status || "Pending"} color={request.pendingAdvertisementImages?.status === "approved" ? "success" : request.pendingAdvertisementImages?.status === "rejected" ? "error" : "warning"} size="small" sx={{ ml: 1 }} /></MDTypography>
                  </>
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">Verification Details</MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDTypography variant="body2"><strong>Status:</strong> <Chip label={request.status ? "Active" : "Inactive"} color={request.status ? "success" : "error"} size="small" sx={{ ml: 1 }} /></MDTypography>
                  <MDTypography variant="body2"><strong>Approval Status:</strong> <Chip label={request.approveStatus || request.pendingAdvertisementImages?.status || "Pending"} color={request.approveStatus === "approved" || request.pendingAdvertisementImages?.status === "approved" ? "success" : request.approveStatus === "rejected" || request.pendingAdvertisementImages?.status === "rejected" ? "error" : "warning"} size="small" sx={{ ml: 1 }} /></MDTypography>
                  <MDTypography variant="body2"><strong>Authorized Store:</strong> {request.Authorized_Store ? "Yes" : "No"}</MDTypography>
                  <MDTypography variant="body2"><strong>Sell Food:</strong> {request.sellFood ? "Yes" : "No"}</MDTypography>
                  <MDTypography variant="body2"><strong>FSI Number:</strong> {request.fsiNumber || "-"}</MDTypography>
                </MDBox>
                {request.bankDetails && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Bank Details</MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      <MDTypography variant="body2"><strong>Bank:</strong> {request.bankDetails.bankName || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>Holder:</strong> {request.bankDetails.accountHolder || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>Account No:</strong> {request.bankDetails.accountNumber || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>IFSC:</strong> {request.bankDetails.ifsc || "-"}</MDTypography>
                    </MDBox>
                  </>
                )}
              </MDBox>
              {(request.aadharCard?.length > 0 || request.image) && (
                <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm" sx={{ mt: 2 }}>
                  <MDTypography variant="h6" gutterBottom color="primary">Documents</MDTypography>
                  {request.aadharCard?.length > 0 && (
                    <MDBox mb={2}>
                      <MDTypography variant="body2">Aadhar Card:</MDTypography>
                      <MDBox display="flex" gap={1} flexWrap="wrap">
                        {request.aadharCard.slice(0, 2).map((img, i) => (
                          <img key={i} src={`${IMAGE_BASE_URL}${img}`} alt="Aadhar" style={{ maxWidth: "100px", borderRadius: "4px" }} />
                        ))}
                        {request.aadharCard.length > 2 && <Chip label={`+${request.aadharCard.length - 2}`} size="small" />}
                      </MDBox>
                    </MDBox>
                  )}
                  {request.image && (
                    <MDBox>
                      <MDTypography variant="body2">Store Image:</MDTypography>
                      <img src={`${IMAGE_BASE_URL}${request.image}`} alt="Store" style={{ maxWidth: "150px", borderRadius: "4px" }} />
                    </MDBox>
                  )}
                </MDBox>
              )}
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">Product Details</MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  <MDTypography variant="body2"><strong>Name:</strong> {request.productName || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Description:</strong> {request.description || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>SKU:</strong> {request.sku || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Category:</strong> {request.category?.[0]?.name || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Subcategory:</strong> {request.subCategory?.[0]?.name || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Brand:</strong> {request.brand_Name?.name || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Tax:</strong> {request.tax || "-"}%</MDTypography>
                  <MDTypography variant="body2"><strong>Unit:</strong> {request.unit?.name || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Status:</strong> <Chip label={request.status ? "Active" : "Inactive"} color={request.status ? "success" : "error"} size="small" sx={{ ml: 1 }} /></MDTypography>
                  <MDTypography variant="body2"><strong>Approval Status:</strong> <Chip label={request.sellerProductStatus || "Pending"} color={request.sellerProductStatus === "approved" ? "success" : request.sellerProductStatus === "rejected" ? "error" : "warning"} size="small" sx={{ ml: 1 }} /></MDTypography>
                  {request.brandApprovelDescription && <MDTypography variant="body2"><strong>Notes:</strong> {request.brandApprovelDescription}</MDTypography>}
                </MDBox>
                {request.variants && request.variants.length > 0 && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Variants</MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={1}>
                      {request.variants.slice(0, 2).map((v, i) => (
                        <MDBox key={i} p={1} border="1px solid #eee" borderRadius="sm">
                          <MDTypography variant="body2"><strong>{v.attributeName}:</strong> {v.variantValue}</MDTypography>
                          <MDTypography variant="body2"><strong>MRP:</strong> ₹{v.mrp} | <strong>Sell:</strong> ₹{v.sell_price} | <strong>Discount:</strong> {v.discountValue}%</MDTypography>
                        </MDBox>
                      ))}
                      {request.variants.length > 2 && <Chip label={`+${request.variants.length - 2} more`} size="small" sx={{ mt: 1 }} />}
                    </MDBox>
                  </>
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm">
                <MDTypography variant="h6" gutterBottom color="primary">Additional Details</MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1}>
                  {request.location?.[0] && (
                    <>
                      <MDTypography variant="body2"><strong>City:</strong> {request.location[0].city?.[0]?.name || "-"}</MDTypography>
                      <MDTypography variant="body2"><strong>Zone:</strong> {request.location[0].zone?.[0]?.name || "-"}</MDTypography>
                    </>
                  )}
                  <MDTypography variant="body2"><strong>Return Policy:</strong> {request.returnProduct?.title || "-"}</MDTypography>
                  <MDTypography variant="body2"><strong>Rating:</strong> {request.rating?.rate || 0} ({request.rating?.users || 0} reviews)</MDTypography>
                  <MDTypography variant="body2"><strong>Purchases:</strong> {request.purchases || 0}</MDTypography>
                  {request.inventory && request.inventory.length > 0 && (
                    <MDTypography variant="body2"><strong>Stock:</strong> {request.inventory.reduce((sum, inv) => sum + inv.quantity, 0)} units</MDTypography>
                  )}
                </MDBox>
                {request.filter && request.filter.length > 0 && (
                  <>
                    <MDTypography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Filters</MDTypography>
                    <MDBox display="flex" flexWrap="wrap" gap={1}>
                      {request.filter.flatMap(f => f.selected?.map(s => s.name) || []).slice(0, 4).map((filter, i) => (
                        <Chip key={i} label={filter} size="small" />
                      ))}
                      {request.filter.flatMap(f => f.selected || []).length > 4 && <Chip label={`+${request.filter.flatMap(f => f.selected || []).length - 4}`} size="small" />}
                    </MDBox>
                  </>
                )}
              </MDBox>
              {(request.productThumbnailUrl || request.productImageUrl?.length > 0 || request.brandApprovalDocument) && (
                <MDBox p={2} borderRadius="md" bgColor="white" boxShadow="sm" sx={{ mt: 2 }}>
                  <MDTypography variant="h6" gutterBottom color="primary">Images</MDTypography>
                  <MDBox display="flex" gap={1} flexWrap="wrap">
                    {request.productThumbnailUrl && (
                      <img src={`${IMAGE_BASE_URL}${request.productThumbnailUrl}`} alt="Thumbnail" style={{ maxWidth: "80px", borderRadius: "4px" }} />
                    )}
                    {request.productImageUrl?.slice(0, 2).map((url, i) => (
                      <img key={i} src={`${IMAGE_BASE_URL}${url}`} alt={`Image ${i}`} style={{ maxWidth: "80px", borderRadius: "4px" }} />
                    ))}
                    {request.productImageUrl?.length > 2 && <Chip label={`+${request.productImageUrl.length - 2}`} size="small" />}
                    {request.brandApprovalDocument && (
                      <img src={`${IMAGE_BASE_URL}${request.brandApprovalDocument}`} alt="Brand Doc" style={{ maxWidth: "80px", borderRadius: "4px" }} />
                    )}
                  </MDBox>
                </MDBox>
              )}
            </Grid>
          </>
        )}
      </Grid>
    );
  };

  const handleEntriesChange = (e) => {
    setEntriesToShow(parseInt(e.target.value, 10));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeChange = (e) => {
    setRequestType(e.target.value);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "30px" }}>
      <MDBox width="100%" px={3}>
        <MDBox display="flex" justifyContent="space-between" mb={3} alignItems="center">
          <MDBox>
            <MDTypography variant="h5" fontWeight="bold">Approval Requests</MDTypography>
            <MDTypography variant="body2" color="textSecondary">Review and manage pending requests</MDTypography>
          </MDBox>
        </MDBox>

        <Card sx={{ p: 3, mb: 3 }}>
          <MDBox display="flex" gap={3} flexWrap="wrap" alignItems="center">
            <MDBox display="flex" alignItems="center" gap={1}>
              <MDTypography variant="body2" fontWeight="medium">Show Entries:</MDTypography>
              <FormControl size="medium" sx={{ minWidth: 120 }}>
                <InputLabel>Entries</InputLabel>
                <Select
                    value={entriesToShow}
                    onChange={handleEntriesChange}
                    label="Entries"
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 250, minWidth: 120, fontSize: "1rem" } },
                    }}
                  >
                  {[5, 10, 20, 30].map((num) => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox display="flex" alignItems="center" gap={1}>
              <MDTypography variant="body2" fontWeight="medium">Filter by Type:</MDTypography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={requestType} onChange={handleTypeChange} label="Type">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="location">Location</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="brand">Brand</MenuItem>
                </Select>
              </FormControl>
            </MDBox>
            <MDBox ml="auto">
              <MDInput
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search: Store/Product, owner/desc, email/cat, mobile/sku..."
                size="small"
                sx={{ width: { xs: "100%", sm: 300 } }}
              />
            </MDBox>
          </MDBox>
        </Card>

        {error && (
          <MDBox mb={2} p={2} sx={{ bgcolor: "error.light", borderRadius: 1 }}>
            <MDTypography variant="body2" color="error">{error}</MDTypography>
          </MDBox>
        )}

        <Card sx={{ overflowX: "auto" }}>
          <DataTable
            columns={columns}
            data={filtered}
            pagination
            paginationPerPage={entriesToShow}
            paginationRowsPerPageOptions={[5, 10, 20, 30]}
            paginationComponentOptions={{
              rowsPerPageText: "Entries per page:",
              rangeSeparatorText: "of",
            }}
            customStyles={customStyles}
            conditionalRowStyles={[
              {
                when: (row) => true,
                style: (row) => ({
                  backgroundColor: rowColor(row.type),
                }),
              },
            ]}
            noDataComponent={
              <MDBox display="flex" sx={{ padding: "20px", justifyContent: "center" }}>
                <MDTypography variant="body2" color="textSecondary">No requests found.</MDTypography>
              </MDBox>
            }
          />
        </Card>

        {/* View Details Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <MDTypography variant="h5">{selectedRequest?.type.charAt(0).toUpperCase() + selectedRequest?.type.slice(1)} Details</MDTypography>
          </DialogTitle>
          <DialogContent>{selectedRequest && renderRequestDetails(selectedRequest)}</DialogContent>
          <DialogActions>
            <MDButton variant="contained" color="primary" onClick={() => setOpenDialog(false)} sx={{ padding: "6px 12px" }}>Close</MDButton>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog for Seller/Location/Image */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>
            <MDTypography variant="h5">Confirm {confirmData.action.charAt(0).toUpperCase() + confirmData.action.slice(1)}</MDTypography>
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="body2">Are you sure you want to {confirmData.action} this {confirmData.type} request?</MDTypography>
            {confirmData.action === "reject" && (
              <TextField
                multiline
                rows={3}
                fullWidth
                label="Rejection Reason (optional)"
                value={confirmData.description}
                onChange={(e) => setConfirmData({ ...confirmData, description: e.target.value })}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setConfirmOpen(false)} sx={{ padding: "6px 12px" }}>Cancel</MDButton>
            <MDButton
              variant="contained"
              color={confirmData.action === "approve" ? "success" : "error"}
              onClick={handleConfirmAction}
              sx={{ padding: "6px 12px" }}
            >
              {confirmData.action.charAt(0).toUpperCase() + confirmData.action.slice(1)}
            </MDButton>
          </DialogActions>
        </Dialog>

        {/* Product/Brand Approval Dialog */}
        <Dialog open={productApprovalOpen} onClose={() => setProductApprovalOpen(false)}>
          <DialogTitle>
            <MDTypography variant="h5">Update {productApprovalData.type.charAt(0).toUpperCase() + productApprovalData.type.slice(1)} Status</MDTypography>
          </DialogTitle>
          <DialogContent>
            <MDTypography variant="body2" mb={2}>Select the status for this {productApprovalData.type} request:</MDTypography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={productApprovalData.status}
                onChange={(e) => setProductApprovalData({ ...productApprovalData, status: e.target.value })}
                label="Status"
                sx={{height:"30px"}}
              >
                {["request_brand_approval", "approved", "rejected"].map((status) => (
                  <MenuItem key={status} value={status}>{status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              multiline
              rows={3}
              fullWidth
              label="Description (optional)"
              value={productApprovalData.description}
              onChange={(e) => setProductApprovalData({ ...productApprovalData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <MDButton onClick={() => setProductApprovalOpen(false)} sx={{ padding: "6px 12px" }}>Cancel</MDButton>
            <MDButton variant="contained" color="primary" onClick={handleProductApproval} sx={{ padding: "6px 12px" }}>Update</MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}
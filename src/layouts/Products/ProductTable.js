import React, { useEffect, useState } from "react";
import MDBox from "components/MDBox";
import { Button, Menu, MenuItem, IconButton, Switch, Chip, Tooltip, Popover, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ListIcon from "@mui/icons-material/List";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { MoreHoriz } from "@mui/icons-material";

// Styles for table headers and cells
const headerCell = {
  padding: "14px 12px",
  border: "1px solid #ddd",
  fontSize: 18,
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "white",
  textAlign: "left",
};

const bodyCell = {
  padding: "12px",
  border: "1px solid #eee",
  fontSize: 16,
  backgroundColor: "#fff",
};

function ProductTable() {
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState(250); // Default to 10 for API pagination
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [publicStatus, setPublicStatus] = useState({});
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [popoverData, setPopoverData] = useState([]);
  const [popoverIndex, setPopoverIndex] = useState(null);
  const [popoverType, setPopoverType] = useState("");

 
useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await fetch(
        `${process.env.REACT_APP_API_URL}/adminProducts?page=${currentPage}&limit=${entries}&search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(selectedCity)}&category=${encodeURIComponent(selectedCategory)}`
      );
      const res = await result.json();
      setData(res.Product || []);
      setTotalItems(res.count || 0);
      setTotalPages(res.totalPages || 1);

      const initialPublicStatus = (res.Product || []).reduce((acc, cur) => {
        acc[cur._id] = cur.status === true;
        return acc;
      }, {});
      setPublicStatus(initialPublicStatus);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  fetchData();
}, [searchQuery, entries, selectedCity, selectedCategory, currentPage]);

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const handleDeleteProduct = async (id) => {
    handleMenuClose();
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      const result = await fetch(`${process.env.REACT_APP_API_URL}/deleteProduct/${id}`, {
        method: "DELETE",
      });

      if (result.status === 200) {
        alert("Product Deleted Successfully");
        // Refetch products with current page and limit
        const result = await fetch(`${process.env.REACT_APP_API_URL}/adminProducts?page=${currentPage}&limit=${entries}&search=${encodeURIComponent(search)}`);
        const res = await result.json();
        const products = res.Product || [];
        setData(products);
        setTotalItems(res.count || 0);
        setTotalPages(res.totalPages || 1);

        const updatedStatus = products.reduce((acc, cur) => {
          acc[cur._id] = cur.status === true;
          return acc;
        }, {});
        setPublicStatus(updatedStatus);
      } else {
        alert("Error");
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // Filter products client-side
  const filteredProducts = Array.isArray(data)
    ? data
        .filter((item) =>
          selectedCity
            ? item.location?.some((loc) => loc.city?.[0]?.name === selectedCity)
            : true
        )
        .filter((item) =>
          selectedCategory
            ? item.category?.some((cat) => cat.name === selectedCategory)
            : true
        )
        .filter((item) =>
          Object.values(item).some((val) =>
            Array.isArray(val)
              ? val.some((v) =>
                  typeof v === "object"
                    ? Object.values(v).some((subVal) =>
                        String(subVal).toLowerCase().includes(search.toLowerCase())
                      )
                    : String(v).toLowerCase().includes(search.toLowerCase())
                )
              : String(val).toLowerCase().includes(search.toLowerCase())
          )
        )
    : [];

    const fetchProducts = async () => {
  try {
    const result = await fetch(
      `${process.env.REACT_APP_API_URL}/adminProducts?page=${currentPage}&limit=${entries}&search=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}&category=${encodeURIComponent(selectedCategory)}`
    );
    const res = await result.json();
    setData(res.Product || []);
    setTotalItems(res.count || 0);
    setTotalPages(res.totalPages || 1);

    const initialPublicStatus = (res.Product || []).reduce((acc, cur) => {
      acc[cur._id] = cur.status === true;
      return acc;
    }, {});
    setPublicStatus(initialPublicStatus);
  } catch (err) {
    console.error("Error fetching products:", err);
  }
};


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSwitchChange = async (id) => {
    try {
      const result = await fetch(`https://node-m8jb.onrender.com/edit-toggle/${id}`, {
        method: "PUT",
      });

      if (result.status === 200) {
        const data = await result.json();
        setPublicStatus((prev) => ({ ...prev, [id]: data.status }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toBase64 = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  const exportTable = async (format) => {
    const exportData = await Promise.all(
      filteredProducts.map(async (item, index) => {
        return {
          "Sr. No": (currentPage - 1) * entries + index + 1,
          Product: item.productName,
          ImageURL: item.productThumbnailUrl,
          SKU: item.sku,
          City: item.location?.map((loc) => loc.city?.[0]?.name || "N/A").join(", ") || "N/A",
          Zone: item.location?.[0]?.zone?.[0]?.name || "N/A",
          Price: item.variants
            ?.map((v) => `${v.attributeName} - ${v.variantValue} - ₹${v.sell_price}`)
            .slice(0, 2)
            .join(", ") || "N/A",
          Categories: item.category?.map((c) => c.name).join(", "),
          Public: publicStatus[item._id] ? "Yes" : "No",
        };
      })
    );

    if (format === "excel" || format === "csv") {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, `ProductList.${format === "excel" ? "xlsx" : "csv"}`);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.setFontSize(12);
      doc.text("Product List", 14, 15);

      const columns = [
        "Sr. No",
        "Product",
        "SKU",
        "City",
        "Zone",
        "Price",
        "Categories",
        "Public",
      ];

      const rows = exportData.map((row) => [
        row["Sr. No"],
        row["Product"],
        row["SKU"],
        row["City"],
        row["Zone"],
        row["Price"],
        row["Categories"],
        row["Public"],
      ]);

      const images = await Promise.all(
        exportData.map((row) => toBase64(row.ImageURL).catch(() => null))
      );

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 25,
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          1: { cellWidth: 60 },
        },
        didDrawCell: (data) => {
          if (data.column.index === 1 && data.section === "body") {
            const imgData = images[data.row.index];
            if (imgData) {
              const x = data.cell.x + 2;
              const y = data.cell.y + 2;
              const imgHeight = 15;
              const imgWidth = 15;
              doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
              doc.setFontSize(8);
              doc.text(
                rows[data.row.index][1],
                x + imgWidth + 4,
                y + imgHeight / 1.5
              );
            }
          }
        },
      });

      doc.save("ProductList.pdf");
    }
  };

  // Handle Popover
  const handlePopoverOpen = (event, data, index, type) => {
    setPopoverAnchorEl(event.currentTarget);
    setPopoverData(data);
    setPopoverIndex(index);
    setPopoverType(type);
  };

  const handlePopoverClose = () => {
    setPopoverAnchorEl(null);
    setPopoverData([]);
    setPopoverIndex(null);
    setPopoverType("");
  };

  return (
    <MDBox
      p={2}
      style={{
        marginLeft: miniSidenav ? "80px" : "250px",
        transition: "margin-left 0.3s ease",
      }}
    >
      <div style={{ borderRadius: 15, padding: 20, overflowX: "auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ fontWeight: "bold", fontSize: 26 }}>Product List</span>
            <br />
            <span style={{ fontSize: 17 }}>View and manage all products</span>
          </div>
          <Button
            style={{
              backgroundColor: "#00c853",
              height: 45,
              width: 160,
              fontSize: 13,
              color: "white",
              letterSpacing: "1px",
            }}
            onClick={() => navigate("/add-product")}
          >
            + Add Product
          </Button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >

          <div>
            <span style={{ fontSize: 16 }}>Show Entries:</span>
            <select
              value={entries}
              onChange={(e) => {
                setEntries(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 30 }}>
            <div>
              <label style={{ fontSize: 16 }}>Export:</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  const confirmExport = window.confirm(
                    `Are you sure you want to export as ${val.toUpperCase()}?`
                  );
                  if (confirmExport) exportTable(val);
                }}
                style={{ fontSize: 16, borderRadius: "6px", marginRight: "20px" }}
                defaultValue=""
              >
                <option value="" disabled>
                  Export as
                </option>
                <option value="excel">Export Excel</option>
                <option value="csv">Export CSV</option>
                <option value="pdf">Export PDF</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Filter by City:</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                }}
                style={{ fontSize: 16, borderRadius: "6px" }}
              >
                <option value="">All Cities</option>
                {Array.from(
                  new Set(
                    data.flatMap((p) => p.location?.map((loc) => loc.city?.[0]?.name)).filter(
                      Boolean
                    )
                  )
                ).map((cityName, idx) => (
                  <option key={idx} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Filter by Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
                style={{ fontSize: 16, borderRadius: "6px" }}
              >
                <option value="">All Categories</option>
                {Array.from(
                  new Set(
                    data.flatMap((p) => p.category?.map((cat) => cat.name)).filter(Boolean)
                  )
                ).map((categoryName, idx) => (
                  <option key={idx} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 16 }}>Search:</label>
              <br />
       <input
  type="text"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      setSearchQuery(searchInput); // trigger API call only on Enter
      setCurrentPage(1); // reset to first page
    }
  }}
  placeholder="Search..."
  style={{
    padding: "10px",
    borderRadius: "20px",
    height: "40px",
    width: "200px",
    border: "1px solid #ccc",
    fontSize: 16,
    marginTop: 5,
  }}
/>

            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...headerCell, minWidth: "80px" }}>Sr. No</th>
                <th style={{ ...headerCell, minWidth: 250 }}>Product Name</th>
                <th style={headerCell}>SKU</th>
                <th style={{ ...headerCell, width: "130px" }}>City</th>
                <th style={headerCell}>Zone</th>
                <th style={headerCell}>Price</th>
                <th style={headerCell}>Categories</th>
                <th style={headerCell}>Public</th>
                <th style={headerCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((item, index) => {
                  const cities = item.location?.map((loc) => loc.city?.[0]?.name).filter(Boolean) || [];
                  const prices = item.variants?.map(
                    (v) => `${v.attributeName} - ${v.variantValue} - ₹${v.sell_price}`
                  ) || [];

                  return (
                    <tr key={item._id}>
                      <td style={{ ...bodyCell, width: "75px" }}>
                        {(currentPage - 1) * entries + index + 1}
                      </td>
                      <td style={{ ...bodyCell, display: "flex", alignItems: "center", gap: 10 }}>
                        <img
                          src={`${process.env.REACT_APP_IMAGE_LINK}${item.productThumbnailUrl}`}
                          alt={item.productThumbnailUrl}
                          style={{
                            width: 60,
                            height: 70,
                            borderRadius: 6,
                            objectFit: "cover",
                          }}
                        />
                        <span style={{ fontWeight: "500" }}>{item.productName}</span>
                      </td>
                      <td style={bodyCell}>{item.sku}</td>
                      <td style={bodyCell}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexDirection: "row" }}>
                          <div>
                            {cities.slice(0, 2).map((city, idx) => (
                              <Chip
                                key={idx}
                                label={city}
                                size="small"
                                style={{
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                  fontSize: 10,
                                  marginRight: 5,
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            {cities.length > 2 && (
                              <Tooltip title="View all cities">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handlePopoverOpen(e, cities, index, "city")}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          {!cities.length && <span>N/A</span>}
                        </div>
                        <Popover
                          open={Boolean(popoverAnchorEl) && popoverIndex === index && popoverType === "city"}
                          anchorEl={popoverAnchorEl}
                          onClose={handlePopoverClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          <div style={{ padding: "10px", maxWidth: "300px" }}>
                            <Typography variant="h6" style={{ fontSize: 14 }}>
                              All Cities
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 15 }}>
                              {popoverData.map((city, idx) => (
                                <li key={idx} style={{ fontSize: 12 }}>
                                  {city}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>
                      </td>
                      <td style={{ ...bodyCell, width: "140px" }}>
                        {item.location?.[0]?.zone?.[0]?.name?.split(",")[0] || "N/A"}
                      </td>
                      <td style={{ ...bodyCell }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexDirection: "row" }}>
                          <div>
                            {item.variants?.slice(0, 2).map((variant, idx) => (
                              <Chip
                                key={idx}
                                label={`${variant.attributeName} - ${variant.variantValue} - ₹${variant.sell_price}`}
                                size="small"
                                style={{
                                  backgroundColor: "#f1f8e9",
                                  color: "#388e3c",
                                  fontSize: 10,
                                }}
                              />
                            ))}
                          </div>
                          <div>
                            {prices.length > 2 && (
                              <Tooltip title="View all prices">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handlePopoverOpen(e, prices, index, "price")}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </div>
                          {!item.variants?.length && <span>N/A</span>}
                        </div>
                        <Popover
                          open={Boolean(popoverAnchorEl) && popoverIndex === index && popoverType === "price"}
                          anchorEl={popoverAnchorEl}
                          onClose={handlePopoverClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                          }}
                        >
                          <div style={{ padding: "10px", maxWidth: "300px" }}>
                            <Typography variant="h6" style={{ fontSize: 14 }}>
                              All Prices
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 15 }}>
                              {popoverData.map((price, idx) => (
                                <li key={idx} style={{ fontSize: 12 }}>
                                  {price}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Popover>
                      </td>
                      <td style={bodyCell}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {item.category?.map((category, idx) => (
                            <Chip
                              key={category._id || idx}
                              label={category.name}
                              size="small"
                              style={{
                                backgroundColor: "#e0f7fa",
                                color: "#007bff",
                                fontSize: 12,
                              }}
                            />
                          ))}
                        </div>
                      </td>
                      <td style={bodyCell}>
                        <Switch
                          checked={publicStatus[item._id] || false}
                          onChange={() => handleSwitchChange(item._id)}
                          color="primary"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "green",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              backgroundColor: "green !important",
                            },
                            "& .MuiSwitch-track": {
                              backgroundColor: "red",
                              opacity: 1,
                            },
                          }}
                        />
                      </td>
                      <td style={bodyCell}>
                        <IconButton onClick={(e) => handleMenuOpen(e, index)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && menuIndex === index}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => navigate("/edit-product", { state: item })}>
                            Edit
                          </MenuItem>
                          <MenuItem onClick={() => handleDeleteProduct(item._id)}>Delete</MenuItem>
                        </Menu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ ...bodyCell, textAlign: "center" }}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              backgroundColor: currentPage === 1 ? "#ccc" : "#007bff",
              color: "white",
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 14,
            }}
          >
            Previous Page
          </Button>
          <span style={{ fontSize: 16 }}>
            Page {currentPage} of {totalPages} (Total: {totalItems} items)
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              backgroundColor: currentPage === totalPages ? "#ccc" : "#007bff",
              color: "white",
              padding: "8px 16px",
              borderRadius: 5,
              fontSize: 14,
            }}
          >
            Next Page
          </Button>
        </div>
      </div>
    </MDBox>
  );
}

export default ProductTable;

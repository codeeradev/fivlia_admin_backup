import React, { useEffect, useState } from "react";
import "./Demo.css";
import { useNavigate } from "react-router-dom";
import '../servicearea/Table.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MDBox from "components/MDBox";
import axios from "axios";
import Orders from "../Orders/Order";
import { useMaterialUIController, setMiniSidenav } from "context";
import {
  FaMoneyBillWave, FaStore, FaShoppingCart, FaBoxOpen, FaPercentage,
  FaUserFriends, FaTruck, FaCheck, FaShippingFast, FaClipboardCheck,
  FaTimes, FaExclamationCircle, FaClock, FaClipboardList,
} from "react-icons/fa";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get("https://api.fivlia.in/getDashboardStats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatAmount = (amount) => {
  if (typeof amount !== "number") amount = Number(amount);
  if (isNaN(amount)) return "0.00";

  return (Math.round(amount * 100) / 100).toFixed(2);
};

  useEffect(() => {
    const handleResize = () => {
      setMiniSidenav(dispatch, false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  function handleEdit() {
    alert("This is not editable at this moment");
  }

  function handleDelete() {
    alert("This is not editable at this moment");
  }

  const data = stats ? [
    { title: "Total Earnings", value: `₹${formatAmount(stats.totalRevenue)}`, color: "green", icon: <FaMoneyBillWave /> },
    { title: "Total Stores", value: stats.totalStores, color: "blue", icon: <FaStore /> },
    { title: "Total Orders", value: stats.totalOrdersMonthly, color: "yellow", icon: <FaShoppingCart /> },
    { title: "Total Items", value: stats.totalProducts, color: "lightgreen", icon: <FaBoxOpen /> },
    { title: "Total Clients", value: stats.totalUsers, color: "purple", icon: <FaUserFriends /> },
    { title: "Total Drivers", value: stats.totalDrivers, color: "indigo", icon: <FaTruck /> },
  ] : [];

  const orderStatus = stats ? [
    { label: "Order Completed", value: stats.completedOrdersMonthly, color: "green", icon: <FaClipboardCheck /> },
    { label: "Order Pending", value: stats.pendingOrdersMonthly, color: "orange", icon: <FaClock /> },
  ] : [];

  return (
    <MDBox 
      sx={{
        ml: { xs: 0, lg: "250px" },
        p: { xs: 1, sm: 1.5, md: 2 }
      }}
    >
      <div className="dashboard-container">
        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            <div className="card-grid">
              {data.map((item, index) => (
                <div
                  key={index}
                  className={`card ${item.color}`}
                  onClick={() => item.link && navigate(item.link)}
                >
                  <div className="card-header">
                    <div className="icon">{item.icon}</div>
                    <div>
                      <div className="card-title"><span style={{ color: 'black' }}>{item.title}</span></div>
                      <div className="card-value"><span style={{ color: 'black' }}>{item.value}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-grid">
              {orderStatus.map((status, index) => (
                <div key={index} className="status-card">
                  <div className="status-left">
                    <span className={`status-label ${status.color}`}>
                      {status.icon} {status.label}
                    </span>
                  </div>
                  <span className="status-value">{status.value}</span>
                </div>
              ))}
            </div>

            <div 
              style={{ 
                width: "100%", 
                marginTop: "-30px",
                overflowX: "auto"
              }}
            >
              <Orders isDashboard={true}/>
            </div>
              <div
                onClick={() => navigate("/orders")}
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "green",
                  marginTop: "8px",
                }}
              >
                View All Orders
              </div>
          </>
        )}
      </div>
    </MDBox>
  );
}

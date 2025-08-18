import React, { useEffect, useState } from "react";
import "./Wallet.css";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import MDBox from "components/MDBox";
import axios from "axios";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Wallet summary
        const walletRes = await axios.get("https://api.fivlia.in/walletAdmin");
        setWallet(walletRes.data);

        // Transactions
        const txnRes = await axios.get("https://api.fivlia.in/adminTranaction");
        const sortedTxns = txnRes.data.Tranaction
          .filter(txn => txn.createdAt) // ignore incomplete entries
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setTransactions(sortedTxns);
      } catch (err) {
        console.error("Failed to fetch wallet data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading wallet...</p>;

  // Calculate total credits/debits from transactions
  const totalCredits = transactions
    .filter(txn => txn.type === "Credit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  const totalDebits = transactions
    .filter(txn => txn.type === "Debit")
    .reduce((sum, txn) => sum + (txn.amount || 0), 0);

  return (
    <MDBox ml="250px" p={2}>
      <div className="wallet-dashboard-container">
        <div className="card-grid">
          <div className="card green">
            <div className="card-header">
              <div className="icon"><FaWallet /></div>
              <div>
                <div className="card-title">Wallet Balance</div>
                <div className="card-value">₹{wallet.totalCash.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="card blue">
            <div className="card-header">
              <div className="icon"><FaArrowDown /></div>
              <div>
                <div className="card-title">Total Credits</div>
                <div className="card-value">₹{totalCredits.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="card red">
            <div className="card-header">
              <div className="icon"><FaArrowUp /></div>
              <div>
                <div className="card-title">Total Debits</div>
                <div className="card-value">₹{totalDebits.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Store-wise totals */}
        <div className="card-grid" style={{ marginTop: "20px" }}>
          {wallet && wallet.storeTotals &&
            Object.entries(wallet.storeTotals).map(([storeId, amount]) => (
              <div key={storeId} className="card blue">
                <div className="card-header">
                  <div className="icon"><FaWallet /></div>
                  <div>
                    <div className="card-title">Store {storeId}</div>
                    <div className="card-value">₹{amount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Transactions */}
        <div className="transactions-section">
          <h3>Recent Transactions</h3>
          {transactions.length > 0 ? (
            <ul className="transaction-list">
              {transactions.map((txn, idx) => (
                <li key={idx} className={`txn ${txn.type.toLowerCase()}`}>
                  <span className="txn-icon">
                    {txn.type === "Credit" ? <FaArrowDown color="green" /> : <FaArrowUp color="red" />}
                  </span>
                  <span className="txn-details">
                    <strong>{txn.description}</strong><br/>
                    <small>Order ID: {txn.orderId || "-"}</small><br/>
                    <small>{new Date(txn.createdAt).toLocaleString()}</small>
                  </span>
                  <span className={`txn-amount ${txn.type.toLowerCase()}`}>
                    {txn.type === "Credit" ? "+" : "-"}₹{(txn.amount || 0).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions found</p>
          )}
        </div>
      </div>
    </MDBox>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@mui/material";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";

function AddPageForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;
  const navigate = useNavigate();
  const { id } = useParams(); // for edit mode

  useEffect(() => {
    if (id) {
      fetch(`${process.env.REACT_APP_API_URL}/getPage?${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.page) {
            setTitle(data.page.title || "");
            setSlug(data.page.slug || "");
            setContent(data.page.content || "");
          }
        })
        .catch((err) => console.error("Error fetching page:", err));
    }
  }, [id]);

  const handleSave = async () => {
  const pageData = { title, slug, content };

  try {
    const url = id
      ? `${process.env.REACT_APP_API_URL}/editPage/${id}` // edit
      : `${process.env.REACT_APP_API_URL}/addPage`;       // add

    const res = await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pageData),
    });

    const result = await res.json();
    if (res.ok) {
      alert(id ? "Page Updated!" : "Page Added!");
      navigate(-1);
    } else {
      alert(result.message || "Something went wrong");
    }
  } catch (error) {
    console.error("Save Error:", error);
    alert("Server error while saving the page");
  }
};


  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "40px" }}>
      <div className="city-container">
        <h2 style={{ textAlign: "center", color: "#1976d2", fontWeight: 500 }}>
          {id ? "EDIT PAGE" : "ADD NEW PAGE"}
        </h2>

        <div className="add-city-box">
          <div className="row-section">
            <div className="input-container">
              <label>
                Page Title <span style={{ marginLeft: "5px" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Page Title"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ backgroundColor: "white" }}
              />
            </div>

            <div className="input-container">
              <label>
                Page Slug <span style={{ marginLeft: "5px" }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Page Slug"
                className="input-field"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ backgroundColor: "white" }}
              />
            </div>
          </div>

          <div className="row-section">
            <div className="input-container" style={{ width: "100%" }}>
              <label>
                Page Content <span style={{ marginLeft: "5px" }}>*</span>
              </label>
              <ReactQuill
                value={content}
                onChange={setContent}
                style={{
                  backgroundColor: "white",
                  height: "300px",
                  marginBottom: "20px",
                }}
                placeholder="Write your page content here..."
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "30px",
              justifyContent: "center",
            }}
          >
            <Button
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              style={{
                backgroundColor: "gray",
                color: "white",
                width: "100px",
                height: "35px",
                borderRadius: "15px",
                fontSize: "15px",
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </MDBox>
  );
}

export default AddPageForm;

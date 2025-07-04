import React, { useEffect, useState } from "react";
import "./Addcategories.css";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const AddCategories = () => {
  const [name, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [type, setType] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [attribute, setAttribute] = useState([]);
  const [attributeArray, setAttributeArray] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [filterData, setFilterData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const navigate = useNavigate();

  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

  // filter related 
  const [filtertype, setFilterTypes] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterpopup, setFilterPopup] = useState(false);
  const [filterdropdown, setFilterDropdown] = useState(false);
  const [showfilterdropdown, setShowFilterDropdown] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [addFilterValue, setAddFilterValue] = useState("");
  const [filterValues, setFilterValues] = useState([]);
  const [selectedfilterarray, setSelectedFilterArray] = useState([]);
  const [allFilters, setAllFilters] = useState([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch("https://api.fivlia.in/getFilter");
        const data = await res.json();
        setFilterTypes(data);
      } catch (err) {
        console.error("Error fetching Filters:", err);
      }
    };
    fetchFilters();
  }, []);

  const handleFilterChange = (e) => {
    const filterId = e.target.value;
    setSelectedFilter(filterId);
    const selectedFilterObj = filtertype.find((f) => f._id === filterId);
    setFilterValues(selectedFilterObj?.Filter || []);
  };

  const handleFilterValueToggle = (valueId) => {
    setAllFilters((prev) => {
      const existingFilter = prev.find((f) => f._id === selectedFilter);
      if (existingFilter) {
        const updatedSelected = existingFilter.selected.includes(valueId)
          ? existingFilter.selected.filter((id) => id !== valueId)
          : [...existingFilter.selected, valueId];
        return prev.map((f) =>
          f._id === selectedFilter ? { ...f, selected: updatedSelected } : f
        );
      } else {
        return [...prev, { _id: selectedFilter, selected: [valueId] }];
      }
    });
    setSelectedFilterArray((prev) =>
      prev.includes(valueId)
        ? prev.filter((id) => id !== valueId)
        : [...prev, valueId]
    );
  };

  const handleFilter = async () => {
    try {
      const result = await fetch(`https://api.fivlia.in/addFilter`, {
        method: "POST",
        body: JSON.stringify({ Filter_name: filterName }),
        headers: { "Content-type": "application/json" },
      });
      if (result.status === 200) {
        alert("Filter Added Successfully");
        setFilterPopup(false);
        setFilterName("");
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleFilterType = async () => {
    if (!selectedFilter || !addFilterValue.trim()) {
      alert("Please select a filter and enter a value");
      return;
    }

    try {
      const result = await fetch(`https://api.fivlia.in/addFilter`, {
        method: "POST",
        body: JSON.stringify({
          _id: selectedFilter,
          Filter: [{ name: addFilterValue }],
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (result.status === 200) {
        alert("Filter Value Added Successfully");
        setShowFilterDropdown(false);
        setAddFilterValue("");
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveFilterValue = (valueId) => {
    setSelectedFilterArray((prev) => prev.filter((v) => v !== valueId));
  };

  const removeFilter = (filterId) => {
    setAllFilters((prev) => prev.filter((f) => f._id !== filterId));
  };

  useEffect(() => {
    const getMainCategory = async () => {
      try {
        const data = await fetch('https://node-m8jb.onrender.com/getMainCategory');
        if (data.status === 200) {
          const result = await data.json();
          setMainCategories(result.result);
          const allSubCategories = result.result.flatMap(cat => cat.subcat || []);
          setSubCategories(allSubCategories);
          console.log("Main ", result.result);
          console.log("Sub", allSubCategories);
        } else {
          console.log('Something Wrong');
        }
      } catch (err) {
        console.log(err);
      }
    };
    getMainCategory();

    const fetchAttribute = async () => {
      try {
        const res = await fetch("https://api.fivlia.in/getAttributes");
        const data = await res.json();
        setAttribute(data);
      } catch (err) {
        console.error("Error fetching attributes:", err);
      }
    };
    fetchAttribute();
  }, []);

  useEffect(() => {
    if (type === "Main Category") {
      const allAttributeNames = attribute.map(item => item.Attribute_name);
      setAttributeArray(allAttributeNames);
    } else {
      setAttributeArray([]);
    }
  }, [type, attribute]);

  useEffect(() => {
    if (type === "Main Category") {
      const filterNames = filterData.map(item => item.Filter_name);
      setSelectedFilters(filterNames);
    } else {
      setSelectedFilters([]);
    }
  }, [type, filterData]);



  useEffect(() => {
    const getFilter = async () => {
      try {
        const result = await fetch('https://api.fivlia.in/getFilter');
        const data = await result.json();
        if (data) {
          setFilterData(data)
        }
      }
      catch (err) {
        console.log(err);
      }
    }
    getFilter();
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async () => {
    if (
      !name ||
      !description ||
      !image ||
      !type ||
      (type === "Sub Category" && !mainCategoryId) ||
      (type === "Sub Sub-Category" && !subCategory)
    ) {
      alert("Please fill all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);
    if (type === "Sub Category") {
      formData.append("mainCategoryId", mainCategoryId);
    }
    if (type === "Sub Sub-Category") {
      formData.append("subCategoryId", subCategory);
    }
    formData.append("attribute", JSON.stringify(attributeArray || []));


    const selectedFilterObjects = filterData
      .filter(fd => selectedFilters.includes(fd.Filter_name)) // match selected names
      .map(fd => ({ _id: fd._id })); // only send filter_id

    formData.append("filter", JSON.stringify(selectedFilterObjects));

    // Main Category Add
    if (type === "Main Category") {
      try {
        const response = await fetch("https://node-m8jb.onrender.com/addMainCategory", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (response.status === 201) {
          alert("Category Added Successfully");
          console.log("Submitted Data:", result);
          navigate('/categories');
        } else {
          alert("Something went wrong");
          console.error("Server response:", result);
        }
      } catch (err) {
        console.error("Error while submitting:", err);
      }
    }
    // Add Sub Category
    else if (type === "Sub Category") {
      try {
        const result = await fetch('https://node-m8jb.onrender.com/addSubCategory', {
          method: "POST",
          body: formData,
        });
        if (result.status === 201) {
          alert('Success');
          console.log(result);
          navigate('/categories');
        } else {
          alert('Something Wrong');
        }
      } catch (err) {
        console.log(err);
      }
    }
    // Add Sub Sub-Category
    else {
      try {
        const result = await fetch('https://node-m8jb.onrender.com/addSubSubCategory', {
          method: "POST",
          body: formData,
        });
        if (result.status === 201) {
          alert('Success');
          navigate('/categories');
        }
      } catch (err) {
        console.log(err);
      }
    }

    // Reset form
    setCategoryName("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    setType("");
    setMainCategoryId("");
    setSubCategory("");
    setAttributeArray([]);
  };

  const handleTagRemove = (tagToRemove) => {
    setAttributeArray(attributeArray.filter(tag => tag !== tagToRemove));
  };

  const handleFilterRemove = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };


  return (
    <MDBox ml={miniSidenav ? "80px" : "250px"} p={2} sx={{ marginTop: "20px" }}>
      <div style={{
        width: "85%",
        margin: "0 auto",
        borderRadius: "10px",
        padding: "10px",
        border: '1px solid gray',
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "30px", fontWeight: 'bold', color: 'green' }}>ADD NEW CATEGORY</h2>

        {/* Category Name */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
          <div><label style={{ fontWeight: '500' }}>Category Name</label></div>
          <div style={{ width: "59.5%" }}>
            <input
              type="text"
              placeholder="Enter Category Name"
              value={name}
              onChange={(e) => setCategoryName(e.target.value)}
              style={{ border: '1px solid black', backgroundColor: 'white' }}
            />
          </div>
        </div>

        {/* Category Image */}
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: "20px" }}>
          <div><label style={{ fontWeight: '500' }}>Category Image</label></div>
          <div style={{ width: "36%" }}>
            <input type="file" accept="image/*" onChange={handleImageChange}
              style={{ border: '1px solid black', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginTop: "20px" }}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  marginTop: "-30px",
                  backgroundColor: "#ccc",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#666",
                }}
              >
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px" }}>
          <div><label style={{ fontWeight: '500' }}>Description</label></div>
          <div style={{ width: "59%", marginLeft: "45px" }}>
            <textarea
              placeholder="Enter Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", height: "100px", borderRadius: '10px', padding: '5px' }}
            />
          </div>
        </div>

        {/* Type */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px" }}>
          <div><label style={{ fontWeight: '500' }}>Type</label></div>
          <div style={{ width: "60%" }}>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginLeft: "30px", backgroundColor: 'white', border: '1px solid black' }}>
              <option value="">-- Select Type Of Category --</option>
              <option value="Main Category">Main Category</option>
              <option value="Sub Category">Sub Category</option>
              <option value="Sub Sub-Category">Sub Sub-Category</option>
            </select>
          </div>
        </div>

        {/* Main Category (only for Sub Category) */}
        {type === "Sub Category" && (
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px" }}>
            <div><label style={{ fontWeight: '500' }}>Select Main Category</label></div>
            <div style={{ width: "60%" }}>
              <select
                value={mainCategoryId}
                onChange={(e) => setMainCategoryId(e.target.value)}
                style={{ marginLeft: "-8px", backgroundColor: 'white', border: '1px solid black' }}
              >
                <option value="">-- Select Main Category --</option>
                {mainCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Sub Category (only for Sub Sub-Category) */}
        {type === "Sub Sub-Category" && (
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px" }}>
            <div><label style={{ fontWeight: '500' }}>Select Sub Category</label></div>
            <div style={{ width: "60%", marginLeft: '10px' }}>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                style={{ marginLeft: "-8px", backgroundColor: 'white', border: '1px solid black' }}
              >
                <option value="">-- Select Sub Category --</option>
                {subCategories.map((subcat) => (
                  <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="" id="filter-type">
          <span style={{ marginLeft: "20px", fontWeight: "bold", marginBottom: "10px" }}>
            Filters & Types
          </span>
          <div className="row-section">
            <div className="input-container">
              <label>
                Select Filter (Type){" "}
                <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
              </label>
              <select
                className="input-field"
                value={selectedFilter}
                onChange={handleFilterChange}
              >
                <option value="">--Select Filter--</option>
                {filtertype.map((filter) => (
                  <option key={filter._id} value={filter._id}>
                    {filter.Filter_name}
                  </option>
                ))}
              </select>

              <h3
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "green",
                  marginTop: "10px",
                  marginLeft: "5px",
                }}
                onClick={() => setFilterPopup(true)}
              >
                + ADD FILTER
              </h3>

              {filterpopup && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: 20,
                      borderRadius: 5,
                      minWidth: 300,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter Filter Name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <Button onClick={handleFilter}>Save</Button>
                      <Button onClick={() => setFilterPopup(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
                {allFilters.map((filter) => {
                  const filterName = filtertype.find((f) => f._id === filter._id)?.Filter_name || "Unnamed";
                  return (
                    <div
                      key={filter._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#e0e0e0",
                        padding: "6px 10px",
                        borderRadius: "20px",
                        fontSize: "14px",
                      }}
                    >
                      <span>{filterName}</span>
                      <button
                        onClick={() => removeFilter(filter._id)}
                        style={{
                          marginLeft: "8px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "red",
                          fontWeight: "bold",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="input-container">
              <label>
                Select Filter Value{" "}
                <span style={{ marginLeft: "5px", marginTop: "10px" }}> *</span>
              </label>
              <div style={{ position: "relative" }}>
                <button
                  className="input-field"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    backgroundColor: "white",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => setFilterDropdown(!filterdropdown)}
                >
                  {selectedfilterarray.length > 0
                    ? `${selectedfilterarray.length} value(s) selected`
                    : "--Select Filter Value--"}
                </button>
                {filterdropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      maxHeight: "150px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {filterValues.map((value) => (
                      <div
                        key={value._id}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid #eee",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            allFilters
                              .find((f) => f._id === selectedFilter)
                              ?.selected.includes(value._id) || false
                          }
                          onChange={() => handleFilterValueToggle(value._id)}
                          style={{ marginRight: "8px" }}
                        />
                        <span>{value.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h3
                style={{
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "green",
                  marginTop: "10px",
                  marginLeft: "5px",
                }}
                onClick={() => setShowFilterDropdown(true)}
              >
                + ADD FILTER VALUE
              </h3>

              {showfilterdropdown && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: 20,
                      borderRadius: 5,
                      minWidth: 300,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Enter filter value"
                      value={addFilterValue}
                      onChange={(e) => setAddFilterValue(e.target.value)}
                      style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                      <Button onClick={handleFilterType}>Save</Button>
                      <Button onClick={() => setShowFilterDropdown(false)}>Cancel</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
              minHeight: "30px",
              marginLeft: "20px",
              marginBottom: "20px",
            }}
          >
            {selectedfilterarray.map((valueId, index) => {
              const value = filterValues.find((v) => v._id === valueId);
              return value ? (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "6px 10px",
                    borderRadius: "20px",
                    fontSize: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <span>{value.name}</span>
                  <span
                    style={{ marginLeft: "5px", cursor: "pointer" }}
                    onClick={() => handleRemoveFilterValue(valueId)}
                  >
                    ×
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {type === "Main Category" && selectedFilters.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px", marginLeft: '15px' }}>
            <div><label style={{ fontWeight: '500' }}>Selected Filters</label></div>
            <div style={{
              backgroundColor: '',
              width: "61%",
              border: '1px solid black',
              minHeight: '45px',
              borderRadius: '10px',
              marginLeft: '5px'
            }}>
              {selectedFilters.map((filter, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "white",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    margin: "5px",
                    boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
                    marginLeft: '5px'
                  }}
                  title={filter}
                >
                  {filter}
                  <button
                    onClick={() => handleFilterRemove(filter)}
                    style={{
                      marginLeft: "8px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "20px",
                      lineHeight: "1",
                      color: "red",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}




        {type === "Main Category" ? (
          attributeArray.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "30px" }}>
              <div><label style={{ fontWeight: '500' }}>Selected Attributes</label></div>
              <div style={{
                backgroundColor: '',
                width: "60%",
                border: '1px solid black',
                minHeight: '45px',
                borderRadius: '10px'
              }}>
                {attributeArray.map((zone, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "white",
                      paddingLeft: '5px',
                      paddingRight: '5px',
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      margin: "5px",
                      boxShadow: "0 5px 5px rgba(0, 0, 0, 0.2)",
                    }}
                    title={zone}
                  >
                    {zone}
                    <button
                      onClick={() => handleTagRemove(zone)}
                      style={{
                        marginLeft: "5px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "20px",
                        lineHeight: "1",
                        color: "red",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : null}


        {/* Submit Button */}
        <div style={{ textAlign: "center" }}>
          <Button onClick={handleSubmit} style={{
            width: '80px', height: '40px', fontSize: "16px", marginTop: '10px',
            marginBottom: '20px', backgroundColor: '#00c853', color: 'white', borderRadius: '15px', marginRight: '50px', cursor: 'pointer'
          }}>
            SAVE
          </Button>
          <Button onClick={() => navigate(-1)} style={{
            width: '80px', height: '40px', fontSize: "16px", marginTop: '10px',
            marginBottom: '20px', backgroundColor: '#00c853', color: 'white', borderRadius: '15px', cursor: 'pointer'
          }}>
            BACK
          </Button>
        </div>
      </div>
    </MDBox>
  );
};

export default AddCategories;
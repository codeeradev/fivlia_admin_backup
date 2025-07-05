import React, { useEffect, useState } from "react";
import "./Addcategories.css";
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "components/loader/appSlice";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [controller] = useMaterialUIController();
  const { miniSidenav } = controller;

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
    dispatch(startLoading());
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
          dispatch(stopLoading());
          alert("Category Added Successfully");
          console.log("Submitted Data:", result);
          navigate('/categories');
        } else {
          dispatch(stopLoading());
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
          dispatch(stopLoading());
          alert('Success');
          console.log(result);
          navigate('/categories');
        } else {
          dispatch(stopLoading());
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
          dispatch(stopLoading());
          alert('Success');
          navigate('/categories');
        }
      } catch (err) {
        dispatch(stopLoading());
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
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import Switch from '@mui/material/Switch'; 
import { useNavigate } from 'react-router-dom';
import MDBox from "components/MDBox";
import { useMaterialUIController } from "context";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const navigate=useNavigate();
    const [controller] = useMaterialUIController();
      const { miniSidenav } = controller;

  useEffect(() => {
    const getCategories = async () => {
      const result = await fetch('https://node-m8jb.onrender.com/Getcategories');
      if (result.status === 200) {
        const json = await result.json();
        setCategories(json.result);
      }
    };
    getCategories();
  }, []);


 const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this location?");
        if (!confirmDelete) return;

        try {
            const result = await fetch(`https://node-m8jb.onrender.com/delete/${id}`, {
                method: "DELETE",
            });

            if (result.status === 200) {
                alert("Categories deleted successfully");
                setCategories(categories.filter((item) => item._id !== id));
            } else {
                alert("Something went wrong");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const AddCate=()=>{
        navigate('/addCategories')
    }

  return (
    <Box p={3} sx={{
      marginLeft:'250px'
    }}>
      <Typography variant="h6" gutterBottom>
       Categories Lists
      </Typography>

        {/* Add Category Button */}
        <Box
          sx={{
            position: 'absolute',
            top: '35px',
            right: '130px',
            zIndex: 1,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={AddCate}
            sx={{ fontSize: '14px', textTransform: 'none' ,borderRadius:5}}
          >
            Add Categories
          </Button>
        </Box>

      <Box
        position="relative"
        mt={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Box
          sx={{
            background: '#1A73E8',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '18px',
            width: '75%',
            maxWidth: '1000px',
            position: 'absolute',
            top: '-5',
            zIndex: 1,
            height: '35px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Categories Table
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            mt: 5,
            width: '90%',
            maxWidth: '1000px',
            marginTop: 5,
            border: '1px solid #ddd', // Border for the entire table
          }}  
        >
          <Table>
            <TableHead sx={{ backgroundColor: '#f8f9fa', height: 90 }}>
              <TableRow>
                {['NAME', 'ITEMS', 'PUBLIC', 'ACTION'].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '12px',
                      color: '#6c757d',
                      verticalAlign: 'bottom',
                      border: '1px solid #ddd', // Border for each column
                      width: heading === 'NAME' ? '45%' : heading === 'ITEMS' ? '15%' : heading === 'PUBLIC' ? '10%' : '15%',
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((item, index) => (
                <TableRow key={index}>
                  {/* NAME */}
                  <TableCell sx={{ width: '45%', border: '1px solid #ddd' }}>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={`${process.env.REACT_APP_IMAGE_LINK}${item.file}`}
                        sx={{ width: 36, height: 36, mr: 1.5 }}
                      />
                      <Typography fontWeight={500} fontSize="14px">
                        {item.name}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* ITEMS */}
                  <TableCell sx={{ width: '15%', border: '1px solid #ddd' }}>
                    <Typography fontWeight={500} fontSize="14px">
                      <Avatar
                        src={`${process.env.REACT_APP_IMAGE_LINK}${item.file}`}
                        sx={{ width: 36, height: 36, mr: 1.5 }}
                      />
                    </Typography>
                  </TableCell>

                  {/* PUBLIC */}
                  {/* <TableCell sx={{ width: '10%', border: '1px solid #ddd' }}>
                    <Switch
                      checked={item.publish}
                      onChange={() => handlePublishToggle(item._id, item.publish)}
                      color="primary"
                    />
                  </TableCell> */}

                  {/* ACTION */}
                  <TableCell sx={{ width: '15%', border: '1px solid #ddd' }}>
                    <Button size="small" sx={{ fontSize: '13px', textTransform: 'none',color:'black' }}>
                      Edit
                    </Button>
                    <Button size="small" sx={{ fontSize: '13px', textTransform: 'none',color:'black' }} onClick={() => handleDelete(item._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Categories;

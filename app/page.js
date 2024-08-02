'use client'
import Image from "next/image";
import { useState, useEffect, forwardRef} from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography, AppBar} from "@mui/material";
import { Unstable_NumberInput as BaseNumberInput } from '@mui/base/Unstable_NumberInput';
import { styled } from '@mui/system';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { collection, query, getDocs, setDoc, doc, deleteDoc, getDoc, where} from "firebase/firestore";

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import BeeHiveImg from "../assets/bee_hive_orange.png";




export default function Home() {
  // inside the parentheses of useSate is the default value
  // the first returned value is the variable with the default value
  // the second is the setter function for the variable
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')  
  const [itemCount, setItemCount] = useState(1)  
  const [searchName, setSearchName] = useState('')  
  // store a record of full inventory to come back after a search without need to query the database again
  const [fullInventory, setFullInventory] = useState([])

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push ({
          name: doc.id,
          ...doc.data()
        })
    })
    setFullInventory(inventoryList)
    setInventory(inventoryList)
  }

  const searchInventory = async (searchString) => {
    // const inventoryRef = collection(firestore, 'inventory')
    // const searchQuery = query(inventoryRef, where('__name__', '==', searchString.toLowerCase()))
    
    // const docs = await getDocs(searchQuery)
    // const searchResults = []
    
    // docs.forEach((doc) => {
    //   console.log("found 1");
    //   searchResults.push({
    //     name: doc.id,
    //     ...doc.data()
    //   })
    // })

    const searchResults = []
    fullInventory.forEach((item) => {
      if (item.name.includes(searchString)) {
        searchResults.push(item)
      }
    })

    setInventory(searchResults)
  }

  const reduceItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await deleteDoc(docRef)
    }
    await updateInventory()
  }

  const addItem = async (item, count) => {
    const docRef = doc(collection(firestore, 'inventory'), item.toLowerCase())
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + count})
    }
    else {
      await setDoc(docRef, {quantity: count})
    }
    await updateInventory()
  }

  // call the function whever the dependency list (second parameter)changes
  // when an empty list is given, useEffect will only call the function once
  // at the very beginning when the page loads
  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    // justifyContent centers horizontally, alignItems centers vertically
    <Box 
      width='100vw' 
      // height='100vh' 
      display='flex' 
      justifyContent='center' 
      alignItems='center' 
      gap={2}
      flexDirection={'column'}
      >
      <Modal open={open} onClose={handleClose}>
        <Box 
          position='absolute' 
          top='50%' 
          left='50%' 
          width={700} 
          bgcolor='white' 
          border='2px solid #000' 
          boxShadow={24} p={4} 
          display={'flex'} 
          flexDirection={'column'} 
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)'
            }}>
          <Typography variant="h6"> Add an Item </Typography>
          <Stack width='100%' direction='row' spacing={2} alignItems={'center'}>
            <Box width={200}>
              <Typography variant="p"> Item Name : </Typography>
            </Box>
            
            <TextField
              variant='outlined'
              // fullWidth
              size="small"
              label="Name"
              placeholder="Enter item name here ..."
              sx={{ width: '25ch' }}
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value)
              }}
            />
          </Stack>
          <Stack width='100%' direction='row' spacing={2} alignItems={'center'}>
            <Box width={200}>
              <Typography variant="p"> Item Count : </Typography>
            </Box>
            
            <NumberInput
              min={1}
              value={itemCount}
              onChange={(event, val) => {
                setItemCount(val)
              }}
            />
          </Stack>
          <Button
              variant="outlined"
              disabled={itemName === ''}
              onClick={()=>{
                addItem(itemName, itemCount)
                setItemName('')
                setItemCount(0)
                handleClose()
              }}
            >
              Add
            </Button>
        </Box>
      </Modal>
      {/* <Box 
        width='800px' 
        height='100px'
        bgcolor='#ADD8E6'
        display={'flex'}
        justifyContent='center' 
        alignItems='center' 
      >
        <Typography variant="h2" color='#333'>Inventory Management</Typography>
      </Box> */}

      
      
      <AppBar 
        position="fixed"
        sx={{ borderBottom: '3px solid #feba07',
              backgroundImage: 'linear-gradient(to right, #000000, #feba07)'
            }} 
        style={{display: 'inline-block'}}>
        <Image src={BeeHiveImg} alt='site_logo' height={60} width={60} style={{marginTop: '10px'}}/>
        <Typography 
          variant="h2" 
          color='#FFD700' 
          style={{display: 'inline-block'}} 
          paddingX={2}>
            Hive.it
        </Typography>
        <Typography variant="p" color='#FFD700'>Inventory Management System</Typography>
      </AppBar>

      <Box marginTop={20} width='60vw' alignItems={'center'} justifyContent={'center'}>
        <StyledTextField
          variant='outlined'
          sx={{ marginRight: 3, width: '80%' }}
          size="small"
          label="Search"
          placeholder="Enter item name here ..."
          value={searchName}
          onChange={(e) => {
            // if user deleted everything in searchbox then go back to full list 
            if (e.target.value == '') {
              setInventory(fullInventory)
            }
            setSearchName(e.target.value);
          }}
        />
        <Button variant='outlined' onClick={() => searchInventory(searchName)}>
          Search
        </Button>
      </Box>

      <Paper sx={{ width: '80%', overflow: 'hidden'}} elevation={3}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                  <TableCell key='name' align="left" style={{ minWidth: 300 }}>
                    <Typography variant="h6" color='#333'>Item Name</Typography>
                  </TableCell>
                  <TableCell key='name' align="center" style={{ minWidth: 300 }}>
                    <Typography variant="h6" color='#333'>Count</Typography>
                  </TableCell>
                  <TableCell key='name' align="right" style={{ minWidth: 300 }}>
                    <Typography variant="h6" color='#333'>Actions</Typography>
                  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(({name, quantity}) => {
                  return (
                    <StyledTableRow hover={true} key={name}>
                      <TableCell>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </TableCell>
                      <TableCell align="center">
                        {quantity}
                      </TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={2} justifyContent={'flex-end'}>
                          <StyledButton onClick={() => addItem(name, 1)}>
                            <AddIcon/>
                          </StyledButton>
                          <StyledButton onClick={() => reduceItem(name)}>
                            <RemoveIcon/>
                          </StyledButton>
                          <StyledButton onClick={() => deleteItem(name)}>
                            <DeleteForeverIcon/>
                          </StyledButton>
                        </Stack>
                      </TableCell>
                    </StyledTableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={Math.ceil(inventory.length / rowsPerPage)}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>





      {/* <Box border='1px solid #333'>
        <Stack
          width='80vw'
          height='500px'
          // spacing={2}
          overflow='auto'
        >
          {
            inventory.map(({name, quantity}) => (
              <StyledBox 
                key={name}
                width='100%'
                minHeight='50px'
                display={'flex'}
                alignItems='center'
                justifyContent='space-between'
                // bgcolor='#e9ddb6'
                padding={5}
              >
                <Typography
                  variant="h6"
                  color='#333'
                  textAlign='center'>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                  variant="h6"
                  color='#333'
                  textAlign='center'>
                    {quantity}
                </Typography>
                <Stack direction='row' spacing={2} alignItems={'center'}>
                  <StyledButton variant='contained' onClick={() => addItem(name, 1)}>
                    <AddIcon/>
                  </StyledButton>
                  <StyledButton variant='contained' onClick={() => reduceItem(name)}>
                    <RemoveIcon/>
                  </StyledButton>
                  <StyledButton variant='contained' onClick={() => deleteItem(name)}>
                    <DeleteForeverIcon/>
                  </StyledButton>
                </Stack>
              </StyledBox>
            ))
          }
        </Stack>
      </Box> */}

      <Button
        variant="outlined"
        // sx={{marginTop: 10}}
        // paddingX='10px'
        onClick={() => {
          handleOpen()
        }}
      >
        Add New Item
      </Button>
    </Box>
  );
}


// customize number input 
const NumberInput = forwardRef(function CustomNumberInput(props, ref) {
  return (
    <BaseNumberInput
      slots={{
        root: StyledInputRoot,
        input: StyledInput,
        incrementButton: StyledButton,
        decrementButton: StyledButton,
      }}
      slotProps={{
        incrementButton: {
          children: <AddIcon fontSize="small" />,
          className: 'increment',
        },
        decrementButton: {
          children: <RemoveIcon fontSize="small" />,
        },
      }}
      {...props}
      ref={ref}
    />
  );
});

const blue = {
  100: '#fdf5da',
  200: '#fae291',
  300: '#f9db79',
  400: '#f8d560',
  500: '#f7ce48',
  600: '#f6c730',
  700: '#f5c117',
  800: '#e8b40a',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const StyledInputRoot = styled('div')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[500]};
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
`,
);

const StyledInput = styled('input')(
  ({ theme }) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.375;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 4px ${
    theme.palette.mode === 'dark' ? 'rgba(0,0,0, 0.5)' : 'rgba(0,0,0, 0.05)'
  };
  border-radius: 8px;
  margin: 0 8px;
  padding: 10px 12px;
  outline: 0;
  min-width: 0;
  width: 10rem;
  text-align: center;

  &:hover {
    border-color: ${blue[400]};
  }

  &:focus {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 3px ${theme.palette.mode === 'dark' ? blue[700] : blue[200]};
  }

  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledButton = styled('button')(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  line-height: 1.5;
  border: 1px solid;
  border-radius: 999px;
  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  width: 32px;
  height: 32px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? blue[700] : blue[500]};
    border-color: ${theme.palette.mode === 'dark' ? blue[500] : blue[400]};
    color: ${grey[50]};
  }

  &:focus-visible {
    outline: 0;
  }

  &.increment {
    order: 1;
  }
`,
);

// make the background color in the table different for odd number and even number rows
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "#fad9c4 !important"
  },
  '&:nth-of-type(odd)': {
    backgroundColor: "#f5efdd",
  },
  '&:nth-of-type(even)': {
    backgroundColor: "#f9f9f9",
  },
  
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  root: {
    '& label': {
      color: 'red',
    },
    '& label.Mui-focused': {
      color: 'white',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'yellow',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'yellow',
      },
    },
  },
}));
import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { MenuItem, Select } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from "@mui/material/CircularProgress";
import { Container, Paper, Box } from "@mui/material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CloseIcon from "@mui/icons-material/Close";
import Toolbar from "@mui/material/Toolbar";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../layouts/AdminSidebar";
import { Typography } from "@mui/material";
import AuthUser from "../AuthUser";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { format } from "date-fns";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

const Payements = () => {
  const [payments, setPayments] = useState([]);
  const { getToken, clearToken } = AuthUser();
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = useState({ status: "", alert: "" });
  const [errors, setErrors] = useState({});
  const [drivers, setDrivers] = useState([]);
  const BASE_URL = process.env.REACT_APP_BASE_URL;
  const [loading, setLoading] = React.useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
    setDeleteAlertOpen(false);
  };

  const navigate = useNavigate();
  const [newPayemnt, setNewpayment] = useState({
    paymentID: "",
    amount: "",
    driverID: "",
    paymentDate: "",
    createdAt: "",
    updatedAt: "",
    remarks: "",
    rideIds: [],
  });

  const paymentColumns = [
    { field: "paymentID", headerName: "Payment ID", width: 200 },
    { field: "amount", headerName: "Amount($)", width: 100 },
    { field: "driverID", headerName: "Driver ID", width: 100 },
    {
      field: "Driver",
      headerName: "Driver Name",
      valueGetter: (params) => {
        const driver = drivers.find(
          (driver) => driver.driverID === params.row.driverID
        );
        return driver
          ? driver.driverFirstName + " " + driver.driverLastName
          : "";
      },
    },
    {
      field: "paymentDate",
      headerName: "Payment Date",
      width: 200,
      valueFormatter: (params) =>
        format(new Date(params.value), "MMMM d, yyyy hh:mm a"),
    },
    { field: "remarks", headerName: "Remarks", width: 200 },
    { field: "rideIds", headerName: "Ride IDs", width: 200 },
    {
      field: "edit",
      headerName: "Edit",
      sortable: false,
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleEditRow(params.id)}>
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      sortable: false,
      width: 80,
      disableClickEventBubbling: true,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleDeleteRow(params.id)}>
          <DeleteForeverIcon />
        </IconButton>
      ),
    },
  ];
  async function fetchData() {
    setLoading(true);
    axios({
      baseURL: BASE_URL,
      url: "/admin/getAllPayments",
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      timeout: 2000,
    })
      .then((response) => {
        setPayments(response.data.data);
        console.log("response.data Payements", response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.code === "ECONNABORTED") {
          console.log("Request timed out");
          setAlertMessage({
            status: "error",
            alert: "Server timeout..!",
          });
          setAlertOpen(true);
          setLoading(false);
        } else if (
          error.response.data.error === "Unauthorized" &&
          error.response.data.message === "Invalid token"
        ) {
          clearToken();
        } else {
          setAlertMessage({
            status: "error",
            alert: error.response.data.message,
          });
          setAlertOpen(true);
          setLoading(false);
        }
      });
  }

  useEffect(() => {
    if (getToken() === null) {
      navigate("/AdminLogin");
    }
    fetchData();
    axios({
      baseURL: BASE_URL,
      url: "/admin/drivers",
      method: "get",
      headers: {
        Authorization: getToken(),
      },
      timeout: 2000,
    })
      .then((response) => {
        console.log("response.data", response.data);
        setDrivers(response.data.data);
      })
      .catch((error) => {
        if (error.code === "ECONNABORTED") {
          console.log("Request timed out");
        } else if (
          error.response.data.error === "Unauthorized" &&
          error.response.data.message === "Invalid token"
        ) {
          clearToken();
        } else {
          console.log(error.response.data.message);
        }
      });
  }, []);

  const [isEditMode, setIsEditMode] = useState(false);
  const handleAddPayment = () => {
    setIsEditMode(false);
    setNewpayment({
      paymentID: "",
      amount: "",
      driverID: "",
      paymentDate: "",
      createdAt: "",
      updatedAt: "",
      remarks: "",
      rideIds: [],
    });
    functionopenpopup();
  };
  const functionopenpopup = () => {
    openchange(true);
  };

  const closepopup = () => {
    openchange(false);
    setDeleteAlertOpen(false);
  };
  const [open, openchange] = useState(false);
  const handleChange = (event) => {
    event.preventDefault();
    setNewpayment({ ...newPayemnt, [event.target.name]: event.target.value });
  };
  function isValidPositiveDecimal(str) {
    const numericValue = parseFloat(str);
    return !isNaN(numericValue) && isFinite(numericValue) && numericValue > 0;
  }
  const validateForm = () => {
    let valid = true;
    const newErrors = {};
    if (!newPayemnt.driverID) {
      valid = false;
      newErrors.driverID = "driverID is required";
    }
    if (newPayemnt.amount === "") {
      valid = false;
      newErrors.amount = "Amount is required";
    } else if (!isValidPositiveDecimal(newPayemnt.amount)) {
      valid = false;
      newErrors.amount = "Amount should be valid and greater than zero";
    }
    setErrors(newErrors);
    return valid;
  };

  const handleFetch = (event) => {
    event.preventDefault();
    if (newPayemnt.driverID !== "") {
      axios({
        baseURL: BASE_URL,
        url: `/admin/driverTotalAmountCalculate`,
        method: "post",
        data: {
          driverId: newPayemnt.driverID,
          startDate: String(startDate),
          endDate: String(endDate),
        },

        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
      })
        .then((response) => {
          newPayemnt.amount = response.data.data.totalAmount;
          newPayemnt.rideIds = response.data.data.rideIds;
          setAlertMessage({
            status: "success",
            alert: "Successfully Calculated...!",
          });
          setAlertOpen(true);
        })
        .catch((error) => {
          if (error.code === "ECONNABORTED") {
            console.log("Request timed out");
            setAlertMessage({
              status: "error",
              alert: "Payment not Calculated, Server timeout.!",
            });
            setAlertOpen(true);
            setLoading(false);
          } else if (
            error.response.data.error === "Unauthorized" &&
            error.response.data.message === "Invalid token"
          ) {
            clearToken();
          } else {
            setAlertMessage({
              status: "error",
              alert: error.response.data.message,
            });
            setAlertOpen(true);
            setLoading(false);
          }
        });
    } else {
      console.log("validation failed");
      setAlertMessage({
        status: "error",
        alert: "Please fill correct details, and  try Again..!",
      });
      setAlertOpen(true);
      setLoading(false);
    }
  };

  const handleDelete = (event) => {
    event.preventDefault();
    setLoading(true);
    axios({
      baseURL: BASE_URL,
      url: `/admin/deletePayment/${newPayemnt.paymentID}`,
      method: "post",
      data: {
        paymentId: newPayemnt.paymentID,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: getToken(),
      },
      timeout: 5000,
    })
      .then((response) => {
        setAlertMessage({
          status: "success",
          alert: "Payment Deleted succesfully..!",
        });
        setAlertOpen(true);
        closepopup();
        fetchData();
        setLoading(false);
        setDeleteAlertOpen(false);
      })
      .catch((error) => {
        if (error.code === "ECONNABORTED") {
          console.log("Request timed out");
          setAlertMessage({
            status: "error",
            alert: "Unable to Delete Payment, Server timeout.!",
          });
          setAlertOpen(true);
          setLoading(false);
        } else if (
          error.response.data.error === "Unauthorized" &&
          error.response.data.message === "Invalid token"
        ) {
          clearToken();
        } else {
          console.log("error", error);
          console.log("error.data", error.response);
          setAlertMessage({
            status: "error",
            alert: error.response.data.message,
          });
          setAlertOpen(true);
          setLoading(false);
        }
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isEditMode) {
      if (validateForm()) {
        setLoading(true);
        axios({
          baseURL: BASE_URL,
          url: `/admin/payments/${newPayemnt.paymentID}`,
          method: "post",
          data: {
            driverId: newPayemnt.driverID,
            amount: String(newPayemnt.amount),
            remarks: newPayemnt.remarks,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
        })
          .then((response) => {
            setAlertMessage({
              status: "success",
              alert: "Payment Editted succesfully..!",
            });
            setAlertOpen(true);
            closepopup();
            fetchData();
            setLoading(false);
          })
          .catch((error) => {
            if (error.code === "ECONNABORTED") {
              console.log("Request timed out");
              setAlertMessage({
                status: "error",
                alert: "Payment Editted unsuccesfully, Server timeout.!",
              });
              setAlertOpen(true);
              setLoading(false);
            } else if (
              error.response.data.error === "Unauthorized" &&
              error.response.data.message === "Invalid token"
            ) {
              clearToken();
            } else {
              setAlertMessage({
                status: "error",
                alert: error.response.data.message,
              });
              setAlertOpen(true);
              setLoading(false);
            }
          });
      } else {
        console.log("validation failed");
        setAlertMessage({
          status: "error",
          alert: "Please fill correct details, and  try Again..!",
        });
        setAlertOpen(true);
        setLoading(false);
      }
    } else {
      if (validateForm()) {
        setLoading(true);
        axios({
          baseURL: BASE_URL,
          url: "/admin/createPayment",
          method: "post",
          data: {
            driverId: newPayemnt.driverID,
            totalAmount: String(newPayemnt.amount),
            feedBack: newPayemnt.remarks,
            rideIds: newPayemnt.rideIds,
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          timeout: 5000,
        })
          .then((response) => {
            setAlertMessage({
              status: "success",
              alert: "Payment submitted succesfully..!",
            });
            setAlertOpen(true);
            closepopup();
            fetchData();
            setLoading(false);
          })
          .catch((error) => {
            if (error.code === "ECONNABORTED") {
              console.log("Request timed out");
              setAlertMessage({
                status: "error",
                alert: "Unable to edit Payment, Server timeout.!",
              });
              setAlertOpen(true);
              setLoading(false);
            } else if (
              error.response.data.error === "Unauthorized" &&
              error.response.data.message === "Invalid token"
            ) {
              clearToken();
            } else {
              console.log("error", error);
              console.log("error.data", error.response);
              setAlertMessage({
                status: "error",
                alert: error.response.data.message,
              });
              setAlertOpen(true);
              setLoading(false);
            }
          });
      } else {
        console.log("validation failed");
        setAlertMessage({
          status: "error",
          alert: "Please fill correct details, and  try Again..!",
        });
        setAlertOpen(true);
        setLoading(false);
      }
    }
  };

  const handleEditRow = (id) => {
    // Implement your edit logic here
    setIsEditMode(true);
    const pays = payments.filter((pay) => pay.paymentID === id)[0];
    if (pays === null) {
      alert("Id is not found");
    }
    setNewpayment({
      paymentID: pays.paymentID,
      amount: pays.amount,
      driverID: pays.driverID,
      paymentDate: pays.paymentDate,
      createdAt: pays.createdAt,
      updatedAt: pays.updatedAt,
      remarks: pays.remarks,
      rideIds: pays.rideIds,
    });
    functionopenpopup();
  };

  const handleDeleteRow = (id) => {
    // Implement your edit logic here
    setIsEditMode(true);
    setDeleteAlertOpen(true);
    const pays = payments.filter((pay) => pay.paymentID === id)[0];
    if (pays === null) {
      alert("Id is not found");
    }
    setNewpayment({
      paymentID: pays.paymentID,
      amount: pays.amount,
      driverID: pays.driverID,
      paymentDate: pays.paymentDate,
      createdAt: pays.createdAt,
      updatedAt: pays.updatedAt,
      remarks: pays.remarks,
      rideIds: pays.rideIds,
    });
    functionopenpopup();
  };

  const handleStatusChange = (newStatus) => {
    setNewpayment({
      ...newPayemnt,
      driverID: newStatus.driverID,
    });
  };

  return (
    <>
      <AdminSidebar />
      <Typography variant="h3" sx={{ marginBottom: "12px", color: "#004080" }}>
        Payment Details
      </Typography>
      <div>
        <Dialog
          // fullScreen
          open={open}
          onClose={closepopup}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Payement Details{" "}
            <IconButton onClick={closepopup} style={{ float: "right" }}>
              <CloseIcon color="primary"></CloseIcon>
            </IconButton>{" "}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} margin={2}>
              {isEditMode === true ? (
                <>
                  <TextField
                    label="Payment ID"
                    name="paymentID"
                    value={newPayemnt.paymentID}
                    onChange={(event) => handleChange(event)}
                    disabled={true}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    error={Boolean(errors.paymentID)}
                    helperText={errors.paymentID}
                  />
                  <TextField
                    label="Driver ID"
                    name="driverID"
                    value={newPayemnt.driverID}
                    disabled={true}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    error={Boolean(errors.driverID)}
                    helperText={errors.driverID}
                  />
                  <TextField
                    label="Amount($)"
                    name="amount"
                    value={newPayemnt.amount}
                    onChange={(event) => handleChange(event)}
                    error={Boolean(errors.amount)}
                    helperText={errors.amount}
                  />

                  <TextField
                    label="Remarks"
                    name="remarks"
                    value={newPayemnt.remarks}
                    onChange={(event) => handleChange(event)}
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks}
                  />
                  <TextField
                    label="Remarks"
                    name="remarks"
                    value={newPayemnt.rideIds}
                    onChange={(event) => handleChange(event)}
                    disabled={true}
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks}
                  />
                  {deleteAlertOpen ? (
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={(event) => handleDelete(event)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={(event) => handleSubmit(event)}
                    >
                      Submit
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <FormControl>
                    <InputLabel>Driver Name</InputLabel>
                    <Select
                      label="Driver Name"
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      {drivers &&
                        drivers.map((driver) => (
                          <MenuItem key={driver.driverID} value={driver}>
                            {driver.driverFirstName +
                              " " +
                              driver.driverLastName}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    sx={{ marginRight: 2, width: 200 }} // Adjust width as needed
                    InputLabelProps={{ shrink: true }} // Ensure label doesn't overlap
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    sx={{ marginRight: 2, width: 200 }} // Adjust width as needed
                    InputLabelProps={{ shrink: true }} // Ensure label doesn't overlap
                  />
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={(event) => handleFetch(event)}
                  >
                    Fetch Payment
                  </Button>
                  <TextField
                    label="Amount"
                    name="amount"
                    value={newPayemnt.amount}
                    onChange={(event) => handleChange(event)}
                    error={Boolean(errors.amount)}
                    helperText={errors.amount}
                  />
                  <TextField
                    label="Remarks"
                    name="remarks"
                    value={newPayemnt.remarks}
                    onChange={(event) => handleChange(event)}
                    error={Boolean(errors.remarks)}
                    helperText={errors.remarks}
                  />
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={(event) => handleSubmit(event)}
                  >
                    Submit
                  </Button>
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>
      </div>

      <div style={{ height: "80%", width: "100%" }}>
        {loading ? (
          <Container sx={{ marginTop: "15rem" }}>
            <CircularProgress />
          </Container>
        ) : (
          <Container>
            <Toolbar />
            <Box
              m={1}
              //margin
              display="flex"
              justifyContent="flex-end"
              alignItems="flex-end"
              // sx={boxDefault}
            >
              <Button
                // onClick={functionopenpopup}
                onClick={(event) => handleAddPayment(event)}
                color="primary"
                variant="contained"
                sx={{ height: 40 }}
                startIcon={<MonetizationOnIcon />}
              >
                Add Payment
              </Button>
            </Box>

            <Paper component={Box} width={1} height={700}>
              <DataGrid
                rows={payments}
                columns={paymentColumns}
                pageSize={5}
                getRowId={(payments) => payments.paymentID}
                // checkboxSelection
                // onEditCellChangeCommitted={handleEditCellChange}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </Paper>
          </Container>
        )}
      </div>
      <div>
        <Snackbar
          open={alertOpen}
          autoHideDuration={6000}
          onClose={handleAlertClose}
        >
          <Alert
            onClose={handleAlertClose}
            severity={alertMessage.status}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {typeof alertMessage.alert === "object"
              ? JSON.stringify(alertMessage.alert)
              : alertMessage.alert}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default Payements;

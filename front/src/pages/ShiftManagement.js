import React, { useState } from "react";
import axios from "axios";

const ShiftManagement = () => {
  const [message, setMessage] = useState("");

  const startShift = async () => {
    try {
      const response = await axios.post("/api/v1/users/start-shift");
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error starting shift");
    }
  };

  const endShift = async () => {
    try {
      const response = await axios.post("/api/v1/users/end-shift");
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error ending shift");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Shift Management</h2>
      <button onClick={startShift} style={{ marginRight: "10px" }}>
        Start Shift
      </button>
      <button onClick={endShift}>End Shift</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ShiftManagement;

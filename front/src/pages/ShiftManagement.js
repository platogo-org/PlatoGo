import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const ShiftManagement = () => {
  const [message, setMessage] = useState("");
  const [shifts, setShifts] = useState([]);
  const [shiftActive, setShiftActive] = useState(false);
  const { user, setUser } = useAuth();

  // Fetch user shifts and shift status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/users/me");
        // Ajusta la destructuración según la respuesta real
        const userData =
          response.data.data.data || response.data.data.user || {};
        setShifts(userData.shifts || []);
        setShiftActive(!!userData.shiftStart);
        if (setUser) setUser(userData);
      } catch (error) {
        setMessage("Error fetching user info");
      }
    };
    fetchUser();
  }, [setUser]);

  const startShift = async () => {
    console.log("Start shift clicked");
    try {
      const response = await axios.post("/users/start-shift");
      console.log("Shift response:", response);
      setMessage(response.data.message);
      setShiftActive(true);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error starting shift");
      console.error(error);
    }
  };

  const endShift = async () => {
    console.log("End shift clicked");
    try {
      const response = await axios.post("/users/end-shift");
      console.log("End shift response:", response);
      setMessage(response.data.message);
      setShiftActive(false);
      // Refetch shifts after ending shift
      const userRes = await axios.get("/users/me");
      const userData = userRes.data.data.data || userRes.data.data.user || {};
      setShifts(userData.shifts || []);
      if (setUser) setUser(userData);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error ending shift");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Shift Management</h2>
      <button
        onClick={startShift}
        style={{ marginRight: "10px" }}
        disabled={shiftActive}
      >
        Start Shift
      </button>
      <button onClick={endShift} disabled={!shiftActive}>
        End Shift
      </button>
      {message && <p>{message}</p>}
      <h3>My Shifts</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Date</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Start</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>End</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Duration (min)
            </th>
          </tr>
        </thead>
        <tbody>
          {shifts.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                No shifts yet
              </td>
            </tr>
          ) : (
            shifts.map((shift, idx) => (
              <tr key={idx}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {new Date(shift.date).toLocaleDateString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {new Date(shift.start).toLocaleTimeString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {new Date(shift.end).toLocaleTimeString()}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {shift.duration}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftManagement;

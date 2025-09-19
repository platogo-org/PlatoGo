import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantAdminDashboard = () => {
  const { user, logout } = useAuth();
  const token = useMemo(() => localStorage.getItem('token') || '(no token)', []);

  return (
    <div style={{ fontFamily: 'monospace', padding: '16px' }}>
      <h2>Restaurant Admin</h2>
      <button onClick={logout} style={{ marginBottom: '16px' }}>Logout</button>
      <div>
        <strong>User JSON:</strong>
        <pre style={{ background:'#f4f4f4', padding:'12px', overflowX:'auto' }}>
{JSON.stringify(user, null, 2)}
        </pre>
      </div>
      <div>
        <strong>Token:</strong>
        <pre style={{ background:'#f4f4f4', padding:'12px', overflowX:'auto' }}>
{token}
        </pre>
      </div>
    </div>
  );
};

export default RestaurantAdminDashboard;
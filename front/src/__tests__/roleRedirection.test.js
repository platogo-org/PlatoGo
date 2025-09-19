import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';

// Simple component to test login logic
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Simple test component that uses auth
const TestLoginComponent = () => {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [result, setResult] = React.useState(null);

  const handleLogin = async () => {
    const loginResult = await login(email, password);
    setResult(loginResult);
  };

  return (
    <div>
      <input 
        data-testid="email"
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        placeholder="Email"
      />
      <input 
        data-testid="password"
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="Password"
      />
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Loading...' : 'Login'}
      </button>
      {error && <div data-testid="error">{error}</div>}
      {result && (
        <div data-testid="result">
          {result.success ? `Success: ${result.user?.role}` : `Failed: ${result.error}`}
        </div>
      )}
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <AuthProvider>
      <TestLoginComponent />
    </AuthProvider>
  );
};

describe('Authentication and Role Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('should handle invalid credentials error', async () => {
    // Mock failed login response
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Incorrect Email or Password'
        }
      }
    });

    renderWithProvider();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'invalid@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Incorrect Email or Password');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/users/login', {
      email: 'invalid@email.com',
      password: 'wrongpassword'
    });
  });

  test('should successfully authenticate super admin', async () => {
    // Mock successful login response for super admin
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        token: 'fake-jwt-token',
        data: {
          user: {
            _id: '123',
            name: 'Super Admin',
            email: 'superadmin@platogo.com',
            role: 'super-admin'
          }
        }
      }
    });

    renderWithProvider();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'superadmin@platogo.com' } });
    fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Success: super-admin');
    });

    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
  });

  test('should successfully authenticate restaurant admin', async () => {
    // Mock successful login response for restaurant admin
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        token: 'fake-jwt-token-restaurant',
        data: {
          user: {
            _id: '456',
            name: 'Restaurant Admin',
            email: 'restaurant@platogo.com',
            role: 'restaurant-admin'
          }
        }
      }
    });

    renderWithProvider();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'restaurant@platogo.com' } });
    fireEvent.change(passwordInput, { target: { value: 'validpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('Success: restaurant-admin');
    });

    expect(localStorage.getItem('token')).toBe('fake-jwt-token-restaurant');
  });

  test('should show loading state during authentication', async () => {
    // Mock delayed response
    mockedAxios.post.mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          data: {
            status: 'success',
            token: 'token',
            data: { user: { role: 'super-admin' } }
          }
        }), 100)
      )
    );

    renderWithProvider();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  test('should handle network errors gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    renderWithProvider();

    const emailInput = screen.getByTestId('email');
    const passwordInput = screen.getByTestId('password');
    const loginButton = screen.getByRole('button');

    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Login failed');
    });
  });
});
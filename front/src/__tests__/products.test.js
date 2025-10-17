import React from 'react';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import axios from 'axios';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

jest.mock('axios');

describe('Products UI integration (mocked axios)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('lists products and allows creating a product', async () => {
    // Mock GET /product
    axios.get.mockResolvedValueOnce({ data: { data: [
      { _id: '1', nombre: 'Pizza', costo: 10, active: true },
      { _id: '2', nombre: 'Ensalada', costo: 5, active: false }
    ] } });

    render(<ProductList onEdit={() => {}} />);

    expect(screen.getByText(/Loading products/i)).toBeInTheDocument();

  await waitFor(() => expect(axios.get).toHaveBeenCalled());

  // Wait for loading to disappear and list to render
  await waitFor(() => expect(screen.queryByText(/Loading products/i)).not.toBeInTheDocument());
  expect(screen.getByText('Pizza')).toBeInTheDocument();
  expect(screen.getByText(/inactivo/i)).toBeInTheDocument();

  // Now test creating via ProductForm
    axios.post.mockResolvedValueOnce({ data: { data: { _id: '3', nombre: 'Sopa', costo: 4 } } });

    const onSaved = jest.fn();
    render(<ProductForm onSaved={onSaved} onCancel={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'Sopa' } });
    fireEvent.change(screen.getByLabelText(/Costo/i), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/Restaurant/i), { target: { value: 'rest1' } });

    fireEvent.click(screen.getByText(/Guardar/i));

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/product', { nombre: 'Sopa', costo: 4, restaurant: 'rest1' }));
    expect(onSaved).toHaveBeenCalled();

  // Mock delete call and ensure ProductList refresh
  // Use a persistent mock for subsequent GETs to avoid missing mocks
  axios.get.mockResolvedValue({ data: { data: [ { _id: '1', nombre: 'Pizza', costo: 10, active: true } ] } });
  axios.delete.mockResolvedValueOnce({ status: 204 });

  // clean up previous renders to avoid multiple mounted lists
  cleanup();
  render(<ProductList onEdit={() => {}} />);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  const deactivateBtns = screen.getAllByText('Desactivar');
  fireEvent.click(deactivateBtns[0]);
  await waitFor(() => expect(axios.delete).toHaveBeenCalled());
  // After delete, ProductList should refresh the list (another GET)
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });
});

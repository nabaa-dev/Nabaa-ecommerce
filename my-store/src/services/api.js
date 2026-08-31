// ==============================
// API Service Layer
// Base URL: http://localhost:5000/api/products
// ==============================

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const API_URL = rawApiUrl.replace(/\/$/, '');
const BASE_URL = `${API_URL}/products`;

// Helper function for consistent error handling
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
  }
  return response.json();
}

// GET - Fetch all products
export async function getAllProducts() {
  const response = await fetch(BASE_URL);
  return handleResponse(response);
}

// GET - Fetch single product by ID
export async function getProductById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  return handleResponse(response);
}

// POST - Create new product
export async function createProduct(productData) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
}

// PUT - Update existing product
export async function updateProduct(id, productData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
}

// DELETE - Delete a product
export async function deleteProduct(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

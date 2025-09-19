import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  details: string;
}

const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  // Form states for adding/editing products
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('');
  const [productImageUrl, setProductImageUrl] = useState<string>(''); // This will store the URL for display/submission
  const [productDetails, setProductDetails] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null); // New state for the file object

  // Check for authentication token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchProducts(token);
    }
  }, [navigate]);

  // Effect to pre-fill form when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name);
      setProductDescription(editingProduct.description);
      setProductPrice(editingProduct.price);
      setProductCategory(editingProduct.category);
      setProductImageUrl(editingProduct.imageUrl);
      setProductDetails(editingProduct.details);
      setSelectedImageFile(null); // Clear selected file when starting edit
    } else {
      // Clear form when not editing
      setProductName('');
      setProductDescription('');
      setProductPrice('');
      setProductCategory('');
      setProductImageUrl('');
      setProductDetails('');
      setSelectedImageFile(null);
    }
  }, [editingProduct]);

  const fetchProducts = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login'); // Redirect to login if token is invalid/expired
        }
        throw new Error('Error al cargar los productos.');
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImageFile(event.target.files[0]);
      // Optionally, set a preview URL immediately
      setProductImageUrl(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSubmitProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    let finalImageUrl = productImageUrl; // Start with current URL or empty

    // If a new image file is selected, upload it first
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append('productImage', selectedImageFile);

      try {
        const uploadResponse = await fetch('http://localhost:3001/api/admin/upload-product-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Error al subir la imagen.');
        }
        const uploadResult = await uploadResponse.json();
        finalImageUrl = uploadResult.imageUrl; // Get the URL of the uploaded image
      } catch (uploadError: any) {
        setError(uploadError.message);
        return; // Stop submission if image upload fails
      }
    } else if (editingProduct && !productImageUrl) {
      // If editing and no new image selected and current imageUrl is empty, it's an error
      setError('Debe proporcionar una imagen para el producto.');
      return;
    }

    const productData = {
      name: productName,
      description: productDescription,
      price: productPrice,
      category: productCategory,
      imageUrl: finalImageUrl, // Use the uploaded image URL or existing one
      details: productDetails,
    };

    try {
      let response;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      if (editingProduct) {
        // Update existing product
        response = await fetch(`http://localhost:3001/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(productData),
        });
      } else {
        // Add new product
        response = await fetch('http://localhost:3001/api/admin/products', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        throw new Error('Error al guardar el producto.');
      }
      setEditingProduct(null); // Exit edit mode
      setSelectedImageFile(null); // Clear selected file
      fetchProducts(token); // Refetch products
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
        }
        throw new Error('Error al eliminar el producto.');
      }
      fetchProducts(token); // Refetch products after deletion
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <p className="text-center mt-5">Cargando productos de administración...</p>;
  }

  if (error) {
    return <p className="text-center text-danger mt-5">Error: {error}</p>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Administración de Productos</h2>
      <button className="btn btn-danger mb-4" onClick={handleLogout}>Cerrar Sesión</button>

      {/* Add/Edit Product Form */}
      <div className="card mb-4">
        <div className="card-header">{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</div>
        <div className="card-body">
          <form onSubmit={handleSubmitProduct}>
            <div className="mb-3">
              <label htmlFor="productName" className="form-label">Nombre</label>
              <input type="text" className="form-control" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="productDescription" className="form-label">Descripción</label>
              <textarea className="form-control" id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="productPrice" className="form-label">Precio</label>
              <input type="text" className="form-control" id="productPrice" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label htmlFor="productCategory" className="form-label">Categoría</label>
              <input type="text" className="form-control" id="productCategory" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} required />
            </div>
            
            {/* Image Upload Field */}
            <div className="mb-3">
              <label htmlFor="productImageFile" className="form-label">Imagen del Producto</label>
              <input type="file" className="form-control" id="productImageFile" accept="image/*" onChange={handleImageFileChange} />
              {productImageUrl && !selectedImageFile && (
                <small className="form-text text-muted mt-2">Imagen actual: <a href={`http://localhost:3001${productImageUrl}`} target="_blank" rel="noopener noreferrer">{productImageUrl.split('/').pop()}</a></small>
              )}
              {productImageUrl && (
                <div className="mt-2">
                  <img src={`http://localhost:3001${productImageUrl}`} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd' }} />
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="productDetails" className="form-label">Detalles</label>
              <textarea className="form-control" id="productDetails" value={productDetails} onChange={(e) => setProductDetails(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn btn-primary me-2">{editingProduct ? 'Actualizar Producto' : 'Añadir Producto'}</button>
            {editingProduct && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancelar Edición</button>
            )}
          </form>
        </div>
      </div>

      {/* Product List */}
      <h3 className="mt-5 mb-3">Productos Existentes</h3>
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditProduct(product)}>Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;

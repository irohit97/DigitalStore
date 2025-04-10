import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersAsync } from '../redux/slices/orderSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Orders = () => {
  const dispatch = useDispatch();
  const { items: orders, loading, error } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (user) {
      dispatch(fetchOrdersAsync());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (orders && orders.length > 0) {
      // Extract unique purchased products
      const products = new Map();
      orders.forEach(order => {
        if (order.status === 'completed') {
          order.items.forEach(item => {
            if (!products.has(item.product._id)) {
              products.set(item.product._id, {
                ...item.product,
                purchaseDate: order.createdAt
              });
            }
          });
        }
      });
      setPurchasedProducts(Array.from(products.values()));
    }
  }, [orders]);

  const handleDownload = async (productId) => {
    if (downloading[productId]) return;
    
    try {
      setDownloading(prev => ({ ...prev, [productId]: true }));
      
      // Download the product
      const downloadResponse = await axios.get(`/api/products/${productId}/download`, {
        responseType: 'blob'
      });
      
      // Create a temporary link to trigger download
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `product-${productId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Send email
      await axios.post(`/api/products/${productId}/send-email`);
      
      toast.success('Product downloaded and sent to your email!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download product. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setDownloading(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Please sign in to view your orders
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              You need to be logged in to access your order history.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-red-600 sm:text-4xl">
              Error loading orders
            </h2>
            <p className="mt-4 text-lg text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (purchasedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              No purchased products yet
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              You haven't purchased any products yet. Start shopping to see your purchases here.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Your Purchased Products</h1>
          <Link 
            to="/order-history" 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Order History
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {purchasedProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105"
            >
              <div className="p-6">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-indigo-600">${product.price}</span>
                  <span className="text-sm text-gray-500">
                    Purchased on {new Date(product.purchaseDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-1 text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() => handleDownload(product._id)}
                    disabled={downloading[product._id]}
                    className={`flex-1 text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      downloading[product._id]
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {downloading[product._id] ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersAsync } from '../redux/slices/orderSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axios';

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
      // Extract unique purchased products with their order and item IDs
      const products = new Map();
      orders.forEach(order => {
        if (order.status === 'completed') {
          order.items.forEach(item => {
            if (!products.has(item.product._id)) {
              products.set(item.product._id, {
                ...item.product,
                orderId: order._id,
                itemId: item._id,
                purchaseDate: order.createdAt
              });
            }
          });
        }
      });
      setPurchasedProducts(Array.from(products.values()));
    }
  }, [orders]);

  const handleDownload = async (product) => {
    if (downloading[product._id]) return;
    
    try {
      setDownloading(prev => ({ ...prev, [product._id]: true }));
      
      // Get the download URL using the configured axios instance
      const response = await axiosInstance.get(`/orders/download/${product.orderId}/${product.itemId}`);
      
      if (response.data.success && response.data.downloadUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.target = '_blank';
        link.download = product.title || 'download';
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success('Download started!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(response.data.message || 'Failed to get download link');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error.response?.data?.message || 'Failed to download product. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setDownloading(prev => ({ ...prev, [product._id]: false }));
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
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchased Products</h1>
              <p className="mt-1 text-sm text-gray-600">All your digital assets in one place</p>
            </div>
            <Link 
              to="/order-history" 
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Order History
              <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Products Grid */}
        <div className="space-y-4">
          {purchasedProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row h-[180px]">
                {/* Product Image */}
                <div className="md:w-48 h-full">
                  <div className="relative h-full w-full">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-1 truncate">{product.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>
                      <span className="text-base font-semibold text-indigo-600 whitespace-nowrap">₹{product.price}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">Purchased on {new Date(product.purchaseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="mt-3">
                    <button
                      onClick={() => handleDownload(product)}
                      disabled={downloading[product._id]}
                      className={`inline-flex items-center px-4 py-2 text-sm border border-transparent font-medium rounded-md shadow-sm 
                        ${downloading[product._id] 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                    >
                      {downloading[product._id] ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {purchasedProducts.length === 0 && (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M20 12h-4a8 8 0 00-8 8v12a8 8 0 008 8h16a8 8 0 008-8V20a8 8 0 00-8-8h-4m-8 0V8m0 4v4m0-4h8" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
            <p className="mt-2 text-gray-500">Start exploring our collection to find something you'll love.</p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
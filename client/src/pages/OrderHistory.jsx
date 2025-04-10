import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchOrdersAsync } from '../redux/slices/orderSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderHistory = () => {
  const dispatch = useDispatch();
  const { items: orders, loading, error } = useSelector(state => state.orders);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrdersAsync());
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your order history</h1>
          <Link 
            to="/login" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error loading order history</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => dispatch(fetchOrdersAsync())}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No order history yet</h1>
          <Link 
            to="/products" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Order History</h1>
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:shadow-xl">
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <p className="text-sm text-gray-500">Order #{order._id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-lg font-semibold">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={item.product?.image || '/placeholder-image.jpg'} 
                        alt={item.product?.title || 'Product'}
                        className="w-20 h-20 object-contain rounded-lg"
                      />
                      <div className="flex-1">
                        <Link 
                          to={`/products/${item.product?._id}`} 
                          className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors"
                        >
                          {item.product?.title || 'Product'}
                        </Link>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          <p className="text-gray-800 font-medium">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Payment Method:</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                  <Link 
                    to={`/orders/${order._id}`} 
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View Order Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory; 
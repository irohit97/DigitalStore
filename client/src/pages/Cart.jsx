import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  getCartAsync, 
  deleteFromCartAsync, 
  updateCartItemQuantityAsync,
  resetDeleteStatus,
  resetUpdateQuantityStatus 
} from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiArrowBack } from 'react-icons/bi';
import { FiShoppingBag, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

const Cart = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    total, 
    isLoading, 
    isDeleting, 
    deleteSuccess, 
    deleteError,
    isUpdatingQuantity,
    updateQuantityError
  } = useSelector(state => state.cart);
  const [itemBeingDeleted, setItemBeingDeleted] = useState(null);
  const [itemBeingUpdated, setItemBeingUpdated] = useState(null);
  const { addNotification } = useNotification();

  // Fetch cart on component mount
  useEffect(() => {
    dispatch(getCartAsync());
  }, [dispatch]);

  // Handle delete status notifications
  useEffect(() => {
    if (deleteSuccess) {
      addNotification('Item removed from cart successfully', 'success');
      setItemBeingDeleted(null);
      dispatch(resetDeleteStatus());
    }
    if (deleteError) {
      addNotification(deleteError || 'Failed to remove item from cart', 'error');
      setItemBeingDeleted(null);
      dispatch(resetDeleteStatus());
    }
  }, [deleteSuccess, deleteError, dispatch, addNotification]);

  // Handle quantity update notifications
  useEffect(() => {
    if (updateQuantityError) {
      addNotification(updateQuantityError || 'Failed to update quantity', 'error');
      setItemBeingUpdated(null);
      dispatch(resetUpdateQuantityStatus());
    }
  }, [updateQuantityError, dispatch, addNotification]);

  const handleRemoveFromCart = (productId) => {
    if (itemBeingDeleted) return;
    setItemBeingDeleted(productId);
    
    dispatch(deleteFromCartAsync(productId))
      .unwrap()
      .then((response) => {
        if (!response || !response.items) {
          throw new Error('Invalid response from server');
        }
      })
      .catch((error) => {
        console.error('Error removing from cart:', error);
        addNotification(
          error?.message || 'Failed to remove item from cart',
          'error'
        );
      })
      .finally(() => {
        setItemBeingDeleted(null);
      });
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (isUpdatingQuantity) return;
    if (newQuantity < 1) return;
    
    setItemBeingUpdated(productId);
    dispatch(updateCartItemQuantityAsync({ productId, quantity: newQuantity }))
      .unwrap()
      .then(() => {
        setItemBeingUpdated(null);
      })
      .catch(() => {
        setItemBeingUpdated(null);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <FiShoppingBag className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <BiArrowBack className="mr-2" /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            <span className="block">Your Shopping Cart</span>
          </h1>
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            <span className="block text-blue-600 mt-2">Review your items</span>
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({items.length})
                  </h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map(item => {
                  if (!item || !item.product) {
                    return null;
                  }
                  
                  return (
                    <div key={item._id} className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <img 
                          src={item.product.image || '/placeholder-image.jpg'} 
                          alt={item.product.title || 'Product'} 
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <Link 
                          to={`/products/${item.product._id}`} 
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
                        >
                          {item.product.title || 'Product'}
                        </Link>
                        <p className="text-sm text-gray-500">{item.product.category || 'Uncategorized'}</p>
                        <p className="text-lg font-medium text-blue-600 mt-1">
                          {formatPrice(item.product.price || 0)}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-3">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={isUpdatingQuantity && itemBeingUpdated === item.product._id}
                            className="p-1 rounded-md hover:bg-white transition-colors duration-200 disabled:opacity-50"
                          >
                            {isUpdatingQuantity && itemBeingUpdated === item.product._id ? (
                              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <FiMinus className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                          <span className="px-2 font-medium">
                            {isUpdatingQuantity && itemBeingUpdated === item.product._id ? (
                              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            disabled={isUpdatingQuantity && itemBeingUpdated === item.product._id}
                            className="p-1 rounded-md hover:bg-white transition-colors duration-200 disabled:opacity-50"
                          >
                            {isUpdatingQuantity && itemBeingUpdated === item.product._id ? (
                              <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <FiPlus className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button 
                            onClick={() => handleRemoveFromCart(item.product._id)}
                            disabled={isDeleting && itemBeingDeleted === item.product._id}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            aria-label="Remove item"
                          >
                            {isDeleting && itemBeingDeleted === item.product._id ? (
                              <span className="inline-block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <FiTrash2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                to="/products" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <BiArrowBack className="mr-1" /> Continue Shopping
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-4">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-t border-gray-100">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                
                <div className="flex justify-between py-4 border-t border-gray-200 font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
                
                <Link 
                  to="/checkout" 
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block text-center font-medium"
                >
                  Proceed to Checkout
                </Link>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>Secure checkout with encrypted payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
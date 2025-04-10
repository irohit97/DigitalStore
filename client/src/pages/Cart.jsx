import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import LoadingSpinner from '../components/LoadingSpinner';

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

  // Fetch cart on component mount
  useEffect(() => {
    dispatch(getCartAsync());
  }, [dispatch]);

  // Handle delete status notifications
  useEffect(() => {
    if (deleteSuccess) {
      toast.success('Item removed from cart successfully');
      setItemBeingDeleted(null);
      dispatch(resetDeleteStatus());
    }
    if (deleteError) {
      toast.error(deleteError || 'Failed to remove item from cart');
      setItemBeingDeleted(null);
      dispatch(resetDeleteStatus());
    }
  }, [deleteSuccess, deleteError, dispatch]);

  // Handle quantity update status notifications
  useEffect(() => {
    if (updateQuantityError) {
      toast.error(updateQuantityError || 'Failed to update quantity');
      setItemBeingUpdated(null);
      dispatch(resetUpdateQuantityStatus());
    }
  }, [updateQuantityError, dispatch]);

  const handleRemoveFromCart = (productId) => {
    if (isDeleting) return;
    setItemBeingDeleted(productId);
    dispatch(deleteFromCartAsync(productId));
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <BiArrowBack className="mr-2" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="border-b p-4 bg-gray-50">
            <h2 className="font-semibold">Cart Items ({items.length})</h2>
          </div>
          
          <div className="divide-y">
            {items.map(item => (
              <div key={item._id} className="p-4 flex items-center">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                  <div className="flex justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        disabled={isUpdatingQuantity && itemBeingUpdated === item.product._id}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-2">
                        {isUpdatingQuantity && itemBeingUpdated === item.product._id ? (
                          <span className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        disabled={isUpdatingQuantity && itemBeingUpdated === item.product._id}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRemoveFromCart(item.product._id)}
                  disabled={isDeleting && itemBeingDeleted === item.product._id}
                  className="ml-4 text-red-500 hover:text-red-700 transition-colors p-2"
                  aria-label="Remove item"
                >
                  {isDeleting && itemBeingDeleted === item.product._id ? (
                    <span className="inline-block w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <AiOutlineDelete size={20} />
                  )}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Link 
              to="/products" 
              className="inline-flex items-center text-blue-600 hover:underline"
            >
              <BiArrowBack className="mr-1" /> Continue Shopping
            </Link>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            
            <div className="flex justify-between py-2 border-t">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-t">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div className="flex justify-between py-2 border-t font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            
            <Link 
              to="/checkout" 
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors inline-block text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
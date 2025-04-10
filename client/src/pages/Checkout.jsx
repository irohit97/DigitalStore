import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'react-toastify';
import axios from 'axios';
import { clearCart } from '../redux/slices/cartSlice';

const CheckoutPage = () => {
  const { items: cartItems, totalAmount } = useSelector(state => state.cart);
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(user?.email || '');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate the subtotal correctly without tax
  const subtotal = useMemo(() => {
    // Calculate subtotal by summing all products
    const total = cartItems.reduce((sum, item) => {
      const price = item?.product?.price || 0;
      const quantity = item?.quantity || 0;
      return sum + (price * quantity);
    }, 0);
    
    return total.toFixed(2) * 1;
  }, [cartItems]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Send order to backend
      const response = await axios.post('/api/orders', {
        items: cartItems,
        totalAmount: subtotal,
        paymentMethod
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Clear the cart after successful order
        dispatch(clearCart());
        
        toast.success('Order placed successfully! You will receive download links in your email shortly.');
        
        // Navigate to thank you page
        navigate('/thank-you');
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>
          <div className="mb-8">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <p className="text-xl mb-8 text-gray-600">Your cart is empty</p>
          <Link to="/products" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Complete Your Purchase</h1>
          <p className="text-center text-gray-600 mb-10">Secure checkout for your digital products</p>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <h2 className="text-xl font-semibold text-blue-800">Order Summary</h2>
            </div>
            
            <div className="grid md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {/* Product Details - 3/5 width on md screens */}
              <div className="md:col-span-3 p-6">
                <h3 className="font-medium text-gray-700 mb-4">Digital Products</h3>
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {cartItems.map(item => {
                    const product = item?.product || {};
                    return (
                      <div key={product._id || `item-${Math.random()}`} className="flex space-x-4 pb-4 border-b border-gray-100">
                        <img 
                          src={product.image || '/placeholder-image.jpg'} 
                          alt={product.title || 'Product'} 
                          className="w-16 h-16 object-cover rounded bg-gray-100 flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{product.title || 'Product'}</h4>
                          <p className="text-sm text-gray-500">Qty: {item?.quantity || 1}</p>
                          <div className="mt-1 text-sm font-medium text-gray-900">
                            {formatPrice((product.price || 0) * (item?.quantity || 1))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-4">Delivery Information</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your purchased digital products will be delivered to your email address. 
                    You will also be able to download them directly after purchase.
                  </p>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                      <span className="ml-1 text-xs text-blue-600">(verified account email)</span>
                    </label>
                    <div className="relative">
                  <input
                    type="email"
                    id="email"
                        value={email}
                        readOnly 
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none text-gray-700"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Digital products will be delivered to this email address</p>
                </div>
                </div>
              </div>
              
              {/* Payment Section - 2/5 width on md screens */}
              <div className="md:col-span-2 p-6 bg-gray-50">
                <form onSubmit={handlePlaceOrder}>
                  <h3 className="font-medium text-gray-700 mb-4">Payment Method</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="relative border rounded-md px-4 py-3 flex items-center border-blue-500 bg-blue-50">
                <input
                  id="razorpay"
                  name="paymentMethod"
                        type="radio" 
                        value="Razorpay" 
                        checked={true}
                        readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="razorpay" className="ml-3 flex items-center cursor-pointer w-full">
                        <span className="text-sm font-medium text-gray-700">Razorpay</span>
                        <div className="ml-auto">
                          <img 
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQQm61y_1zYU15YuP51hPr52IgbM35xwCc3YOyl0L4Jw5xkdHeWQ1If78_nF1l6_pUIDI&usqp=CAU" 
                            alt="Razorpay" 
                            className="h-8 object-contain"
                          />
                        </div>
                </label>
              </div>
            </div>
                  
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-600">Digital Products</span>
                      <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
          </div>
                    
                    <div className="flex justify-between font-medium text-lg mt-6 pt-4 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-blue-600">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`mt-8 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Complete Purchase'
                    )}
                  </button>
                  
                  <div className="mt-4 flex justify-center">
                    <Link to="/cart" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                      Return to Cart
                    </Link>
                  </div>
                  
                  <div className="mt-8 flex justify-center space-x-4">
                    <svg className="h-8 w-auto text-gray-400" fill="currentColor" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M33 0H3C1.3 0 0 1.3 0 3v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h30c1.1 0 2 .9 2 2z" fill="#fff"></path>
                    </svg>
                    <svg className="h-8 w-auto text-gray-400" fill="currentColor" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M33 0H3C1.3 0 0 1.3 0 3v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h30c1.1 0 2 .9 2 2z" fill="#fff"></path>
                    </svg>
                    <svg className="h-8 w-auto text-gray-400" fill="currentColor" viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M33 0H3C1.3 0 0 1.3 0 3v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h30c1.1 0 2 .9 2 2z" fill="#fff"></path>
                    </svg>
                  </div>
                </form>
              </div>
                </div>
            
            {/* Secure Transaction Notice */}
            <div className="p-4 text-center">
              <div className="flex justify-center items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Secure transaction. All data is encrypted and transmitted securely.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
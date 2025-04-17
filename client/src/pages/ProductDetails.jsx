import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlistAsync, removeFromWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/formatPrice';
import { FiHeart, FiShare2, FiCheck, FiDownload, FiClock, FiShield, FiSmartphone, FiShoppingCart } from 'react-icons/fi';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();
  const [showCopied, setShowCopied] = useState(false);
  
  const { token } = useSelector(state => state.auth);
  const isLoggedIn = !!token;
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { items: cartItems } = useSelector(state => state.cart);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const checkWishlistStatus = () => {
      if (product && wishlistItems.length > 0) {
        const isProductInWishlist = wishlistItems.some(item => item.product._id === product._id);
        setIsInWishlist(isProductInWishlist);
      }
    };

    const checkCartStatus = () => {
      if (product && cartItems.length > 0) {
        const isProductInCart = cartItems.some(item => item.product._id === product._id);
        setIsInCart(isProductInCart);
      }
    };

    checkWishlistStatus();
    checkCartStatus();
  }, [wishlistItems, cartItems, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      addNotification('Please log in to purchase', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }
    navigate('/checkout', { state: { products: [{ ...product, quantity: 1 }] } });
  };

  const handleWishlistToggle = () => {
    if (!isLoggedIn) {
      addNotification('Please log in to add items to wishlist', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlistAsync(product._id))
        .unwrap()
        .then(() => {
          addNotification('Removed from wishlist', 'success');
        })
        .catch(error => {
          addNotification(error || 'Failed to remove from wishlist', 'error');
        });
    } else {
      dispatch(addToWishlistAsync({ _id: product._id }))
        .unwrap()
        .then(() => {
          addNotification('Added to wishlist', 'success');
        })
        .catch(error => {
          addNotification(error || 'Failed to add to wishlist', 'error');
        });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopied(true);
      setTimeout(() => {
        setShowCopied(false);
      }, 2000);
    }).catch(() => {
      addNotification('Failed to copy link', 'error');
    });
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      addNotification('Please log in to add items to cart', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    if (isInCart) {
      addNotification('This item is already in your cart', 'error');
      return;
    }

    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        setIsInCart(true);
        addNotification('Added to cart', 'success');
      })
      .catch(error => {
        addNotification(error || 'Failed to add to cart', 'error');
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Error loading product</h1>
          <p className="mb-4 text-red-600">{error}</p>
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Product Not Found</h1>
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="lg:sticky lg:top-24" style={{ maxHeight: '700px' }}>
            <div className="bg-white rounded-2xl shadow-lg p-8 h-fit">
              <div className="flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="max-w-full object-contain"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8" style={{ minHeight: '600px', maxHeight: '700px' }}>
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                    <div className="relative">
                      <button 
                        onClick={handleShare}
                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 transition-colors duration-200"
                        aria-label="Share product"
                      >
                        <FiShare2 className="w-5 h-5" />
                      </button>
                      {showCopied && (
                        <div className="absolute right-0 top-12 bg-white text-gray-900 text-sm py-1 px-3 rounded-md shadow-lg">
                          Copied!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</div>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={handleWishlistToggle}
                        className={`p-3 rounded-lg ${
                          isInWishlist 
                            ? 'bg-red-50 text-red-500 border-2 border-red-500' 
                            : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                        } transition-colors duration-200`}
                        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <FiHeart className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={handleAddToCart}
                        className={`p-4 rounded-lg flex items-center space-x-2 ${
                          isInCart 
                            ? 'bg-blue-50 text-blue-500 border-2 border-blue-500' 
                            : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500'
                        } transition-colors duration-200`}
                        aria-label={isInCart ? "Already in cart" : "Add to cart"}
                      >
                        <FiShoppingCart className="w-6 h-6" />
                        <span className="font-medium">{isInCart ? 'In Cart' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="border-t border-gray-100 pt-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Technical Details</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">File Format</span>
                        <span className="font-medium text-gray-900">{product.fileFormat || 'Digital Download'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">File Size</span>
                        <span className="font-medium text-gray-900">{product.fileSize || 'Variable'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Category</span>
                        <span className="font-medium text-gray-900">{product.category || 'Digital Product'}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium text-gray-900">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Recently'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buy Now Button - Always at the bottom */}
                <div className="mt-6">
                  <button 
                    onClick={handleBuyNow}
                    className="w-full py-3 px-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    BUY NOW
                  </button>
                </div>
              </div>
            </div>

            {/* Product Features - Below the main containers */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Product Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiDownload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Instant Download</h3>
                    <p className="text-sm text-gray-600">Access your digital product immediately after purchase</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiClock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lifetime Access</h3>
                    <p className="text-sm text-gray-600">Download and access your purchase anytime</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FiShield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Secure License</h3>
                    <p className="text-sm text-gray-600">Licensed for personal and commercial use</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FiSmartphone className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cross-Platform</h3>
                    <p className="text-sm text-gray-600">Compatible with all major devices and platforms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
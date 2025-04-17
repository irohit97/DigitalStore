import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlistAsync, clearWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useEffect, useState } from 'react';
import { BiArrowBack } from 'react-icons/bi';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatPrice } from '../utils/formatPrice';
import { useNotification } from '../context/NotificationContext';

const WishlistPage = () => {
  const wishlistItems = useSelector(state => state.wishlist.items);
  const { loading, error } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();
  const [itemBeingDeleted, setItemBeingDeleted] = useState(null);
  const [itemBeingMoved, setItemBeingMoved] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  const { addNotification } = useNotification();

  // Fetch wishlist on component mount
  useEffect(() => {
    dispatch(fetchWishlist())
      .unwrap()
      .catch((error) => {
        addNotification(error || 'Failed to load wishlist', 'error');
      });
  }, [dispatch, addNotification]);

  const handleRemoveFromWishlist = (productId) => {
    if (itemBeingDeleted) return;
    setItemBeingDeleted(productId);
    dispatch(removeFromWishlistAsync(productId))
      .unwrap()
      .then(() => {
        addNotification('Item removed from wishlist', 'success');
        setItemBeingDeleted(null);
      })
      .catch((error) => {
        console.error('Error removing from wishlist:', error);
        addNotification(error?.message || 'Failed to remove item from wishlist', 'error');
        setItemBeingDeleted(null);
      });
  };

  const handleMoveToCart = (product) => {
    if (itemBeingMoved) return;
    setItemBeingMoved(product._id);
    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        dispatch(removeFromWishlistAsync(product._id))
          .unwrap()
          .then(() => {
            addNotification('Added to cart and removed from wishlist', 'success');
            setItemBeingMoved(null);
          })
          .catch(error => {
            addNotification(error || 'Failed to remove from wishlist', 'error');
            setItemBeingMoved(null);
          });
      })
      .catch(error => {
        addNotification(error || 'Failed to add to cart', 'error');
        setItemBeingMoved(null);
      });
  };

  const handleClearAll = () => {
    if (isClearing) return;
    setIsClearing(true);
    
    dispatch(clearWishlistAsync())
      .unwrap()
      .then((response) => {
        addNotification(response?.message || 'Wishlist cleared successfully', 'success');
      })
      .catch((error) => {
        console.error('Error clearing wishlist:', error);
        addNotification(error?.message || 'Failed to clear wishlist', 'error');
      })
      .finally(() => {
        setIsClearing(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <FiHeart className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your wishlist yet.</p>
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
            <span className="block">Your Wishlist</span>
             </h1>
          <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            <span className="block text-blue-600 mt-2">Save your favorite items</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Wishlist Items ({wishlistItems.length})
                  </h2>
                  <button
                    onClick={handleClearAll}
                    disabled={isClearing}
                    className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors duration-200 disabled:opacity-50"
                  >
                    {isClearing ? (
                      <span className="inline-block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></span>
                    ) : (
                      <FiTrash2 className="w-4 h-4 mr-1" />
                    )}
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {wishlistItems.map(item => (
                  <div key={item.product._id} className="p-6 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <img 
                        src={item.product.image} 
                        alt={item.product.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <Link 
                        to={`/products/${item.product._id}`} 
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate block"
                      >
                        {item.product.title}
                      </Link>
                      <p className="text-lg font-medium text-blue-600 mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleMoveToCart(item.product)}
                        disabled={itemBeingMoved === item.product._id}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {itemBeingMoved === item.product._id ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <FiShoppingCart className="mr-2" />
                            Move to Cart
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => handleRemoveFromWishlist(item.product._id)}
                        disabled={itemBeingDeleted === item.product._id}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        aria-label="Remove item"
                      >
                        {itemBeingDeleted === item.product._id ? (
                          <span className="inline-block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <FiTrash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Link 
                to="/products" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <BiArrowBack className="mr-1" /> Continue Shopping
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
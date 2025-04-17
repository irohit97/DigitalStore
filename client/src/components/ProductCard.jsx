import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlistAsync, removeFromWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const isLoggedIn = !!token;
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    // Check if product is in wishlist
    const checkWishlistStatus = () => {
      const isProductInWishlist = wishlistItems.some(item => item.product._id === product._id);
      setIsInWishlist(isProductInWishlist);
    };

    checkWishlistStatus();
  }, [wishlistItems, product._id]);

  useEffect(() => {
    // Fetch wishlist when component mounts
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  const handleWishlistToggle = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (!isLoggedIn) {
      addNotification('Please log in to add items to wishlist', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }
    
    if (isInWishlist) {
      // Remove from wishlist
      dispatch(removeFromWishlistAsync(product._id))
        .unwrap()
        .then(() => {
          addNotification('Removed from wishlist', 'success');
        })
        .catch(error => {
          addNotification(error || 'Failed to remove from wishlist', 'error');
        });
    } else {
      // Add to wishlist
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
  
  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (!isLoggedIn) {
      addNotification('Please log in to add items to cart', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }
    
    // Make sure we have all required fields
    const cartProduct = {
      _id: product._id,
      title: product.title || 'Unknown Product',
      price: product.price || 0, 
      image: product.image || '',
      category: product.category || 'Unknown',
      quantity: 1
    };
    
    dispatch(addToCartAsync(cartProduct))
      .unwrap()
      .then(() => {
        addNotification('Added to cart', 'success');
      })
      .catch(error => {
        addNotification(error || 'Failed to add to cart', 'error');
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      <Link to={`/products/${product._id}`} className="block">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-contain p-4"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 hover:text-blue-600">{product.title}</h3>
          <p className="text-gray-800 font-bold mb-2">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <div className="p-4 pt-0 flex justify-between items-center">
        <button 
          onClick={handleWishlistToggle}
          className={`${isInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg className="w-6 h-6" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
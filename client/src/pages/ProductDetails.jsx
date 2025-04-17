import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlistAsync, removeFromWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { formatPrice } from '../utils/formatPrice';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addNotification } = useNotification();
  
  const { token } = useSelector(state => state.auth);
  const isLoggedIn = !!token;
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    // Fetch wishlist when component mounts
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    // Check if product is in wishlist
    const checkWishlistStatus = () => {
      if (product && wishlistItems.length > 0) {
        const isProductInWishlist = wishlistItems.some(item => item.product._id === product._id);
        setIsInWishlist(isProductInWishlist);
      }
    };

    checkWishlistStatus();
  }, [wishlistItems, product]);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Error loading product</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      addNotification('Please log in to add items to cart', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        addNotification('Added to cart', 'success');
      })
      .catch(error => {
        addNotification(error || 'Failed to add to cart', 'error');
      });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full max-h-96 object-contain rounded-lg"
          />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-purple-600">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <p className="text-gray-600 mb-6">{product.description || 'No description available'}</p>
          
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={handleAddToCart}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleWishlistToggle}
              className={`px-6 py-2 border rounded flex items-center ${isInWishlist ? 'border-red-500 text-red-500' : 'border-gray-300 hover:bg-gray-100'}`}
            >
              <svg className="w-5 h-5 mr-2" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
          
          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold mb-2">Product Details</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Category: {product.category || 'N/A'}</li>
              <li>File Type: Digital Download</li>
              <li>File Size: {product.fileSize || 'N/A'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
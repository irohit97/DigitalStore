import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { token } = useSelector(state => state.auth);
  const isLoggedIn = !!token;
  const { addNotification } = useNotification();

  useEffect(() => {
    // Fetch wishlist when component mounts
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
        console.log(response.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }));
    addNotification('Added to cart', 'success');
  };

  const handleWishlistToggle = (product) => {
    if (!isLoggedIn) {
      addNotification('Please log in to add items to wishlist', 'warning');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      return;
    }

    // Check if product is already in wishlist
    const isInWishlist = wishlistItems.some(item => item.product._id === product._id);
    
    if (isInWishlist) {
      // Remove from wishlist
      dispatch(removeFromWishlistAsync(product._id))
        .unwrap()
        .then(() => {
          addNotification('Removed from wishlist', 'error');
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

  if (loading) return <div className="text-center py-8">Loading products...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {message && (
        <div className={`fixed top-16 right-4 px-4 py-2 rounded-md ${
          message.includes('Failed') ? 'bg-red-500' : 'bg-green-500'
        } text-white z-40`}>
          {message}
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-8">Featured Digital Products</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => {
          // Check if product is in wishlist
          const isInWishlist = wishlistItems.some(item => item.product._id === product._id);
          
          return (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Link to={`/products/${product._id}`}>
                <div className="p-4">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-48 object-contain mb-4"
                  />
                  <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                </div>
              </Link>
              
              <div className="px-4 pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleWishlistToggle(product)}
                      className={`p-2 ${isInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
                      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <svg className="w-5 h-5" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 hover:scale-105 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { addToWishlistAsync, removeFromWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

const Ebooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await axios.get('/api/products?category=ebook');
        console.log("Fetched eBooks:", res.data);
        setEbooks(res.data);
      } catch (error) {
        console.error("Failed to fetch ebooks:", error);
        addNotification('Failed to load ebooks', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
    dispatch(fetchWishlist());
  }, [addNotification, dispatch]);

  const handleAddToCart = (book) => {
    if (!user) {
      addNotification('Please login to add items to cart', 'warning');
      return;
    }
    dispatch(addToCartAsync({ productId: book._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        addNotification(`${book.title} added to cart`, 'success');
      })
      .catch((error) => {
        addNotification(error || 'Failed to add to cart', 'error');
      });
  };

  const handleWishlistToggle = (book, e) => {
    e.preventDefault();
    if (!user) {
      addNotification('Please login to add items to wishlist', 'warning');
      return;
    }

    const isInWishlist = wishlistItems.some(item => item.product._id === book._id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlistAsync(book._id))
        .unwrap()
        .then(() => {
          addNotification('Removed from wishlist', 'success');
        })
        .catch(error => {
          addNotification(error || 'Failed to remove from wishlist', 'error');
        });
    } else {
      dispatch(addToWishlistAsync({ _id: book._id }))
        .unwrap()
        .then(() => {
          addNotification('Added to wishlist', 'success');
        })
        .catch(error => {
          addNotification(error || 'Failed to add to wishlist', 'error');
        });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Premium Digital Books</span>
            <span className="block text-indigo-600 mt-2">Expand Your Knowledge</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover our collection of high-quality digital books designed to enhance your learning experience.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-white p-6 rounded-xl shadow-sm">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search E-books..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pl-10"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
              <option>Sort by</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
            </select>
            <select className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white">
              <option>All Genres</option>
              <option>Fiction</option>
              <option>Non-fiction</option>
              <option>Tech</option>
            </select>
          </div>
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ebooks.map((book) => {
            const isInWishlist = wishlistItems.some(item => item.product._id === book._id);
            
            return (
              <div key={book._id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                <Link to={`/products/${book._id}`} className="block">
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <img 
                        src={book.image} 
                        alt={book.title} 
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-4 right-4">
                      <button 
                        onClick={(e) => handleWishlistToggle(book, e)}
                        className={`p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md ${
                          isInWishlist ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        } transition-colors duration-200`}
                        aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <svg className="w-6 h-6" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">{book.title}</h2>
                    <p className="text-gray-600 mb-2 text-sm">by {book.artist}</p>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{book.description}</p>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-2xl font-bold text-indigo-600">₹{book.price.toFixed(2)}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(book);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <nav className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">1</button>
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">2</button>
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">3</button>
            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Ebooks;


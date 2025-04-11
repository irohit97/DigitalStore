import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlistAsync, clearWishlistAsync, fetchWishlist } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useEffect, useState } from 'react';
import { BiArrowBack } from 'react-icons/bi';
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
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
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
        // Remove from wishlist after successfully adding to cart
        dispatch(removeFromWishlistAsync(product._id))
          .unwrap()
          .then(() => {
            addNotification('Added to cart and removed from wishlist', 'success');
            setItemBeingMoved(null); // Reset the state after successful operation
          })
          .catch(error => {
            addNotification(error || 'Failed to remove from wishlist', 'error');
            setItemBeingMoved(null); // Reset the state even if there's an error
          });
      })
      .catch(error => {
        addNotification(error || 'Failed to add to cart', 'error');
        setItemBeingMoved(null); // Reset the state if adding to cart fails
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

  // Handle select all toggle
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(wishlistItems.map(item => item.product._id)));
    }
    setIsSelectAll(!isSelectAll);
  };

  // Handle individual item selection
  const handleItemSelect = (itemId) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.add(itemId);
    }
    setSelectedItems(newSelectedItems);
    setIsSelectAll(newSelectedItems.size === wishlistItems.length);
  };

  // Handle move selected items to cart
  const handleMoveSelectedToCart = () => {
    const selectedProducts = wishlistItems.filter(item => selectedItems.has(item.product._id));
    if (selectedProducts.length === 0) {
      addNotification('Please select items to move to cart', 'warning');
      return;
    }

    selectedProducts.forEach(item => {
      dispatch(addToCartAsync({ ...item.product, quantity: 1 }))
        .unwrap()
        .then(() => {
          dispatch(removeFromWishlistAsync(item.product._id));
        })
        .catch(error => {
          addNotification(`Failed to move ${item.product.title} to cart`, 'error');
        });
    });
    setSelectedItems(new Set());
    setIsSelectAll(false);
    addNotification('Selected items moved to cart', 'success');
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
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="mb-6">Looks like you haven't added any items to your wishlist yet.</p>
          <Link to="/products" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <BiArrowBack className="mr-2" /> Browse Products
        </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="border-b p-4 bg-gray-50">
            <h2 className="font-semibold">Wishlist Items ({wishlistItems.length})</h2>
          </div>
          
          <div className="divide-y">
          {wishlistItems.map(item => (
              <div key={item.product._id} className="p-4 flex items-center">
                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                <img 
                  src={item.product.image} 
                  alt={item.product.title} 
                    className="w-full h-full object-cover"
                />
                </div>
                
                <div className="ml-4 flex-grow">
                  <Link to={`/products/${item.product._id}`} className="text-lg font-semibold hover:text-blue-600">
                    {item.product.title}
                  </Link>
                  <p className="text-gray-600">{formatPrice(item.product.price)}</p>
                </div>
                
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleMoveToCart(item.product)}
                    disabled={itemBeingMoved === item.product._id}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {itemBeingMoved === item.product._id ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      'Move to Cart'
                    )}
                </button>
                <button 
                  onClick={() => handleRemoveFromWishlist(item.product._id)}
                    disabled={itemBeingDeleted === item.product._id}
                    className="p-2 text-red-600 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                    aria-label="Remove item"
                    title="Remove from wishlist"
                  >
                    {itemBeingDeleted === item.product._id ? (
                      <span className="inline-block w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                </button>
              </div>
            </div>
          ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Link 
              to="/products" 
              className="inline-flex items-center text-blue-600 hover:underline"
            >
              <BiArrowBack className="mr-1" /> Continue Shopping
            </Link>
            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="inline-flex items-center text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                {isClearing ? (
                  <span className="inline-block w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1"></span>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Clear All
              </button>
            )}
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Wishlist Summary</h2>
              <button
                onClick={handleSelectAll}
                className="text-cyan-600 hover:text-cyan-700 text-xs font-medium"
              >
                {isSelectAll ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {wishlistItems.map(item => (
                <div key={item.product._id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 flex-grow">
                    <img 
                      src={item.product.image} 
                      alt={item.product.title} 
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div className="truncate text-center">
                      <p className="text-xs font-medium truncate">{item.product.title}</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={selectedItems.has(item.product._id)}
                    onChange={() => handleItemSelect(item.product._id)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between py-2 border-t mt-4">
              <span>Total Items</span>
              <span>{wishlistItems.length}</span>
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleMoveSelectedToCart}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors inline-block text-center"
              >
                Move Selected To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromWishlist, addToCart } from '../redux/slices/wishlistSlice'; // Updated import path

const WishlistPage = () => {
  const wishlistItems = useSelector(state => state.wishlist.items);
  const dispatch = useDispatch();

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    dispatch(removeFromWishlist(product._id));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
        <p className="text-gray-600 mb-6">You haven't added any products to your wishlist yet.</p>
        <Link 
          to="/products" 
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {wishlistItems.map(item => (
            <div key={item._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-20 h-20 object-contain"
                />
                <div>
                  <Link to={`/products/${item._id}`} className="text-lg font-semibold hover:text-blue-600">
                    {item.title}
                  </Link>
                  <p className="text-gray-600">₹{item.price}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleMoveToCart(item)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Move to Cart
                </button>
                <button 
                  onClick={() => handleRemoveFromWishlist(item._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
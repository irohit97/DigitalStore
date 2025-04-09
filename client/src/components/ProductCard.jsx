import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToWishlist } from '../redux/slices/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToWishlist = (e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    dispatch(addToWishlist(product));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`} className="block">
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-contain p-4"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 hover:text-blue-600">{product.title}</h3>
          <p className="text-gray-800 font-bold mb-2">₹{product.price}</p>
        </div>
      </Link>
      <div className="p-4 pt-0 flex justify-between items-center">
        <button 
          onClick={handleAddToWishlist}
          className="text-gray-500 hover:text-red-500"
          aria-label="Add to wishlist"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Add to cart logic here
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
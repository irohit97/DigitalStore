import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToWishlist } from '../redux/slices/wishlistSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToWishlist = () => {
    dispatch(addToWishlist(product));
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`}>
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-contain p-4"
        />
      </Link>
      <div className="p-4">
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-lg font-semibold mb-1 hover:text-blue-600">{product.title}</h3>
        </Link>
        <p className="text-gray-800 font-bold mb-2">₹{product.price}</p>
        <div className="flex justify-between items-center">
          <button 
            onClick={handleAddToWishlist}
            className="text-gray-500 hover:text-red-500"
            aria-label="Add to wishlist"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
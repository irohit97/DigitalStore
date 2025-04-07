import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, addToWishlist } from '../redux/slices/wishlistSlice';

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  // In a real app, you would fetch the product details based on the ID
  // For now, we'll use a sample product or get it from Redux store
  const product = useSelector(state => 
    state.products.items.find(item => item._id === id) || 
    state.wishlist.items.find(item => item._id === id)
  );

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

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
          <p className="text-2xl font-semibold text-gray-800 mb-4">₹{product.price}</p>
          <p className="text-gray-600 mb-6">{product.description || 'No description available'}</p>
          
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={() => dispatch(addToCart({ ...product, quantity: 1 }))}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => dispatch(addToWishlist(product))}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Add to Wishlist
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
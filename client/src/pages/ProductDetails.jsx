import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlistAsync } from '../redux/slices/wishlistSlice';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  
  const { token } = useSelector(state => state.auth);
  const isLoggedIn = !!token;

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
    if (!product || !product._id) {
      console.error('Invalid product:', product);
      setActionMessage('Error: Invalid product data');
      return;
    }

    console.log('Adding to cart:', product);
    if (!isLoggedIn) {
      setActionMessage('Please log in to add items to your cart');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    // Ensure the product has all the required fields
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
      .then((result) => {
        console.log('Add to cart success:', result);
        setActionMessage('Item added to cart successfully!');
        setTimeout(() => setActionMessage(''), 3000);
      })
      .catch(error => {
        console.error('Add to cart error:', error);
        setActionMessage(error || 'Failed to add item to cart');
        setTimeout(() => setActionMessage(''), 3000);
      });
  };

  const handleAddToWishlist = () => {
    console.log('Adding to wishlist:', product);
    if (!isLoggedIn) {
      setActionMessage('Please log in to add items to your wishlist');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    dispatch(addToWishlistAsync(product))
      .unwrap()
      .then(() => {
        setActionMessage('Item added to wishlist successfully!');
        setTimeout(() => setActionMessage(''), 3000);
      })
      .catch(error => {
        setActionMessage(error || 'Failed to add item to wishlist');
        setTimeout(() => setActionMessage(''), 3000);
      });
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
          <p className="text-2xl font-semibold text-gray-800 mb-4">₹{product.price}</p>
          <p className="text-gray-600 mb-6">{product.description || 'No description available'}</p>
          
          <div className="flex space-x-4 mb-6">
            <button 
              onClick={handleAddToCart}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
            <button 
              onClick={handleAddToWishlist}
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
      
      {actionMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-md ${
          actionMessage.includes('success') ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {actionMessage}
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
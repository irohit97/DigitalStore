import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync } from '../redux/slices/cartSlice';
import { useNotification } from '../context/NotificationContext';
import axios from 'axios';

const Software = () => {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchSoftwares = async () => {
      try {
        const res = await axios.get('/api/products?category=software');
        console.log("Fetched software products:", res.data); // ✅ optional debug log
        setSoftwares(res.data);
      } catch (error) {
        console.error("Failed to fetch software:", error);
        addNotification('Failed to load software products', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSoftwares();
  }, [addNotification]);

  const handleAddToCart = (app) => {
    if (!user) {
      addNotification('Please login to add items to cart', 'warning');
      return;
    }
    dispatch(addToCartAsync({ productId: app._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        addNotification(`${app.title} added to cart`, 'success');
      })
      .catch((error) => {
        addNotification(error || 'Failed to add to cart', 'error');
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Explore Software Products</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search Software..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border rounded-lg">
            <option>Sort by</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Rating</option>
          </select>
          <select className="px-4 py-2 border rounded-lg">
            <option>All Types</option>
            <option>Security</option>
            <option>Productivity</option>
            <option>Design</option>
          </select>
        </div>
      </div>

      {/* Software Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading software...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {softwares.map((app) => (
            <div key={app._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={app.image} 
                  alt={app.title} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center">
                  ⭐ {app.rating}
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{app.title}</h2>
                <p className="text-gray-600 mb-2">by {app.artist}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{app.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">₹{app.price.toFixed(2)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(app)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add to Cart
                    </button>
                    <Link 
                      to={`/products/${app._id}`} 
                      className="px-3 py-1 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <nav className="flex items-center gap-1">
          <button className="px-3 py-1 rounded border">Previous</button>
          <button className="px-3 py-1 rounded bg-purple-600 text-white">1</button>
          <button className="px-3 py-1 rounded border">2</button>
          <button className="px-3 py-1 rounded border">3</button>
          <button className="px-3 py-1 rounded border">Next</button>
        </nav>
      </div>
    </div>
  );
};

export default Software;

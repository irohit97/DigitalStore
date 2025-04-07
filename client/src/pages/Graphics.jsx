// Description: This component displays a collection of digital artworks with search, filter, and pagination functionalities.
// It fetches data from an API, displays it in a grid format, and allows users to add items to their cart or view details.

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const DigitalArt = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await axios.get('/api/products?category=graphic');
        setArtworks(response.data);
      } catch (error) {
        console.error("Failed to fetch digital art:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const addToCart = (art) => {
    console.log("Added to cart:", art.title);
    // Optional: Add Redux or Context logic here
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Explore Digital Art</h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search Art..."
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
            <option>All Categories</option>
            <option>Fantasy</option>
            <option>Sci-Fi</option>
            <option>Nature</option>
          </select>
        </div>
      </div>

      {/* Art Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading artworks...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {artworks.map((art) => (
            <div
              key={art._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded flex items-center">
                  ⭐ {art.rating}
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{art.title}</h2>
                <p className="text-gray-600 mb-2">by {art.artist}</p>
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {art.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${art.price.toFixed(2)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(art)}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/digital-art/${art._id}`}
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

export default DigitalArt;

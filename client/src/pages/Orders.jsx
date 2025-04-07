import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Orders = () => {
  const orders = useSelector(state => state.orders.items);
  const { user } = useSelector(state => state.auth);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your orders</h1>
        <Link 
          to="/login" 
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">You haven't placed any orders yet</h1>
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
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Order #{order._id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {order.status || 'Completed'}
                </span>
              </div>
            </div>
            
            <div className="p-4 divide-y">
              {order.items.map(item => (
                <div key={item._id} className="py-3 flex justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-16 h-16 object-contain"
                    />
                    <div>
                      <Link 
                        to={`/products/${item._id}`} 
                        className="font-medium hover:text-blue-600"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <p className="font-medium">Total: ₹{order.total}</p>
              <Link 
                to={`/orders/${order._id}`} 
                className="text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
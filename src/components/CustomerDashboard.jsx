import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaBox, FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaComment, FaEdit } from 'react-icons/fa';
import Sidebar from './Sidebar';
import BuyModal from './BuyModal';
import ChatModal from './ChatModal';

const CustomerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatCrop, setChatCrop] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'customer') {
      navigate('/');
      return;
    }
    setUser(userData);
    fetchCrops();
    fetchOrders(userData.id);
    
    // Refresh crops and orders every 2 seconds to show real-time updates
     const interval = setInterval(() => {
    fetchCrops();
    fetchOrders(userData.id);
  }, 2000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchCrops = async () => {
    try {
      const response = await axios.get('http://localhost:3000/crops');
      setCrops(response.data);
    } catch (error) {
      toast.error('Failed to fetch crops');
    }
  };

  const fetchOrders = async (customerId) => {
    try {
      const response = await axios.get('http://localhost:3000/orders');
      const customerOrders = response.data.filter(order => order.customerId === customerId);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const handleBuyCrop = (crop) => {
    setSelectedCrop(crop);
    setIsBuyModalOpen(true);
  };

  const handleChatOpen = (crop) => {
    setChatCrop(crop);
    setIsChatModalOpen(true);
  };

  const handlePlaceOrder = async (orderData) => {
    try {
      // Find the crop first to validate
      const crop = crops.find(c => c.id === orderData.cropId);
      if (!crop) {
        toast.error('Crop not found');
        return;
      }
      
      if (crop.quantity < orderData.quantity) {
        toast.error('Insufficient quantity available');
        return;
      }
      
      // Update crop quantity first
      const updatedQuantity = Math.max(0, crop.quantity - orderData.quantity);
      await axios.patch(`http://localhost:3000/crops/${orderData.cropId}`, {
        quantity: updatedQuantity
      });
      
      // Update local state immediately
      setCrops(prevCrops => 
        prevCrops.map(c => 
          c.id === orderData.cropId 
            ? { ...c, quantity: updatedQuantity }
            : c
        )
      );
      
      // Create order with success status
      const newOrder = {
        ...orderData,
        totalPrice: parseFloat(orderData.totalPrice.toFixed(2)),
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone || 'Not provided',
        orderDate: new Date().toISOString(),
        status: 'success'
      };
      
      console.log('Creating order:', newOrder);
      const orderResponse = await axios.post('http://localhost:3000/orders', newOrder);
      console.log('Order created:', orderResponse.data);
      
      toast.success(' Order placed successfully!');
      setIsBuyModalOpen(false);
      
      // Force immediate refresh of both crops and orders
      await Promise.all([
        fetchCrops(),
        fetchOrders(user.id)
      ]);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order: ' + (error.response?.data?.message || error.message));
      // Refresh crops to show current state
      await fetchCrops();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) return null;

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Legumes', 'Herbs'];
  
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    const inStock = crop.quantity > 0; // Only show crops with available stock
    return matchesSearch && matchesCategory && inStock;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        role="customer" 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 ml-64">
        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {activeTab === 'marketplace' ? 'Marketplace' : activeTab === 'orders' ? 'My Orders' : 'Settings'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'marketplace' 
                  ? 'Discover fresh produce from local farmers' 
                  : activeTab === 'orders'
                  ? 'Track your orders and purchase history'
                  : 'Manage your account settings'}
              </p>
            </div>
            {orders.length > 0 && activeTab === 'marketplace' && (
              <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-semibold">
                {orders.length} Active Orders
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'marketplace' && (
            <div>
              {/* Search and Filter */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-4 top-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search crops or farmers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                          selectedCategory === category
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Crops Grid */}
              {filteredCrops.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <FaShoppingCart className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No crops found matching your criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCrops.map((crop) => (
                    <div key={crop.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group">
                      <div className="relative">
                        <img
                          src={crop.image}
                          alt={crop.cropName}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                            {crop.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg">
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-emerald-600" />
                              By {crop.farmerName}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold text-gray-800">{crop.cropName}</h3>
                          <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-lg">
                            <FaStar className="text-amber-500 text-xs" />
                            <span className="text-xs font-semibold text-amber-700">4.5</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{crop.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-t-xl">
                            <span className="text-gray-600 text-sm">Available Stock</span>
                            <span className="font-bold text-gray-800">{crop.quantity} {crop.unit}</span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 ">
                            <span className="text-emerald-700 text-sm font-semibold">Price per {crop.unit}</span>
                            <span className="font-bold text-emerald-600 text-xl">₹{crop.pricePerUnit}</span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-b-xl">
                            <span className="text-gray-600 text-sm">Harvested</span>
                            <span className="font-semibold text-gray-800 text-sm">{crop.harvestDate}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={() => handleChatOpen(crop)}
                            className="w-full mb-1 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all font-semibold"
                          >
                            <FaComment /> Chat with Farmer
                          </button>
                          <button
                            onClick={() => handleBuyCrop(crop)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold text-lg group-hover:scale-105"
                          >
                            <FaShoppingCart /> Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No orders yet</p>
                  <p className="text-gray-500 mt-2">Start shopping to see your orders here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Order ID</th>
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Crop</th>
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Farmer</th>
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Quantity</th>
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Total</th>
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Date</th>
                        <th className="text-left py-4 px-4 text-gray-700 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 text-gray-600 font-medium">#{order.id}</td>
                          <td className="py-4 px-4 text-gray-800 font-semibold">{order.cropName}</td>
                          <td className="py-4 px-4 text-gray-600">{order.farmerName}</td>
                          <td className="py-4 px-4 text-gray-600">{order.quantity} kg</td>
                          <td className="py-4 px-4 text-emerald-600 font-bold text-lg">₹{parseFloat(order.totalPrice).toFixed(2)}</td>
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(order.orderDate).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                              timeZone: 'Asia/Kolkata'
                            })}

                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              ✓ {order.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
                <p className="text-gray-600 mt-1">Manage your account information</p>
              </div>

              {/* Profile Information */}
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-6 border-2 border-emerald-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Profile Information
                  </h3>
                  {!isEditingProfile ? (
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setEditedName(user.name);
                        setEditedPhone(user.phone || '');
                        setEditedAddress(user.address || '');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      <FaEdit /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await axios.patch(`http://localhost:3000/users/${user.id}`, {
                              name: editedName,
                              phone: editedPhone,
                              address: editedAddress
                            });
                            const updatedUser = { ...user, name: editedName, phone: editedPhone, address: editedAddress };
                            setUser(updatedUser);
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            toast.success('Profile updated successfully!');
                            setIsEditingProfile(false);
                          } catch (error) {
                            toast.error('Failed to update profile');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setEditedName(user.name);
                          setEditedPhone(user.phone || '');
                          setEditedAddress(user.address || '');
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name {isEditingProfile && <span className="text-emerald-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={isEditingProfile ? editedName : user.name}
                      onChange={(e) => setEditedName(e.target.value)}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                        isEditingProfile
                          ? 'bg-white border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number {isEditingProfile && <span className="text-emerald-600">*</span>}
                    </label>
                    <input
                      type="tel"
                      value={isEditingProfile ? editedPhone : (user.phone || 'Not provided')}
                      onChange={(e) => setEditedPhone(e.target.value)}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                        isEditingProfile
                          ? 'bg-white border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-xs text-gray-500">(Not Editable)</span>
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-600 font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address {isEditingProfile && <span className="text-blue-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={isEditingProfile ? editedAddress : (user.address || 'Not provided')}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                        isEditingProfile
                          ? 'bg-white border-emerald-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      placeholder="Enter your delivery address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                    <input
                      type="text"
                      value="Customer"
                      disabled
                      className="w-full px-4 py-3 bg-emerald-100 border-2 border-emerald-300 rounded-lg text-emerald-800 font-bold cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-600 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isBuyModalOpen && selectedCrop && (
        <BuyModal
          crop={selectedCrop}
          customerAddress={user.address}
          onClose={() => setIsBuyModalOpen(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {isChatModalOpen && chatCrop && (
        <ChatModal
          crop={chatCrop}
          user={user}
          onClose={() => setIsChatModalOpen(false)}
          onOrderComplete={() => fetchCrops()}
        />
      )}
    </div>
  );
};
export default CustomerDashboard;

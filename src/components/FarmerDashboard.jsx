import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit,FaRupeeSign, FaTrash, FaSeedling,  FaBoxes, FaSun, FaComment, FaComments } from 'react-icons/fa';
import Sidebar from './Sidebar';
import CropModal from './CropModal';
import ChatModal from './ChatModal';

const FarmerDashboard = () => {
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatCrop, setSelectedChatCrop] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedLocation, setEditedLocation] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [weather, setWeather] = useState(null);
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.role !== 'farmer') {
      navigate('/');
      return;
    }
    setUser(userData);
    fetchCrops(userData.id);
    fetchOrders(userData.id);
    fetchChats(userData.id);
    fetchWeather(userData.location || "Hyderabad");
    
    // Refresh orders and chats every 2 seconds for real-time updates
    const interval = setInterval(() => {
      fetchOrders(userData.id);
      fetchChats(userData.id);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchCrops = async (farmerId) => {
    try {
      const response = await axios.get('http://localhost:3000/crops');
      const farmerCrops = response.data.filter(crop => crop.farmerId === farmerId);
      setCrops(farmerCrops);
    } catch {
      toast.error('Failed to fetch crops');
    }
  };

  const fetchWeather = async (city = "Hyderabad") => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      const res = await axios.get(url);
      setWeather(res.data);
    } catch (err) {
      console.error("Weather fetch error:", err);
    }
  };

  const fetchOrders = async (farmerId) => {
    try {
      const [ordersResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:3000/orders'),
        axios.get('http://localhost:3000/users')
      ]);

      const farmerOrders = ordersResponse.data.filter(order => order.farmerId === farmerId);      
      // Add customer phone numbers to orders
      const ordersWithPhones = farmerOrders.map(order => {
        const customer = usersResponse.data.find(user => user.id === order.customerId);
        return {
          ...order,
          customerPhone: customer?.phone || 'Not provided'
        };
      });
      
      setOrders(ordersWithPhones);
    } catch (error) {
      console.error('Fetch farmer orders error:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const fetchChats = async (farmerId) => {
    try {
      const response = await axios.get('http://localhost:3000/chats');
      const farmerChats = response.data.filter(chat => chat.farmerId === farmerId);
      setChats(farmerChats);
    } catch {
      toast.error('Failed to fetch chats');
    }
  };

  const handleOpenChat = (customerId, customerName) => {
    const customerChats = chats.filter(chat => chat.customerId === customerId);
    if (customerChats.length > 0) {
      const chat = customerChats[0];
      const cropData = {
        id: chat.cropId,
        cropName: chat.cropName,
        farmerId: chat.farmerId,
        farmerName: chat.farmerName,
        customerId,
        customerName
      };
      setSelectedChatCrop(cropData);
      setIsChatModalOpen(true);
    }
  };

  const groupedChats = chats.reduce((acc, chat) => {
    const customerId = chat.customerId;
    if (!acc[customerId]) {
      acc[customerId] = {
        customerId,
        customerName: chat.customerName,
        chats: [],
        totalMessages: 0,
        lastMessage: null,
        lastMessageTime: null
      };
    }
    acc[customerId].chats.push(chat);
    acc[customerId].totalMessages += (chat.messages?.length || 0);

    if (chat.messages && chat.messages.length > 0) {
      const lastMsg = chat.messages[chat.messages.length - 1];
      if (!acc[customerId].lastMessageTime || new Date(lastMsg.timestamp) > new Date(acc[customerId].lastMessageTime)) {
        acc[customerId].lastMessage = lastMsg;
        acc[customerId].lastMessageTime = lastMsg.timestamp;
      }
    }

    return acc;
  }, {});

  const groupedChatsList = Object.values(groupedChats).sort((a, b) => {
    if (!a.lastMessageTime) return 1;
    if (!b.lastMessageTime) return -1;
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
  });

  const handleAddCrop = () => {
    setEditingCrop(null);
    setIsModalOpen(true);
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setIsModalOpen(true);
  };

  const handleDeleteCrop = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await axios.delete(`http://localhost:3000/crops/${cropId}`);
        toast.success('Crop deleted successfully');
        fetchCrops(user.id);
      } catch {
        toast.error('Failed to delete crop');
      }
    }
  };

  const handleSaveCrop = async (cropData) => {
    try {
      if (editingCrop) {
        await axios.put(`http://localhost:3000/crops/${editingCrop.id}`, {
          ...cropData,
          id: editingCrop.id,
          farmerId: user.id,
          farmerName: user.name
        });
        toast.success('Crop updated successfully');
      } else {
        await axios.post('http://localhost:3000/crops', {
          ...cropData,
          farmerId: user.id,
          farmerName: user.name
        });
        toast.success('Crop added successfully');
      }
      setIsModalOpen(false);
      fetchCrops(user.id);
    } catch {
      toast.error('Failed to save crop');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (!user) return null;

  const totalCrops = crops.length;
  const totalValue = crops.reduce((sum, crop) => sum + Number(crop.quantity) * Number(crop.pricePerUnit), 0);
  const totalQuantity = crops.reduce((sum, crop) => sum + Number(crop.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        role="farmer"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 ml-64">
        <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-30 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {activeTab === 'crops'
                  ? 'My Crops'
                  : activeTab === 'overview'
                  ? 'Overview'
                  : activeTab === 'orders'
                  ? 'Orders Received'
                  : activeTab === 'messages'
                  ? 'Messages'
                  : 'Settings'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'crops'
                  ? `Welcome back, ${user.name}! Manage your crop inventory`
                  : activeTab === 'overview'
                  ? 'View your farm statistics and performance'
                  : activeTab === 'orders'
                  ? 'View and manage customer orders'
                  : activeTab === 'messages'
                  ? 'Chat with customers about your products'
                  : 'Manage your account settings'}
              </p>
            </div>
            {activeTab === 'crops' && (
              <button
                onClick={handleAddCrop}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <FaPlus /> Add New Crop
              </button>
            )}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Crops</p>
                    <h3 className="text-4xl font-bold mt-2">{totalCrops}</h3>
                    <p className="text-emerald-100 text-xs mt-2">Active listings</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <FaSeedling className="text-4xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lime-100 text-sm font-medium">Total Value</p>
                    <h3 className="text-4xl font-bold mt-2">₹{totalValue.toFixed(0)}</h3>
                    <p className="text-lime-100 text-xs mt-2">Inventory worth</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <FaRupeeSign className="text-4xl" />

                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Stock</p>
                    <h3 className="text-4xl font-bold mt-2">{totalQuantity}</h3>
                    <p className="text-blue-100 text-xs mt-2">kg available</p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    <FaBoxes className="text-4xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Weather in {weather?.name || user?.location || "Your Location"}</p>
                    <h3 className="text-4xl font-bold mt-2">
                      {weather ? `${Math.round(weather.main.temp)}°C` : "Loading..."}
                    </h3>
                    <p className="text-amber-100 text-xs mt-2 capitalize">
                      {weather ? weather.weather[0].description : "Fetching weather..."}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4">
                    {weather?.weather?.[0]?.icon ? (
                      <img
                        src={`http://openweathermap.org/img/w/${weather.weather[0].icon}.png`}
                        alt="weather-icon"
                        className="w-16"
                      />
                    ) : (
                      <FaSun className="text-4xl" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crops' && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">My Crop Inventory</h2>
                  <p className="text-gray-600 mt-1">Manage and track your agricultural products</p>
                </div>
              </div>

              {crops.length === 0 ? (
                <div className="text-center py-16">
                  <FaSeedling className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-4">No crops added yet</p>
                  <p className="text-gray-500 mb-6">Start by adding your first crop to manage your inventory</p>
                  <button
                    onClick={handleAddCrop}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 inline-flex items-center gap-2 transition-all shadow-lg font-semibold"
                  >
                    <FaPlus /> Add Your First Crop
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crops.map((crop) => (
                    <div key={crop.id} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group">
                      <div className="relative">
                        <img
                          src={crop.image}
                          alt={crop.cropName}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                            {crop.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{crop.cropName}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{crop.description}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                            <span className="text-gray-600 text-sm">Stock:</span>
                            <span className="font-bold text-gray-800">{crop.quantity} {crop.unit}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                            <span className="text-gray-600 text-sm">Price:</span>
                            <span className="font-bold text-emerald-600">₹{crop.pricePerUnit}/{crop.unit}</span>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg">
                            <span className="text-gray-600 text-sm">Harvest:</span>
                            <span className="font-semibold text-gray-800 text-sm">{crop.harvestDate}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCrop(crop)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all font-semibold"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCrop(crop.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all font-semibold"
                          >
                            <FaTrash /> Delete
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
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Customer Orders</h2>
                <p className="text-gray-600 mt-1">Track and manage orders from customers</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <FaBoxes className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No orders yet</p>
                  <p className="text-gray-500">Orders from customers will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Order Date</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Crop Name</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total Price</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Delivery Address</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-800">
                            <div className="font-medium">
                              {new Date(order.orderDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.orderDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{order.cropName}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">{order.customerName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {order.customerPhone && order.customerPhone !== 'Not provided' ? (
                              <div className="font-medium">{order.customerPhone}</div>
                            ) : (
                              <span className="text-gray-400 italic">Not provided</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-800">{order.quantity}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">₹{order.totalPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{order.deliveryAddress}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              ✓ {order.status}
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

          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Customer Messages</h2>
                <p className="text-gray-600 mt-1">View and respond to customer inquiries</p>
              </div>

              {chats.length === 0 ? (
                <div className="text-center py-16">
                  <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-2">No messages yet</p>
                  <p className="text-gray-500">Customer messages will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {groupedChatsList.map((customerGroup) => (
                    <div
                      key={customerGroup.customerId}
                      className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl p-5 border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleOpenChat(customerGroup.customerId, customerGroup.customerName)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-lime-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-lg">
                          👤
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-800 text-xl">{customerGroup.customerName}</h3>
                              <p className="text-sm text-emerald-700 font-semibold">
                                {customerGroup.chats.length} product{customerGroup.chats.length > 1 ? 's' : ''} • {customerGroup.totalMessages} message{customerGroup.totalMessages !== 1 ? 's' : ''}
                              </p>
                            </div>
                            {customerGroup.lastMessageTime && (
                              <span className="text-xs text-gray-500">
                                {new Date(customerGroup.lastMessageTime).toLocaleDateString()} {new Date(customerGroup.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {customerGroup.chats.map((chat) => (
                              <span key={chat.id} className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border border-gray-300">
                                🌾 {chat.cropName}
                              </span>
                            ))}
                          </div>

                          {customerGroup.lastMessage && (
                            <div className="bg-white rounded-lg p-3 border-2 border-emerald-200">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold text-emerald-600">{customerGroup.lastMessage.senderName}:</span>{' '}
                                {customerGroup.lastMessage.type === 'price_proposal'
                                  ? `💰 Proposed ₹${customerGroup.lastMessage.proposedPrice} (${customerGroup.lastMessage.status})`
                                  : customerGroup.lastMessage.text
                                }
                              </p>
                            </div>
                          )}
                        </div>
                        <button className="bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white rounded-xl px-5 py-3 flex items-center gap-2 transition-all font-semibold shadow-lg">
                          <FaComment /> Open Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
                <p className="text-gray-600 mt-1">Manage your account information</p>
              </div>

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
                        setEditedLocation(user.location || '');
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
                              location: editedLocation,
                              address: editedAddress
                            });
                            const updatedUser = { ...user, name: editedName, phone: editedPhone, location: editedLocation, address: editedAddress };
                            setUser(updatedUser);
                            localStorage.setItem('user', JSON.stringify(updatedUser));
                            
                            // Refresh weather if location changed
                            if (user.location !== editedLocation && editedLocation.trim()) {
                              fetchWeather(editedLocation);
                            }
                            
                            toast.success('Profile updated successfully!');
                            setIsEditingProfile(false);
                          } catch {
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
                          setEditedLocation(user.location || '');
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
                      Phone Number {isEditingProfile && <span className="text-emerald-600">*</span>}
                    </label>
                    <input
                      type="text"
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
                      Location {isEditingProfile && <span className="text-emerald-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={isEditingProfile ? editedLocation : (user.location || 'Not provided')}
                      onChange={(e) => setEditedLocation(e.target.value)}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                        isEditingProfile
                          ? 'bg-white border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      placeholder="Enter your city/location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Farm Address {isEditingProfile && <span className="text-emerald-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={isEditingProfile ? editedAddress : (user.address || 'Not provided')}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border-2 rounded-lg font-semibold transition-all ${
                        isEditingProfile
                          ? 'bg-white border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800'
                          : 'bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                      placeholder="Enter your farm address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Account Type</label>
                    <input
                      type="text"
                      value="Farmer"
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

      {isModalOpen && (
        <CropModal
          crop={editingCrop}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCrop}
        />
      )}

      {isChatModalOpen && selectedChatCrop && (
        <ChatModal
          crop={selectedChatCrop}
          user={user}
          onClose={() => {
            setIsChatModalOpen(false);
            fetchChats(user.id);
          }}
        />
      )}
    </div>
  );
};

export default FarmerDashboard;

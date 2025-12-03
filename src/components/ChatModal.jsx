import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaUser, FaDollarSign, FaCheck, FaTimes as FaTimesIcon } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatModal = ({ crop, user, onClose, onOrderComplete }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedQuantity, setProposedQuantity] = useState('');
  const [proposalAddress, setProposalAddress] = useState('');
  const [showPriceInput, setShowPriceInput] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [pendingAcceptance, setPendingAcceptance] = useState(null);
  const messagesEndRef = useRef(null);
  const otherUser = user.role === 'customer' ? crop.farmerName : null;
  const otherUserId = user.role === 'customer' ? crop.farmerId : null;

  useEffect(() => {
    fetchOrCreateChat();
    // More aggressive polling for real-time feel (500ms)
    const interval = setInterval(fetchMessages, 500);
    return () => clearInterval(interval);
  }, []);

  // Also fetch when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOrCreateChat = async () => {
    try {
      const response = await axios.get('http://localhost:3000/chats');
      
      if (user.role === 'farmer' && crop.customerId) {
        // Farmer viewing all chats with a specific customer
        const customerChats = response.data.filter(chat =>
          chat.customerId === crop.customerId && chat.farmerId === user.id
        );
        
        if (customerChats.length > 0) {
          // Combine all messages from all product chats with this customer
          const allMessages = [];
          customerChats.forEach(chat => {
            if (chat.messages && chat.messages.length > 0) {
              chat.messages.forEach(msg => {
                allMessages.push({
                  ...msg,
                  chatId: chat.id,
                  cropName: chat.cropName,
                  cropId: chat.cropId
                });
              });
            }
          });
          
          allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          setChatId(customerChats[0].id); 
          setMessages(allMessages);
        } else {
          setMessages([]);
        }
      } else {
        // Customer viewing chat about a specific product
        let existingChat = response.data.find(chat =>
          chat.cropId === crop.id &&
          ((chat.customerId === user.id && chat.farmerId === crop.farmerId) ||
           (chat.farmerId === user.id && chat.customerId === crop.farmerId))
        );

        if (!existingChat) {
          const newChat = {
            cropId: crop.id,
            cropName: crop.cropName,
            customerId: user.role === 'customer' ? user.id : crop.customerId,
            customerName: user.role === 'customer' ? user.name : crop.customerName,
            farmerId: crop.farmerId,
            farmerName: crop.farmerName,
            messages: []
          };
          const createResponse = await axios.post('http://localhost:3000/chats', newChat);
          existingChat = createResponse.data;
        }

        setChatId(existingChat.id);
        setMessages(existingChat.messages || []);
      }
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      if (user.role === 'farmer' && crop.customerId) {
        // Fetch all chats with this customer
        const response = await axios.get('http://localhost:3000/chats');
        const customerChats = response.data.filter(chat =>
          chat.customerId === crop.customerId && chat.farmerId === user.id
        );
        
        const allMessages = [];
        customerChats.forEach(chat => {
          if (chat.messages && chat.messages.length > 0) {
            chat.messages.forEach(msg => {
              allMessages.push({
                ...msg,
                chatId: chat.id,
                cropName: chat.cropName,
                cropId: chat.cropId
              });
            });
          }
        });
        
        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Only update if messages actually changed
        if (JSON.stringify(allMessages) !== JSON.stringify(messages)) {
          setMessages(allMessages);
        }
      } else {
        const response = await axios.get(`http://localhost:3000/chats/${chatId}`);
        const newMessages = response.data.messages || [];
        
        // Only update if messages actually changed
        if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      type: 'text',
      text: newMessage,
      timestamp: new Date().toISOString(),
      ...(user.role === 'farmer' && crop.customerId && { 
        cropName: crop.cropName,
        cropId: crop.cropId 
      })
    };

    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      // Get current chat to append message
      const response = await axios.get(`http://localhost:3000/chats/${chatId}`);
      const currentMessages = response.data.messages || [];
      const updatedMessages = [...currentMessages, message];
      
      await axios.patch(`http://localhost:3000/chats/${chatId}`, {
        messages: updatedMessages
      });
      
      // Force immediate fetch to show the new message
      setTimeout(() => fetchMessages(), 100);
    } catch (error) {
      toast.error('Failed to send message');
      setNewMessage(messageText); // Restore message on error
    }
  };

  const handleProposePrice = async () => {
    if (!proposedPrice || !chatId || proposedPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!proposedQuantity || proposedQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    // Only customers need to provide delivery address with their proposal
    if (user.role === 'customer' && !proposalAddress.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    // Get current crop stock from server
    let currentCrop;
    try {
      // For farmer counter-offers in grouped chat, crop.id might be set from message
      const cropId = crop.id;
      if (!cropId) {
        toast.error('Unable to identify product. Please try again.');
        return;
      }
      
      const cropResponse = await axios.get(`http://localhost:3000/crops/${cropId}`);
      currentCrop = cropResponse.data;
      
      if (parseFloat(proposedQuantity) > currentCrop.quantity) {
        toast.error(`Only ${currentCrop.quantity} ${currentCrop.unit} available in stock`);
        return;
      }
    } catch (error) {
      toast.error('Failed to check stock availability');
      return;
    }

    const totalAmount = parseFloat(proposedPrice) * parseFloat(proposedQuantity);

    const message = {
      id: Date.now(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      type: 'price_proposal',
      proposedPrice: parseFloat(proposedPrice),
      proposedQuantity: parseFloat(proposedQuantity),
      totalAmount: totalAmount,
      originalPrice: currentCrop.pricePerUnit,
      originalQuantity: currentCrop.quantity,
      cropId: currentCrop.id,
      status: 'pending',
      text: `${user.role === 'customer' ? 'Proposed' : 'Counter offer'}: ₹${proposedPrice}/${currentCrop.unit} × ${proposedQuantity} ${currentCrop.unit} = ₹${totalAmount.toFixed(2)}`,
      timestamp: new Date().toISOString(),
      ...(user.role === 'customer' && { deliveryAddress: proposalAddress }),
      ...(user.role === 'farmer' && crop.customerId && { 
        cropName: currentCrop.cropName,
        cropId: currentCrop.id 
      })
    };

    setProposedPrice('');
    setProposedQuantity('');
    setProposalAddress('');
    setShowPriceInput(false);

    try {
      // For farmer counter-offers, find the correct chat for this specific product
      let targetChatId = chatId;
      
      if (user.role === 'farmer' && crop.customerId && message.cropId) {
        // Find the chat that matches this specific crop
        const allChatsResponse = await axios.get('http://localhost:3000/chats');
        const specificChat = allChatsResponse.data.find(chat =>
          chat.cropId === message.cropId &&
          chat.customerId === crop.customerId &&
          chat.farmerId === user.id
        );
        
        if (specificChat) {
          targetChatId = specificChat.id;
        }
      }
      
      // Get current chat to append message
      const response = await axios.get(`http://localhost:3000/chats/${targetChatId}`);
      const currentMessages = response.data.messages || [];
      const updatedMessages = [...currentMessages, message];
      
      await axios.patch(`http://localhost:3000/chats/${targetChatId}`, {
        messages: updatedMessages
      });
      
      toast.success('Counter offer sent!');
      
      // Force immediate fetch
      setTimeout(() => fetchMessages(), 100);
    } catch (error) {
      toast.error('Failed to send price proposal');
    }
  };

  const confirmAcceptance = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address');
      return;
    }
    
    if (!customerPhone.trim()) {
      toast.error('Please enter phone number');
      return;
    }

    const messageId = pendingAcceptance;
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      const targetChatId = message.chatId || chatId;
      const chatResponse = await axios.get(`http://localhost:3000/chats/${targetChatId}`);
      const chat = chatResponse.data;

      // Get the crop to check availability
      const cropResponse = await axios.get(`http://localhost:3000/crops/${message.cropId || crop.id}`);
      const currentCrop = cropResponse.data;

      if (currentCrop.quantity < message.proposedQuantity) {
        toast.error(`Insufficient stock! Only ${currentCrop.quantity} ${currentCrop.unit} available`);
        setShowAddressInput(false);
        setDeliveryAddress('');
        setPendingAcceptance(null);
        return;
      }

      // Create order
      const order = {
        customerId: user.id,
        customerName: user.name,
        farmerId: currentCrop.farmerId,
        farmerName: currentCrop.farmerName,
        cropId: currentCrop.id,
        cropName: currentCrop.cropName,
        quantity: message.proposedQuantity,
        pricePerUnit: parseFloat(message.proposedPrice.toFixed(2)),
        totalPrice: parseFloat(message.totalAmount.toFixed(2)),
        unit: currentCrop.unit,
        status: 'success',
        orderDate: new Date().toISOString(),
        deliveryAddress: deliveryAddress,
        customerPhone: customerPhone
      };

      await axios.post('http://localhost:3000/orders', order);

      // Update crop stock
      await axios.patch(`http://localhost:3000/crops/${currentCrop.id}`, {
        quantity: currentCrop.quantity - message.proposedQuantity
      });

      // Update message status
      const updatedChatMessages = chat.messages.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            status: 'purchased',
            acceptedBy: user.id,
            purchasedAt: new Date().toISOString(),
            deliveryAddress: deliveryAddress
          };
        }
        return m;
      });

      await axios.patch(`http://localhost:3000/chats/${targetChatId}`, {
        messages: updatedChatMessages
      });

      toast.success('Order placed successfully! 🎉');
      setShowAddressInput(false);
      setDeliveryAddress('');
      setCustomerPhone('');
      setPendingAcceptance(null);

      // Notify parent to refresh crops
      if (onOrderComplete) {
        onOrderComplete();
      }

      setTimeout(() => fetchMessages(), 100);
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const handleRespondToPrice = async (messageId, response, counterPrice = null) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      // Get the specific chat this message belongs to
      const targetChatId = message.chatId || chatId;
      const chatResponse = await axios.get(`http://localhost:3000/chats/${targetChatId}`);
      const chat = chatResponse.data;
      
      // If customer accepts, prompt for delivery address first
      if (response === 'accepted' && user.role === 'customer') {
        setPendingAcceptance(messageId);
        setShowAddressInput(true);
        return;
      }
      
      // If farmer accepts, create order and update stock
      if (response === 'accepted' && user.role === 'farmer') {
        // Get the crop to check availability
        const cropResponse = await axios.get(`http://localhost:3000/crops/${message.cropId || crop.id}`);
        const currentCrop = cropResponse.data;

        if (currentCrop.quantity < message.proposedQuantity) {
          toast.error(`Insufficient stock! Only ${currentCrop.quantity} ${currentCrop.unit} available`);
          return;
        }

        // Get customer's delivery address from the original proposal message
        const customerMessage = chat.messages.find(m => m.id === messageId);
        const address = customerMessage?.deliveryAddress || message.deliveryAddress || 'Address not provided';

        // Create order
        const order = {
          customerId: message.senderId,
          customerName: message.senderName,
          farmerId: user.id,
          farmerName: user.name,
          cropId: currentCrop.id,
          cropName: currentCrop.cropName,
          quantity: message.proposedQuantity,
          pricePerUnit: message.proposedPrice,
          totalPrice: message.totalAmount,
          unit: currentCrop.unit,
          status: 'success',
          orderDate: new Date().toISOString(),
          deliveryAddress: address
        };

        await axios.post('http://localhost:3000/orders', order);

        // Update crop stock
        await axios.patch(`http://localhost:3000/crops/${currentCrop.id}`, {
          quantity: currentCrop.quantity - message.proposedQuantity
        });
      }
      
      // Update the message in that chat
      const updatedChatMessages = chat.messages.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            status: response === 'accepted' ? 'purchased' : response,
            ...(response === 'accepted' && { acceptedBy: user.id, purchasedAt: new Date().toISOString() }),
            ...(response === 'rejected' && { rejectedBy: user.id })
          };
        }
        return m;
      });

      await axios.patch(`http://localhost:3000/chats/${targetChatId}`, {
        messages: updatedChatMessages
      });

      if (response === 'accepted') {
        toast.success('Offer accepted & Order created! 🎉');
      } else if (response === 'rejected') {
        toast.info('Offer declined');
      }

      setTimeout(() => fetchMessages(), 100);

      // If counter offer, send new proposal
      if (counterPrice) {
        setTimeout(() => {
          setProposedPrice(counterPrice.toString());
          handleProposePrice();
        }, 500);
      }
    } catch (error) {
      toast.error('Failed to respond');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[600px] flex flex-col animate-slideUp">
        <div className="bg-gradient-to-r from-emerald-600 to-lime-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold">
              {user.role === 'customer' ? `Chat about ${crop.cropName}` : `Chat with ${crop.customerName}`}
            </h2>
            <p className="text-emerald-100 text-sm">
              {user.role === 'customer' ? `Chatting with ${crop.farmerName}` : `All conversations with this customer`}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {(user.role === 'customer' || !crop.customerId) && (
          <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌾</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{crop.cropName}</p>
                <p className="text-sm text-gray-600">
                  ${crop.pricePerUnit}/{crop.unit} • {crop.quantity} {crop.unit} available
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
              {user.role === 'customer' && (
                <p className="text-sm text-emerald-600 mt-2"> You can propose a custom price below</p>
              )}
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`max-w-[75%] ${msg.senderId === user.id ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <FaUser className={`text-xs ${msg.senderId === user.id ? 'text-emerald-600' : 'text-gray-500'}`} />
                    <span className="text-xs font-semibold text-gray-700">
                      {msg.senderName}
                    </span>
                    {user.role === 'farmer' && msg.cropName && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        🌾 {msg.cropName}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Text Message */}
                  {msg.type === 'text' && (
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.senderId === user.id
                          ? 'bg-emerald-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  )}

                  {/* Price Proposal */}
                  {msg.type === 'price_proposal' && (
                    <div className={`rounded-2xl overflow-hidden border-2 ${
                      msg.status === 'purchased' ? 'border-green-500' :
                      msg.status === 'rejected' ? 'border-red-500' :
                      'border-amber-400'
                    }`}>
                      <div className={`px-4 py-3 ${
                        msg.senderId === user.id
                          ? 'bg-gradient-to-r from-emerald-600 to-lime-600 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FaDollarSign className="text-lg" />
                          <span className="font-bold text-sm">
                            {msg.status === 'purchased' ? ' Purchase Order' : 'Price Proposal'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">${msg.proposedPrice}</span>
                            <span className="text-sm opacity-90">/{crop.unit || 'unit'}</span>
                            <span className="text-sm opacity-90">× {msg.proposedQuantity} {crop.unit || 'units'}</span>
                          </div>
                          <div className="text-lg font-semibold">
                            Total: ${msg.totalAmount?.toFixed(2) || (msg.proposedPrice * msg.proposedQuantity).toFixed(2)}
                          </div>
                          <div className="text-xs opacity-80">
                            Original: ${msg.originalPrice}/{crop.unit || 'unit'}
                          </div>
                        </div>
                      </div>

                      {/* Response Actions - For both farmer and customer */}
                      {msg.status === 'pending' && msg.senderId !== user.id && (
                        <div className="bg-white p-3 space-y-2 flex flex-col gap-1.5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespondToPrice(msg.id, 'accepted')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-all font-semibold text-sm"
                            >
                              <FaCheck /> Accept
                            </button>
                            <button
                              onClick={() => handleRespondToPrice(msg.id, 'rejected')}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-all font-semibold text-sm"
                            >
                              <FaTimesIcon /> Decline
                            </button>
                          </div>
                          {user.role === 'farmer' && (
                            <button
                              onClick={async () => {
                                setProposedPrice(msg.proposedPrice.toString());
                                setProposedQuantity(msg.proposedQuantity.toString());
                                setShowPriceInput(true);
                                
                                // Store the crop details from the message for counter-offer
                                if (msg.cropId && crop.customerId) {
                                  try {
                                    const cropResponse = await axios.get(`http://localhost:3000/crops/${msg.cropId}`);
                                    // Update crop reference for this counter-offer
                                    crop.id = msg.cropId;
                                    crop.pricePerUnit = cropResponse.data.pricePerUnit;
                                    crop.quantity = cropResponse.data.quantity;
                                    crop.unit = cropResponse.data.unit;
                                  } catch (error) {
                                    console.error('Failed to fetch crop details');
                                  }
                                }
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 font-semibold text-sm"
                            >
                              💬 Counter Offer
                            </button>
                          )}
                        </div>
                      )}

                      {/* Status Display */}
                      {msg.status === 'purchased' && (
                        <div className="bg-green-50 px-4 py-3 space-y-1">
                          <div className="text-center text-green-700 font-bold text-sm flex items-center justify-center gap-2">
                            <FaCheck />  PURCHASED!
                          </div>
                          <div className="text-center text-xs text-green-600">
                            Order created • Stock updated
                          </div>
                          {msg.purchasedAt && (
                            <div className="text-center text-xs text-gray-500">
                              {new Date(msg.purchasedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                      {msg.status === 'rejected' && (
                        <div className="bg-red-50 px-4 py-2 text-center">
                          <span className="text-red-700 font-semibold text-sm flex items-center justify-center gap-2">
                            <FaTimesIcon /> Offer Declined
                          </span>
                        </div>
                      )}
                      {msg.status === 'pending' && msg.senderId === user.id && (
                        <div className="bg-amber-50 px-4 py-2 text-center">
                          <span className="text-amber-700 font-semibold text-sm">
                            ⏳ Waiting for response...
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 rounded-b-2xl">
          {/* Price Proposal Section */}
          {showPriceInput ? (
            <div className="p-4 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <FaDollarSign className="text-amber-600" />
                <span className="font-semibold text-gray-800">
                  {user.role === 'customer' ? 'Propose Your Price & Quantity' : 'Set Counter Offer'}
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-3 text-gray-600 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder={`e.g., ${(crop.pricePerUnit * 0.8).toFixed(2)}`}
                    className="w-full pl-8 pr-16 py-3 bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold"
                  />
                  <span className="absolute right-4 top-3 text-gray-600 text-sm">per {crop.unit}</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max={crop.quantity}
                    value={proposedQuantity}
                    onChange={(e) => setProposedQuantity(e.target.value)}
                    placeholder={`Quantity (max: ${crop.quantity})`}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-semibold"
                  />
                  <span className="absolute right-4 top-3 text-gray-600 text-sm">{crop.unit}</span>
                </div>
              </div>
              {proposedPrice && proposedQuantity && (
                <div className="mb-3 text-center text-emerald-700 font-bold text-lg">
                  Total: ₹{(parseFloat(proposedPrice) * parseFloat(proposedQuantity)).toFixed(2)}
                </div>
              )}
              {user.role === 'customer' && (
                <div className="mb-3">
                  <input
                    type="text"
                    value={proposalAddress}
                    onChange={(e) => setProposalAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium"
                    required
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleProposePrice}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 py-3 font-semibold transition-all"
                >
                  Send Offer
                </button>
                <button
                  onClick={() => {
                    setShowPriceInput(false);
                    setProposedPrice('');
                    setProposedQuantity('');
                    setProposalAddress('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl px-4 py-3 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Current price: ₹{crop.pricePerUnit || '?'}/{crop.unit || 'unit'} • Available: {crop.quantity || '?'} {crop.unit || 'units'}
              </p>
            </div>
          ) : showAddressInput ? (
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <FaCheck className="text-green-600" />
                <span className="font-semibold text-gray-800">
                  Enter Delivery Address
                </span>
              </div>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-white border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-3"
              />
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your complete delivery address..."
                rows="3"
                className="w-full px-4 py-3 bg-white border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={confirmAcceptance}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-semibold transition-all"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => {
                    setShowAddressInput(false);
                    setDeliveryAddress('');
                    setCustomerPhone('');
                    setPendingAcceptance(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl px-4 py-3 font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            user.role === 'customer' && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200">
                <button
                  onClick={() => setShowPriceInput(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all font-semibold"
                >
                  <FaDollarSign /> Propose a Price
                </button>
              </div>
            )
          )}

          {/* Text Message Input */}
          <form onSubmit={handleSendMessage} className="p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 flex items-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <FaPaperPlane /> Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

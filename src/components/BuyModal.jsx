import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BuyModal = ({ crop, customerAddress, onClose, onPlaceOrder }) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState(customerAddress || '');

  const totalPrice = ((quantity || 0) * crop.pricePerUnit).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalQuantity = parseInt(quantity) || 0;
    
    if (finalQuantity <= 0) {
      toast.error('Please enter a valid quantity!');
      return;
    }
    
    if (finalQuantity > crop.quantity) {
      toast.error(`Only ${crop.quantity} ${crop.unit} available in stock!`);
      return;
    }
    
    if (!deliveryAddress.trim()) {
      toast.error('Please enter delivery address!');
      return;
    }
    
    onPlaceOrder({
      cropId: crop.id,
      cropName: crop.cropName,
      farmerId: crop.farmerId,
      farmerName: crop.farmerName,
      quantity: finalQuantity,
      totalPrice: parseFloat(totalPrice),
      deliveryAddress: deliveryAddress
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-lime-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold">Place Your Order</h2>
            <p className="text-emerald-100 text-xs mt-1">Complete your purchase details</p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Crop Info Card */}
          <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl p-4 border-2 border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-emerald-600 rounded-lg flex items-center justify-center text-2xl">
                🌾
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{crop.cropName}</h3>
                <p className="text-emerald-600 font-semibold text-sm">{crop.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 mb-1">Farmer</p>
                <p className="font-bold text-gray-800 text-sm">{crop.farmerName}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 mb-1">Available</p>
                <p className="font-bold text-gray-800 text-sm">{crop.quantity} {crop.unit}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-600 mb-1">Price</p>
                <p className="font-bold text-emerald-600 text-sm">₹{crop.pricePerUnit}/{crop.unit}</p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Quantity ({crop.unit}) *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for user to clear and type new value
                if (value === '') {
                  setQuantity('');
                  return;
                }
                
                const numValue = parseInt(value);
                // Set the value as long as it's a valid number
                if (!isNaN(numValue) && numValue >= 0) {
                  setQuantity(numValue);
                }
              }}
              onBlur={(e) => {
                // When user leaves the field, ensure it has a valid value
                const val = parseInt(e.target.value);
                if (e.target.value === '' || isNaN(val) || val < 1) {
                  toast.error("Enter correct quantity")
                  return
                } else if (val > crop.quantity) {
                  toast.error(`Maximum available quantity is ${crop.quantity} ${crop.unit}`);
                  return
                }
              }}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
              min="1"
              max={crop.quantity}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Maximum available: {crop.quantity} {crop.unit}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address *</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              rows="3"
              placeholder="Enter your complete delivery address..."
              required
            />
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-emerald-600 to-lime-600 rounded-xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-emerald-100 text-xs mb-1">Total Amount</p>
                <p className="text-3xl font-bold">₹{totalPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-sm">{quantity} × ₹{crop.pricePerUnit}</p>
                <p className="text-xs text-emerald-200 mt-1">Delivery included</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white rounded-xl px-6 py-3 font-bold transition-all shadow-lg hover:shadow-xl"
            >
              🛒 Confirm Order
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl px-6 py-3 font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyModal;

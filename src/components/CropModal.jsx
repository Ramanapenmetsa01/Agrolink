import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const CropModal = ({ crop, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    cropName: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    description: '',
    harvestDate: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (crop) {
      setFormData(crop);
      setImagePreview(crop.image);
    }
  }, [crop]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({
          ...formData,
          image: base64String
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-lime-600 text-white px-8 py-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-3xl font-bold">
              {crop ? 'Edit Crop Details' : 'Add New Crop'}
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              {crop ? 'Update your crop information' : 'Add a new crop to your inventory'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Crop Name *</label>
              <input
                type="text"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="e.g., Organic Tomatoes"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="Vegetables">🥬 Vegetables</option>
                <option value="Fruits">🍎 Fruits</option>
                <option value="Grains">🌾 Grains</option>
                <option value="Legumes">🫘 Legumes</option>
                <option value="Herbs">🌿 Herbs</option>
                <option value="Others">📦 Others</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="100"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="ton">Tons</option>
                <option value="dozen">Dozen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price per Unit ($) *</label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="3.50"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Harvest Date *</label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Describe your crop quality, growing method, etc..."
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Crop Image *</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="w-full px-4 py-3 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl hover:border-emerald-500 transition-all text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-600">
                      <span className="text-2xl">📤</span>
                      <span className="font-semibold">Choose Image</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, image: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 text-white rounded-xl px-6 py-4 font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {crop ? '✓ Update Crop' : '+ Add Crop'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl px-6 py-4 font-bold text-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropModal;

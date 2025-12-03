import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLeaf, FaArrowRight } from 'react-icons/fa';

const FarmerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = {
        ...formData,
        role: 'farmer'
      };
      await axios.post('http://localhost:3000/users', newUser);
      toast.success('🎉 Registration successful! Please login.');
      navigate('/');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-lime-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <FaLeaf className="text-4xl" />
            <h1 className="text-4xl font-bold">Agrolink</h1>
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Join as a Farmer</h2>
          <p className="text-emerald-50 text-lg leading-relaxed mb-8">
            Expand your reach, manage crops digitally, and connect with customers directly.
          </p>

          <div className="space-y-5 gap-1 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">✓</div>
              <span>Manage crop inventory easily</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">✓</div>
              <span>Reach more customers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">✓</div>
              <span>Track sales and orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-lg">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaLeaf className="text-3xl text-emerald-600" />
              <h1 className="text-3xl font-bold text-emerald-600">Agrolink</h1>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Farmer Account</h2>
              <p className="text-gray-600">Join our community of farmers</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Enter your Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      placeholder="123-456-7890"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      placeholder="City"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-4 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group mt-6"
              >
                Create Account
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">Already have an account?</p>
              <Link to="/" className="text-emerald-600 hover:underline font-semibold inline-block mt-2">
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegister;

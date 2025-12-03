import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLeaf, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
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
      const response = await axios.get('http://localhost:3000/users');
      const user = response.data.find(
        u => u.email === formData.email && 
             u.password === formData.password && 
             u.role === formData.role
      );

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Welcome back! Login successful');
        if (user.role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        toast.error('Invalid credentials or role');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-700 via-emerald-600 to-lime-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-lime-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <FaLeaf className="text-5xl" />
            <div>
              <h1 className="text-5xl font-bold">Agrolink</h1>
              <p className="text-emerald-100 text-lg">Your Agricultural Partner</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Connecting Farmers<br />with Customers
          </h2>
          
          <p className="text-xl text-emerald-50 mb-12 leading-relaxed">
            A modern platform bridging the gap between fresh produce and consumers. 
            Manage your farm, sell crops, or discover local organic products.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">🌾</div>
              <div>
                <h3 className="font-semibold text-lg">For Farmers</h3>
                <p className="text-emerald-100">Manage inventory, track sales, reach more customers</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">🛒</div>
              <div>
                <h3 className="font-semibold text-lg">For Customers</h3>
                <p className="text-emerald-100">Buy fresh, support local, enjoy quality produce</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaLeaf className="text-3xl text-emerald-600" />
              <h1 className="text-3xl font-bold text-emerald-600">Agrolink</h1>
            </div>
            <p className="text-gray-600">Your Agricultural Partner</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-2">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h2>
              <p className="text-gray-600">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  I am a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'farmer'})}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      formData.role === 'farmer'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🌾 Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'customer'})}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      formData.role === 'customer'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🛒 Customer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 my-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Enter Email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-4 mt-2 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Sign In
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600 mb-1">Don't have an account?</p>
              <div className="flex gap-3">
                <Link
                  to="/register/farmer"
                  className="flex-1 text-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Register as Farmer
                </Link>
                <Link
                  to="/register/customer"
                  className="flex-1 text-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Register as Customer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

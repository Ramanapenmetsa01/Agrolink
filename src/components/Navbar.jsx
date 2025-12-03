import { FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-emerald-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Agrolink</h1>
            <p className="text-sm text-emerald-100">Bridge between Customers and Farmers</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-700 px-4 py-2 rounded-lg">
              <FaUser />
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-emerald-200">{user.role}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

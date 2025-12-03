import { FaLeaf, FaChartLine, FaSeedling, FaCog, FaSignOutAlt, FaUser, FaShoppingCart, FaBox, FaClipboardList, FaComments } from 'react-icons/fa';

const Sidebar = ({ user, onLogout, role, activeTab, setActiveTab }) => {
  const farmerMenuItems = [
    { icon: FaChartLine, label: 'Overview', value: 'overview' },
    { icon: FaSeedling, label: 'My Crops', value: 'crops' },
    { icon: FaClipboardList, label: 'Orders Received', value: 'orders' },
    { icon: FaComments, label: 'Messages', value: 'messages' },
    { icon: FaCog, label: 'Settings', value: 'settings' },
  ];

  const customerMenuItems = [
    { icon: FaShoppingCart, label: 'Marketplace', value: 'marketplace' },
    { icon: FaBox, label: 'My Orders', value: 'orders' },
    { icon: FaCog, label: 'Settings', value: 'settings' },
  ];

  const menuItems = role === 'farmer' ? farmerMenuItems : customerMenuItems;

  return (
    <div className="w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 text-white min-h-screen flex flex-col shadow-xl fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <FaLeaf className="text-3xl text-lime-400" />
          <div>
            <h1 className="text-2xl font-bold">Agrolink</h1>
            <p className="text-xs text-emerald-300">Your Agricultural Partner</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-emerald-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center">
            <FaUser className="text-xl" />
          </div>
          <div>
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => setActiveTab && setActiveTab(item.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  activeTab === item.value
                    ? 'bg-emerald-700 shadow-lg scale-105'
                    : 'hover:bg-emerald-700/50'
                }`}
              >
                <item.icon className="text-lg" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-emerald-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors text-left font-medium"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

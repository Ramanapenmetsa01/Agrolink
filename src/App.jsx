import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import components
import Login from './components/Login';
import FarmerRegister from './components/FarmerRegister';
import CustomerRegister from './components/CustomerRegister';
import FarmerDashboard from './components/FarmerDashboard';
import CustomerDashboard from './components/CustomerDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register/farmer" element={<FarmerRegister />} />
          <Route path="/register/customer" element={<CustomerRegister />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;

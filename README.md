# 🌾 AgroLink - Agricultural Marketplace Platform

A modern web-based marketplace connecting farmers directly with customers, enabling seamless buying, selling, and communication for agricultural products.

## 📋 Overview

AgroLink is a full-stack web application designed to bridge the gap between farmers and customers. It provides a platform where farmers can list their crops, manage orders, and communicate with buyers, while customers can browse products, make purchases, and negotiate prices through an integrated chat system.

## ✨ Key Features

### 👨‍🌾 Farmer Dashboard
- **Crop Management**: Add, edit, and delete crop listings with images, prices, and quantities
- **Order Management**: View and track customer orders with real-time updates
- **Live Weather**: Location-based weather updates using OpenWeatherMap API
- **Chat System**: Communicate with customers and manage price negotiations
- **Profile Settings**: Update location, address, and contact information

### 🛒 Customer Dashboard
- **Product Marketplace**: Browse available crops with search and filtering
- **Direct Purchase**: Buy products instantly with quantity validation
- **Price Negotiation**: Chat with farmers and propose custom prices
- **Order Tracking**: View order history and status updates
- **Profile Management**: Edit delivery address and contact details

### 💬 Real-Time Features
- **Instant Messaging**: Text-based chat between farmers and customers
- **Price Proposals**: Customers can propose prices with delivery addresses
- **Live Updates**: 2-second polling for orders, crops, and messages
- **Stock Synchronization**: Automatic inventory updates on purchases

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **React Router DOM 7.9.6** - Client-side routing
- **Tailwind CSS 4.1.17** - Utility-first styling
- **Axios 1.13.2** - HTTP client
- **React Icons 5.5.0** - Icon library
- **React Toastify 11.0.5** - Toast notifications

### Backend
- **JSON Server 0.17.4** - Mock REST API
- **Node.js** - JavaScript runtime
- **File-based Database** - JSON data storage

### External APIs
- **OpenWeatherMap API** - Real-time weather data

## 📁 Project Structure

```
Agrolink/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images and media
│   ├── components/     # React components
│   │   ├── FarmerDashboard.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── ChatModal.jsx
│   │   ├── BuyModal.jsx
│   │   ├── CropModal.jsx
│   │   └── Sidebar.jsx
│   ├── App.jsx         # Main application component
│   ├── App.css         # Application styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── db.json             # Database file
├── .env               # Environment variables
├── .gitignore         # Git ignore rules
├── package.json       # Dependencies
├── vite.config.js     # Vite configuration
└── README.md          # Documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ramanapenmetsa01/Agrolink.git
cd Agrolink
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
```

Get your API key from [OpenWeatherMap](https://openweathermap.org/api)

### Step 4: Start the Backend Server
```bash
npm run server
```
JSON Server will run on `http://localhost:3000`

### Step 5: Start the Development Server
Open a new terminal and run:
```bash
npm run dev
```
Application will run on `http://localhost:5173`

## 👤 Demo Accounts

### Farmer Account
- **Username**: `farmer1`
- **Password**: `farmer123`

### Customer Account
- **Username**: `customer1`
- **Password**: `customer123`

## 📊 Database Schema

### Users Collection
```json
{
  "id": 1,
  "username": "farmer1",
  "password": "farmer123",
  "role": "farmer",
  "phone": "9876543210",
  "location": "Hyderabad",
  "address": "123 Farm Lane, Hyderabad"
}
```

### Crops Collection
```json
{
  "id": 1,
  "name": "Tomato",
  "price": 40,
  "quantity": 100,
  "unit": "kg",
  "image": "image-url",
  "farmerId": 1
}
```

### Orders Collection
```json
{
  "id": 1,
  "customerId": 2,
  "customerPhone": "9876543211",
  "cropId": 1,
  "quantity": 10,
  "totalPrice": 400.00,
  "orderDate": "2025-12-03T10:30:00.000Z",
  "status": "Pending"
}
```

### Chats Collection
```json
{
  "id": 1,
  "customerId": 2,
  "farmerId": 1,
  "cropId": 1,
  "messages": [
    {
      "sender": "customer",
      "message": "Is this fresh?",
      "timestamp": "2025-12-03T10:30:00.000Z"
    }
  ],
  "proposalAddress": "456 City Road, Hyderabad"
}
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run server` - Start JSON Server backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌟 Key Functionalities

### Real-Time Updates
- Polls server every 2 seconds for live data
- Immediate UI updates on state changes
- Synchronized inventory across all users

### Price Negotiation
1. Customer browses products
2. Clicks "Chat with Farmer"
3. Proposes custom price with delivery address
4. Farmer reviews proposal in Messages tab
5. Can accept, counter-offer, or decline

### Direct Purchase Flow
1. Customer selects product
2. Enters quantity (validated against stock)
3. Confirms order
4. Stock automatically decrements
5. Order appears in both dashboards instantly

### Weather Integration
- Displays current weather for user's location
- Temperature, conditions, humidity, wind speed
- Fallback to mock data if API fails
- Updates based on editable location in settings

## 🔐 Security Features

- Password-based authentication
- Role-based access control (Farmer/Customer)
- Session management with localStorage
- Input validation and sanitization
- Protected routes based on user role

## 🎯 Future Enhancements

- Payment gateway integration
- Order status workflow (Pending → Processing → Delivered)
- Rating and review system
- Advanced search and filtering
- Email/SMS notifications
- Multi-language support
- Mobile responsive optimization
- Image upload for crops
- Analytics dashboard for farmers

## 📝 Testing Checklist

### Farmer Features
- ✅ Login with farmer credentials
- ✅ Add new crop listings
- ✅ Edit existing crops
- ✅ Delete crops
- ✅ View incoming orders
- ✅ Check weather updates
- ✅ Receive and respond to messages
- ✅ Update profile settings

### Customer Features
- ✅ Login with customer credentials
- ✅ Browse marketplace
- ✅ Search for products
- ✅ Make direct purchases
- ✅ Initiate chat with farmers
- ✅ Propose custom prices
- ✅ View order history
- ✅ Update delivery address

## 🐛 Known Issues

- Weather API requires valid key (fallback mock data available)
- Real-time updates use polling (WebSocket upgrade planned)
- File uploads not implemented (image URLs required)

## 📄 License

This project is developed for educational purposes.

## 👨‍💻 Developer

**Ramana Penmetsa**
- GitHub: [@Ramanapenmetsa01](https://github.com/Ramanapenmetsa01)
- Project: [AgroLink](https://github.com/Ramanapenmetsa01/Agrolink)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support or queries, please open an issue in the GitHub repository.

---

**Made with ❤️ for farmers and customers**

import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import io from "socket.io-client";

// const socket = io("https://server-08ld.onrender.com");
// const socket = io("https://server-08ld.onrender.com");
const socket = io(`https://server-08ld.onrender.com`);

function App() {
  const [count, setCount] = useState(0);
  const [orders, setOrders] = useState([]);

  const id = "cash";
  const grantOrder = (index) => {
    const newOrders = [...orders];
    console.log(newOrders[index]._id);
    const id = newOrders[index]._id;
    const selectedOrder = newOrders[index];
    selectedOrder.status = "granted";
    newOrders[index] = selectedOrder;
    console.log(newOrders);
    socket.emit("updateToPrepare", { id, status: "granted" });

    localStorage.setItem("recivedOrders", JSON.stringify(newOrders));
    setOrders(newOrders);
  };
  const completeOrder = (index) => {
    const newOrders = [...orders];
    console.log(newOrders[index]._id);
    const id = newOrders[index]._id;
    const selectedOrder = newOrders[index];
    selectedOrder.status = "complete";
    newOrders[index] = selectedOrder;
    console.log(newOrders);
    socket.emit("updateToPrepare", { id, status: "complete" });

    localStorage.setItem("recivedOrders", JSON.stringify(newOrders));
    setOrders(newOrders);
  };
  const getRecivedOrders = async () => {
    try {
      const response = await fetch(
        `https://server-08ld.onrender.com/getRecivedOrders`
      );
      const jsonData = await response.json();
      console.log(jsonData);
      setOrders(jsonData);
      localStorage.setItem("recivedOrders", JSON.stringify(jsonData));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // const recivedOrders = JSON.parse(localStorage.getItem(`recivedOrders`)) || [];
    // setOrders(recivedOrders)
    getRecivedOrders();

    const handleReciveOrder = (data) => {
      console.log(data);

      const recivedOrders =
        JSON.parse(localStorage.getItem(`recivedOrders`)) || [];

        
      recivedOrders.push(data);
      recivedOrders = recivedOrders.slice().reverse()

      setOrders(recivedOrders);
      localStorage.setItem("recivedOrders", JSON.stringify(recivedOrders));
    };

    socket.on("recive_order", handleReciveOrder);

    return () => {
      socket.off("recive_order", handleReciveOrder);
    };
  }, [socket]);

return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 text-center">
          Order Management
        </h1>
        <p className="mt-2 text-center text-gray-600">
          Real-time order tracking and management
        </p>
      </header>

      {/* Orders Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            {/* Status Banner */}
            <div
              className={`px-6 py-3 rounded-t-xl text-sm font-medium
                ${
                  order.status === "process"
                    ? "bg-yellow-50 text-yellow-700 border-b border-yellow-100"
                    : order.status === "granted"
                    ? "bg-blue-50 text-blue-700 border-b border-blue-100"
                    : "bg-green-50 text-green-700 border-b border-green-100"
                }`}
            >
              <div className="flex items-center justify-between">
                <span>Order #{order._id.slice(-6)}</span>
                <span className="inline-flex items-center">
                  {order.status === "process"
                    ? "🕒"
                    : order.status === "granted"
                    ? "👨‍🍳"
                    : "✅"}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3 text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-sm">
                  House {order.house}, Road {order.road}, Sector {order.sector},
                  Uttara
                </p>
              </div>
              <div className="mt-3 flex items-center space-x-3 text-gray-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <p className="text-sm font-medium">{order.phoneNumber}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4 space-y-3">
              {order.orders.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {item.edited
                          ? item.selectedSize || item.size[0].size
                          : item.size[0].size}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm font-medium text-gray-900">
                        ৳{item.price}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
              {order.status === "process" ? (
                <button
                  onClick={() => grantOrder(index)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                             py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 
                             transition duration-200 font-medium"
                >
                  Accept Order
                </button>
              ) : order.status === "granted" ? (
                <button
                  onClick={() => completeOrder(index)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white 
                             py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-800 
                             transition duration-200 font-medium"
                >
                  Mark as Complete
                </button>
              ) : (
                <div className="text-center text-green-600 font-medium">
                  ✨ Order Completed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}

export default App;

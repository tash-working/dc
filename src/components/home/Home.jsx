import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import io from "socket.io-client";

// const socket = io("https://server-08ld.onrender.com/");
// const socket = io("https://server-08ld.onrender.com/");
const socket = io(`https://server-08ld.onrender.com/`);

function Home() {
  const [count, setCount] = useState(0);
  const [orders, setOrders] = useState([]);

  const id = "cash";
  const grantOrder = (index) => {
    console.log(index);

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

  const handleClick = () => {
    const now = new Date();

    // Get the date components
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Pad with leading zero if needed
    const day = now.getDate().toString().padStart(2, "0");

    // Get the time components in 24-hour format
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    // Format the date and time string
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return formattedDateTime;
  };

  const completeOrder = (index) => {
    const orderCompleteTime = handleClick();

    console.log(index);

    const newOrders = [...orders];
    console.log(newOrders[index]._id);
    const id = newOrders[index]._id;
    const selectedOrder = newOrders[index];
    selectedOrder.status = "complete";
    newOrders[index] = selectedOrder;
    newOrders[index].orderCompleteTime = orderCompleteTime;
    console.log(newOrders);
    socket.emit("updateToPrepare", {
      id,
      status: "complete",
      orderCompleteTime,
    });

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

      let recivedOrders =
        JSON.parse(localStorage.getItem(`recivedOrders`)) || [];

      recivedOrders.push(data);
      // recivedOrders = recivedOrders.slice().reverse()

      setOrders(recivedOrders);
      localStorage.setItem("recivedOrders", JSON.stringify(recivedOrders));
    };

    socket.on("recive_order", handleReciveOrder);

    return () => {
      socket.off("recive_order", handleReciveOrder);
    };
  }, [socket]);
  // Add modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);

  // Add modal handlers
  const openModal = (type, index) => {
    setModalType(type);
    setSelectedOrderIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setSelectedOrderIndex(null);
  };

  const handleConfirm = () => {
    if (modalType === "accept") {
      grantOrder(selectedOrderIndex);
    } else {
      completeOrder(selectedOrderIndex);
    }
    closeModal();
  };

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
        <nav className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <Link to="/" className="border-b-2 border-indigo-500 py-4 px-1">
                <span className="text-sm font-medium text-indigo-600">
                  Orders
                </span>
              </Link>
              <Link to="/History" className="py-4 px-1">
                <span className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  History
                </span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Orders Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {orders
            .slice()
            .reverse()
            .map((order, index) => (
              <div key={index}>
                {order.status !== "complete" ? (
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
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
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                        {
                          order.status === "process"?(
                            <button
                            type="button"
                            // onClick={closeModal}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-400 text-base font-medium text-white hover:bg-red-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            Cancel
                          </button>
                          )
                          :(
                            null
                          )

                        }
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
                          House {order.house}, Road {order.road}, Sector{" "}
                          {order.sector}, Uttara
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
                        <p className="text-sm font-medium">
                          {order.phoneNumber}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center space-x-3 text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="w-6 h-6"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm font-medium">
                          Order time: {order.date_time}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="px-6 py-4 space-y-3">
                      {order.orders.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {item.name}
                            </h3>
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
                    <div className="px-6 py-4 space-y-3">
                      <p>Net Total: {order.price}৳</p>
                      <hr></hr>
                      <p>Vat - 5.00%: {order.price * 0.05}৳</p>
                      <p>Auto Round: {Math.round(order.price * 0.05)}৳</p>
                      <hr></hr>
                      <p>
                        Gross Total:{" "}
                        {order.price + Math.round(order.price * 0.05)}৳
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
                      {order.status === "process" ? (
                        <button
                          onClick={() =>
                            openModal("accept", orders.length - index - 1)
                          }
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                   py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 
                   transition duration-200 font-medium"
                        >
                          Accept Order
                        </button>
                      ) : order.status === "granted" ? (
                        <button
                          onClick={() =>
                            openModal("complete", orders.length - index - 1)
                          }
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

                      {/* Confirmation Modal */}
                      {isModalOpen && (
                        <div
                          className="fixed inset-0 z-50 overflow-y-auto"
                          aria-labelledby="modal-title"
                          role="dialog"
                          aria-modal="true"
                        >
                          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div
                              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                              aria-hidden="true"
                              onClick={closeModal}
                            ></div>

                            <span
                              className="hidden sm:inline-block sm:align-middle sm:h-screen"
                              aria-hidden="true"
                            >
                              &#8203;
                            </span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                              <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                  onClick={closeModal}
                                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                  <span className="sr-only">Close</span>
                                  <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>

                              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                  <div
                                    className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                                      modalType === "accept"
                                        ? "bg-blue-100"
                                        : "bg-green-100"
                                    }`}
                                  >
                                    {modalType === "accept" ? (
                                      <svg
                                        className="h-6 w-6 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3
                                      className="text-lg leading-6 font-medium text-gray-900"
                                      id="modal-title"
                                    >
                                      {modalType === "accept"
                                        ? "Accept Order"
                                        : "Complete Order"}
                                    </h3>
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-500">
                                        {modalType === "accept"
                                          ? "Are you sure you want to accept this order? This action cannot be undone."
                                          : "Are you sure you want to mark this order as complete? This action cannot be undone."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                  type="button"
                                  onClick={handleConfirm}
                                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${
                                    modalType === "accept"
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : "bg-green-600 hover:bg-green-700"
                                  }`}
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={closeModal}
                                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Home;

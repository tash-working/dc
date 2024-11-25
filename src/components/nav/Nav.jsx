import React from "react";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import io from "socket.io-client";

// const socket = io("https://server-08ld.onrender.com/");
// const socket = io("https://server-08ld.onrender.com/");
const socket = io(`https://server-08ld.onrender.com/`);

function Nav() {
  const [permission, setPermission] = useState(null);

  const showNotification = (data) => {
    if (Notification.permission === "granted") {
      const notification = new Notification("New Order", {
        body: `Order ID: ${data._id}`,
        icon: "logo.png",
        sound: "notification.mp3", // Optional sound file
      });

      notification.onclick = () => {
        // Replace with your desired link
        const desiredUrl = "http://localhost:5174";

        // Open the URL in a new tab (or focus on existing tab)
        window.open(desiredUrl);
      };

      setTimeout(() => {
        notification.close();
      }, 5000); // Dismiss notification after 5 seconds

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification("New Order", {
              body: `Order ID: ${data._id}`,
              icon: "logo.png",
            });
          })
          .catch((error) => {
            console.error("Error registering service worker:", error);
          });
      }
    } else {
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            showNotification(data);
          } else {
            alert("Please allow notifications.");
          }
        })
        .catch((error) => {
          console.error("Error requesting notification permission:", error);
        });
    }
  };

  const showCancelNotification = (data) => {
    if (Notification.permission === "granted") {
      // Create a Notification instance
      const notification = new Notification("Order Cancel Requested", {
        body: `Order ID: ${data.id}`,
        icon: "logo.png", // Optional icon
      });

      // Handle clicks on the notification
      notification.onclick = () => {
        // Replace with your desired link
        const desiredUrl = "http://localhost:5174";

        // Open the URL in a new tab (or focus on existing tab)
        window.open(desiredUrl);
      };
      // For Android devices, consider using a service worker to handle background notifications
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Order Cancel Requested", {
            body: `Order ID: ${data.id}`,
            icon: "logo.png",
          });
        });
      }
    } else {
      alert("Please allow notifications.");
    }
  };

  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      setPermission(permission);
    };

    if (Notification.permission !== "denied") {
      requestPermission();
    }
    // const recivedOrders = JSON.parse(localStorage.getItem(`recivedOrders`)) || [];
    // setOrders(recivedOrders)

    const handleReciveOrder = (data) => {
      showNotification(data);
    };
    const handleReciveReq = (data) => {
      showCancelNotification(data);
    };

    socket.on("recive_order", handleReciveOrder);
    socket.on("requested", handleReciveReq);

    return () => {
      socket.off("recive_order", handleReciveOrder);
      socket.off("requested", handleReciveReq);
    };
  }, [socket]);

  return (
    <div>
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
            {permission === "granted" ? (
              <p>Allowed Notification</p>
            ) : (
              <p>Please Allow notification</p>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Nav;

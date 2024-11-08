import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import io from "socket.io-client";

// const socket = io("server-eight-sepia-51.vercel.app");
// const socket = io("https://server-08ld.onrender.com");
const socket = io(`server-eight-sepia-51.vercel.app`);

function App() {
  const [count, setCount] = useState(0)
  const [orders, setOrders] = useState([]);

  const id = "cash"
  const grantOrder =(index)=>{
    const newOrders = [...orders]
      console.log(newOrders[index]._id);
      const id = newOrders[index]._id
      const selectedOrder = newOrders[index]
      selectedOrder.status = "granted"
      newOrders[index] = selectedOrder
      console.log(newOrders);
      socket.emit("updateToPrepare", {id, status: "granted"});
      
      localStorage.setItem('recivedOrders', JSON.stringify(newOrders));
      setOrders(newOrders)

      

      
      
  }
  const completeOrder =(index)=>{
    const newOrders = [...orders]
      console.log(newOrders[index]._id);
      const id = newOrders[index]._id
      const selectedOrder = newOrders[index]
      selectedOrder.status = "complete"
      newOrders[index] = selectedOrder
      console.log(newOrders);
      socket.emit("updateToPrepare", {id, status: "complete"});
      
      localStorage.setItem('recivedOrders', JSON.stringify(newOrders));
      setOrders(newOrders)

      

      
      
  }
  const getRecivedOrders = async () => {
    try {
      const response = await fetch(`server-eight-sepia-51.vercel.app/getRecivedOrders`)
      const jsonData = await response.json();
      console.log(jsonData);
      setOrders(jsonData)
      localStorage.setItem('recivedOrders', JSON.stringify(jsonData));

      

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
  
      const recivedOrders = JSON.parse(localStorage.getItem(`recivedOrders`)) || [];
      recivedOrders.push(data);
      setOrders(recivedOrders);
      localStorage.setItem('recivedOrders', JSON.stringify(recivedOrders));
    };
  
    socket.on('recive_order', handleReciveOrder);
  
    return () => {
      socket.off('recive_order', handleReciveOrder);
    };
  }, [socket]);


  return (
    <div>
    <h1>Order Cash</h1>
      {
        orders.map((order, index) => (
          <div key={index} className='order-details'>
            <h2>Order No: {order._id}</h2>
            <h3>Order From House{order.house}, Road{order.road}, Sector{order.sector}, Uttara</h3>
            <h3>Phone: {order.phoneNumber}</h3>
            {order.orders.map((order, index) => (
              <div key={index} className="product-card">
                <div className="delete-div">


                  {order.edited ? (
                    <h4>Customized</h4>
                  ) : (
                    <h4>Regular</h4>
                  )}
                </div>
                <div className="product-details">
                  <h3>{order.name}</h3>
                  {order.edited ? (
                    <div>
                      {order.selectedSize ? (
                        <h4>{order.selectedSize}</h4>
                      ) : (
                        <h4>{order.size[0].size}</h4>
                      )}
                      {order.ingredients?.length > 0 ? (
                        order.ingredients.map((ingredient) => (
                          <div key={ingredient.id || ingredient.name}>
                            {ingredient.selected ? (
                              <h6>Added: {ingredient.name}</h6>
                            ) : null}
                          </div>
                        ))
                      ) : null}
                    </div>
                  ) : (
                    <h4>{order.size[0].size}</h4>
                  )}
                  <p>
                    <span className="tk">৳</span>
                    {order.price}
                  </p>
                </div>
                <div className="add-minus-div">

                  <h4 className="quantityDiv">{order.quantity}</h4>

                </div>
              </div>
            ))}
             {order.status === "process" ? (
              <button onClick={() => grantOrder(index)}>Grant Order</button>
            ) : order.status === "granted" ? (
              <button onClick={() => completeOrder(index)}>Complete</button>
            ) : (
              <h4>completed</h4>
            )}
            
          </div>
        ))
      }
    </div>
  )
}

export default App

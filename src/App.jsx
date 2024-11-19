import { useState } from "react";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";

import Home from "./components/home/Home";

// import History from "./components/category/history/History";
import { Toaster } from "react-hot-toast";
import History from "./components/history/History";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
       
        <Route path="/history" element={<History/>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;

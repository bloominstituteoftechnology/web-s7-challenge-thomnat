import React from 'react';
import Home from './Home';
import Form from './Form';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
    <div id="app">
      <BrowserRouter>
      <nav>
        {/* NavLinks here */}
        <Link to="/">Home</Link>
        <Link to="/order">Order</Link>
      </nav>
      {/* Route and Routes here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<Form />} />
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App

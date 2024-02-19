import React from 'react'
import pizza from './images/pizza.jpg'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate();

  const onClick = () => {
    navigate('/order');
}

  return (
    <div>
      <h2>
        Welcome to Bloom Pizza!!!!! OR DONT BE WELCOMED !!!!!
      </h2>
      {/* clicking on the img should navigate to "/order" */}
      <img 
      alt="order-pizza" 
      style={{ cursor: 'pointer' }} 
      src={pizza} 
      onClick={onClick} 
      />
    </div>
  )
}

export default Home;

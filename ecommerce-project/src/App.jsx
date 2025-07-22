import { Routes, Route } from 'react-router'
import { HomePage } from './pages/HomePage'
import './App.css'


function App() {

  return (
    <Routes>
      <Route path="/" element ={<HomePage />} />
      <Route path="checkout" element={<div>Test</div>} />
    </Routes>
  )
}

export default App

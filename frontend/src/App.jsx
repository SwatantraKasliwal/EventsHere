import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Navigation from './Navigation'
function App() {
  return (
    <div>
      <Router>
      <Navigation/>
      </Router>
    </div>
  )
}

export default App;


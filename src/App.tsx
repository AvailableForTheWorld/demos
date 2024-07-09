import './App.css'
import CommitsSearch from './components/commits-search'
import Login from './components/login'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'

// PrivateRoute Component
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const isAuthenticated = localStorage.getItem('gitlabToken') !== null
  return isAuthenticated ? element : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateRoute element={<CommitsSearch />} />} />
      </Routes>
    </Router>
  )
}

export default App

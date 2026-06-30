import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Studio from './pages/Studio'
import Community from './pages/Community'
import CreatorProfile from './pages/CreatorProfile'
import DesignDetail from './pages/DesignDetail'
import Marketplace from './pages/Marketplace'
import Dashboard from './pages/Dashboard'
import AIStudio from './pages/AIStudio'
import Login from './pages/Login'
import Admin from './pages/Admin'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                      element={<Landing />} />
        <Route path="/studio"                element={<Studio />} />
        <Route path="/community"             element={<Community />} />
        <Route path="/creator/:username"     element={<CreatorProfile />} />
        <Route path="/design/:id"            element={<DesignDetail />} />
        <Route path="/marketplace"           element={<Marketplace />} />
        <Route path="/dashboard"             element={<Dashboard />} />
        <Route path="/ai-studio"             element={<AIStudio />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/jyno-control"          element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

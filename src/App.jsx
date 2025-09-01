import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/PreVisa/Login';
import Mainpages from './Pages/PreVisa/Mainpages'
import Dashboard from './Pages/PreVisa/Dashboard'
import JobPage from './Pages/PreVisa/JobPage';
import CountryPage from './Pages/PreVisa/CountryPage';
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />


          <Route path="/dashboard" element={
            <Dashboard>
              <Mainpages />
            </Dashboard>
          } />

          <Route path="/country" element={
            <Dashboard>
              <CountryPage />
            </Dashboard>
          } />

          <Route path="/jobs" element={
            <Dashboard>
              <JobPage />
            </Dashboard>}/>



        </Routes>
      </Router>
    </>
  )
}

export default App

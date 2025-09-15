import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/PreVisa/Login';
import Mainpages from './Pages/PreVisa/Mainpages'
import Dashboard from './Pages/PreVisa/Dashboard'
import JobPage from './Pages/PreVisa/JobPage';
import GiveOptions from './Pages/PreVisa/GiveOptions';
import ReviewFormFull from './Pages/PreVisa/ReviewFomFull';
import VerifyLeads from './Pages/PreVisa/VerifyLeads';
import VerifyLeadsFull from './Pages/PreVisa/VerifyLeadsFull';
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


          <Route path="/jobs" element={
            <Dashboard>
              <JobPage />
            </Dashboard>} />

          <Route path="/give-option" element={
            <Dashboard>
              <GiveOptions />
            </Dashboard>} />

          <Route path="/verify-leads" element={
            <Dashboard>
              <VerifyLeads />
            </Dashboard>} />

          <Route path="give-option/ReviewFormFull" element={
            <Dashboard>
              <ReviewFormFull />
            </Dashboard>
          } />
          <Route path="verify-leads/verify-leads-full" element={
            <Dashboard>
              <VerifyLeadsFull />
            </Dashboard>
          } />


        </Routes>
      </Router>
    </>
  )
}

export default App

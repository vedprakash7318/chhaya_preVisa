import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Mainpages() {
  const navigate=useNavigate()
     useEffect(() => {
      if (!localStorage.getItem('PreVisaManager')) {
        navigate('/')
      }
    })
  return (
    <div>Mainpages</div>
  )
}

export default Mainpages
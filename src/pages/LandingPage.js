import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import './LandingPage.css';

function LandingPage() {
  const [selectedAsset, setSelectedAsset] = useState('home');
  const [userEmail, setUserEmail] = useState('');
  const [carDetails, setCarDetails] = useState({ make: '', mileage: '', year: '' });
  const [carList, setCarList] = useState([]);
  const [saveButtonText, setSaveButtonText] = useState('Save'); // New state for button text
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email || 'User');
        fetchCarDetails();
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleSignOut = () => {
    auth.signOut().then(() => {
      navigate('/login');
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  const handleBackToWebsite = () => {
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCarDetails({ ...carDetails, [name]: value });
  };

  const handleSaveCarDetails = async () => {
    setSaveButtonText('Saving...'); // Set button text to "Saving..."
    try {
      await addDoc(collection(db, 'autos'), {
        ...carDetails,
        userEmail,
      });
      setCarDetails({ make: '', mileage: '', year: '' });
      setSaveButtonText('Saved!'); // Set button text to "Saved!"
      fetchCarDetails();
      
      // Reset the button text back to "Save" after 2 seconds
      setTimeout(() => {
        setSaveButtonText('Save');
      }, 2000);
    } catch (error) {
      console.error('Error saving car details:', error);
      setSaveButtonText('Save'); // Reset button text in case of error
      alert('Failed to save car details.');
    }
  };

  const fetchCarDetails = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'autos'));
      const cars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCarList(cars);
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const renderContent = () => {
    switch (selectedAsset) {
      case 'auto':
        return (
          <div className="auto-asset-form">
            <h2>Enter Car Details</h2>
            <input
              type="text"
              name="make"
              placeholder="Make"
              value={carDetails.make}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="mileage"
              placeholder="Mileage"
              value={carDetails.mileage}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="year"
              placeholder="Year of Build"
              value={carDetails.year}
              onChange={handleInputChange}
            />
            <button onClick={handleSaveCarDetails}>{saveButtonText}</button> {/* Dynamic button text */}

            <h2>Saved Car Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Mileage</th>
                  <th>Year</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {carList.map(car => (
                  <tr key={car.id}>
                    <td>{car.make}</td>
                    <td>{car.mileage}</td>
                    <td>{car.year}</td>
                    <td>{car.userEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      // Other cases remain unchanged
      default:
        return <div>Select an asset type from the sidebar</div>;
    }
  };

  return (
    <div className="landing-page">
      <div className="top-bar">
        <div className="title">Noble Asset Vault</div>
        <div className="user-email">{userEmail}</div>
      </div>
      <div className="sidebar">
        <button onClick={() => setSelectedAsset('home')}>Home</button>
        <div className="dropdown">
          <button className="dropbtn">Assets</button>
          <div className="dropdown-content">
            <button onClick={() => setSelectedAsset('auto')}>Auto</button>
            <button onClick={() => setSelectedAsset('cash')}>Cash</button>
            <button onClick={() => setSelectedAsset('digital')}>Digital</button>
            <button onClick={() => setSelectedAsset('stocks')}>Stocks</button>
            <button onClick={() => setSelectedAsset('metals')}>Metals</button>
          </div>
        </div>
        <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        <button className="back-to-website-btn" onClick={handleBackToWebsite}>Back to Website</button>
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
}

export default LandingPage;




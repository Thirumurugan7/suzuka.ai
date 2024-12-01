import React, { useState } from "react";
import { useOkto } from "okto-sdk-react";
import { useNavigate } from "react-router-dom";
import ReadData from './ReadData';

const WidgetPage = ({ authToken, handleLogout }) => {
  console.log("widget page component rendered: ", authToken);
  const navigate = useNavigate();
  const { showWidgetModal } = useOkto(); 
  const [error, setError] = useState(null);
  
  const open = async () => {
      try {
        await showWidgetModal();
      } catch (error) {
        setError(`Failed to fetch user details: ${error.message}`);
      }
    };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  };
  const buttonStyle = {
    margin: '5px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  };
  // const formStyle = {
  //   display: 'flex',
  //   flexDirection: 'column',
  //   alignItems: 'center',
  //   width: '100%',
  //   maxWidth: '400px',
  // };
  // const inputStyle = {
  //   margin: '5px',
  //   padding: '10px',
  //   width: '100%',
  //   fontSize: '16px',
  // };


  const navHome = async () => {
    try {
      console.log("going to home page");
      navigate("/home");
    } catch (error) {
      setError(`Failed to navigate: ${error.message}`);
    }
  };

    const navRawTxn = async () => {
    try {
      console.log("going to raw txn page");
      navigate("/raw");
    } catch (error) {
      setError(`Failed to navigate: ${error.message}`);
    }
  };

  return (
    <div style={containerStyle}>
      <h1>Okto UI widgets</h1>
      
      {/* Rendering ReadData component and passing handleLogout */}
      <ReadData handleLogout={handleLogout} authToken={authToken}/>
      <div>
        <button style={buttonStyle} onClick={open}>Show Modal</button>
      </div>
      {error && (
        <div style={{ color: 'red' }}>
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}
      <div>
        <br/>
        <br/>
        <button style={buttonStyle} onClick={navHome}>go to home</button>
        <button style={buttonStyle} onClick={navRawTxn}>Try rawtxn</button>
      </div>
    </div>
  );
}
export default WidgetPage;



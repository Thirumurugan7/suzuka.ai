import { useEffect, useState } from 'react';
import { Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { OktoProvider, BuildType } from 'okto-sdk-react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { Experience } from './components/Experience';
import { UI } from './components/UI';
import Home from './components/Home';

// const OKTO_CLIENT_API_KEY = process.env.REACT_APP_OKTO_CLIENT_API_KEY;
const OKTO_CLIENT_API_KEY = "ac9502db-13f0-4074-8ae0-6dc10ad2d0c5";

function App() {
  const [authToken, setAuthToken] = useState(null);

  const handleLogout = () => {
    console.log("setting auth token to null");
    setAuthToken(null); // Clear the authToken
  };

  useEffect(() => {
    // Extract the `userid` from the URL
    const urlParts = window.location.pathname.split('/');
    const userid = urlParts[1];
    console.log(userid, urlParts);
    if (userid) {
      localStorage.setItem('gfuserid', userid);
      console.log('userid stored in localStorage: ', userid);
    } else {
      console.log("User not found..!");
    }
  }, []);

  return (
    <>
      <Router>
        <OktoProvider apiKey={OKTO_CLIENT_API_KEY} buildType={BuildType.SANDBOX}>
          <Routes>
            <Route path="/" element={<Home setAuthToken={setAuthToken} authToken={authToken} handleLogout={handleLogout} />} />
            <Route path="/gf" element={
              <>
                <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
                  {/* This div will make sure the UI and Loader do not overlap */}
                  <Loader />
                  <Leva hidden />
                  <UI />
                </div>
                <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                  <Experience />
                </Canvas>
              </>
            } />
          </Routes>
        </OktoProvider>
      </Router>
    </>
  );
}

export default App;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";
import { MessageSquare, RefreshCw, Settings, Menu } from 'lucide-react';
import Robotlogo from "../Assets/robot 1.png";
import backgroundImage from "../assets/HerpSection.png";
import axios from "axios";

const Home = ({ setAuthToken, authToken, handleLogout }) => {
  const navigate = useNavigate();
  const { authenticate } = useOkto();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGoogleLogin = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    console.log(
        "idtoken", idToken
    );

    const Auth = async() => {
        try {
            const res = await axios.post("http://localhost:3000/deploy-token",{

                "token":idToken
            })

            console.log("res",res);
            
        } catch (error) {
            console.log("errro",error);
            
        }
    }

    Auth()
    
    authenticate(idToken, async (authResponse, error) => {
      if (authResponse) {
        console.log("authResponse",authResponse);
        console.log("authResponse.auth_token",authResponse.auth_token);
        
        setAuthToken(authResponse.auth_token);



        // navigate("/home");
      }
      if (error) {
        console.error("Authentication error:", error);
      }
    });
  };

  const onLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat" 
    style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-12 relative">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg overflow-hidden">
              <img src={Robotlogo} alt="Robot Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl">Suzuka AI</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
            </div>
            
            {/* Login/Logout Button */}
            <div className="hidden md:block">
              {!authToken ? (
                <div className="z-50">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={(error) => {
                      console.log("Login Failed", error);
                    }}
                    useOneTap
                    type="icon"
                    shape="circle"
                  />
                   <button 
        onClick={() => {/* Your wallet connect function */}} 
        className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Connect Wallet
      </button>
                </div>
              ) : (
                <button 
                  onClick={onLogoutClick}
                  className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                >
                  Logout
                </button>
              )}
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="absolute top-full right-0 bg-white shadow-lg rounded-lg md:hidden w-48 mt-2">
              <div className="p-4 flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-blue-600">Features</a>
                <a href="#about" className="text-gray-600 hover:text-blue-600">About</a>
                {!authToken ? (
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={(error) => {
                        console.log("Login Failed", error);
                      }}
                      useOneTap
                    />
                  </div>
                ) : (
                  <button 
                    onClick={onLogoutClick}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-800"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-blue-100 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Build <span className="italic">Swaps</span> and <span className="italic">Bridges</span>
              <br />Seamlessly with
              <br />AI Powered
            </h1>
            <p className="text-gray-600 mb-8">
              Effortlessly bring your crypto ideas to life—launch
              <br className="hidden md:block" />memcoins, NFTs, swaps, and bridges with simple
              <br className="hidden md:block" />AI commands.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-2">Simplifying Crypto for Everyone</h3>
            <p className="text-sm opacity-80">
              Seamlessly create tokens, launch NFTs,
              Create memcoins, NFTs, swaps, and more.
            </p>
            <button className="mt-4 bg-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
              Learn More
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold">AI Crypto Assistant</h3>
            </div>
            <button className="mt-4 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-50">
              Explore Features
            </button>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <span className="font-semibold">Protocol Support</span>
              </div>
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-sm text-gray-600">Speed Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
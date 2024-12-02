import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOkto } from "okto-sdk-react";
import { GoogleLogin } from "@react-oauth/google";
import { MessageSquare, RefreshCw, Settings, Menu } from 'lucide-react';
import Robotlogo from "../assets/robot 1.png";
import backgroundImage from "../assets/HerpSection.png";
import axios from "axios";
import Icon from "../assets/icon.png";
import { Rocket, Zap, Link, Bird, Coins, Gauge } from 'lucide-react';
import Frame from "../assets/Frame.png";
import { UI } from '../components/UI';

const Home = ({ setAuthToken, authToken, handleLogout }) => {
  const navigate = useNavigate();
  const { authenticate } = useOkto();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGoogleLogin = async (credentialResponse) => {
    const idToken = credentialResponse.credential;

    console.log(
        "idtoken", idToken
    );

    const Auth = async(auth) => {
        try {
            const res = await axios.post("https://suzuka-okto-be.vercel.app/deploy-token",{

                "token":idToken , 
                "auth":auth, 
            })

            console.log("res",res);
            
        } catch (error) {
            console.log("errro",error);
            
        }
    }

    
    authenticate(idToken, async (authResponse, error) => {
      console.log('====================================');
      console.log("Authresponse", authResponse);
      console.log('====================================');
      if (authResponse) {
        console.log("authResponse",authResponse);
        console.log("authResponse.auth_token",authResponse.auth_token);
        
        setAuthToken(authResponse.auth_token);

        // Auth(authResponse.auth_token);


        navigate("/gf");
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

  const handleGetStarted = () => {
    if (authToken) {
      navigate("/home"); // Navigate to home if user is authenticated
    } else {
      navigate("/UI"); // Navigate to UI component if user is not authenticated
    }
  };

  return (
    <div className="min-h-screen w-full bg-cover mx-auto my-auto bg-no-repeat" 
    style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-12 relative ">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8  rounded-lg overflow-hidden">
              <img src={Robotlogo} alt="Robot Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-xl text-[#203754]">Suzuka AI</span>
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
                type="standard"
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                width="100%"
                className="!bg-transparent !shadow-none"
              />
                   
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
        <div className="max-w-4xl mx-auto text-center mb-6">
          <div className="">
            <h1 className="text-3xl md:text-5xl text-[#203754] font-bold mb-1">
              Build <span className="italic font-semibold text-4xl">Swaps</span> and <span className="italic font-semibold text-4xl">Bridges</span>
              <br />Seamlessly with
              <br /><h1 className="flex justify-center">
  AI <img className="h-14 mx-2" src={Icon} alt="" /> Powered
</h1>
            </h1>
            <p className="text-[#25456F] ">
              Effortlessly bring your crypto ideas to life—launch
              <br className="hidden md:block" />memcoins, NFTs, swaps, and bridges with simple
              <br className="hidden md:block" />AI commands.
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-6" onClick={handleGetStarted}>
          <button className="bg-blue-600 text-white rounded-xl p-2">Get Started</button>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col  md:flex-row space-x-2 h-[280px] w-full">
          {/* Feature 1 */}
          <div className=" rounded-3xl bg-gradient-to-br from-gray-900 to-blue-900 p-4 text-white">
        <h1 className="text-2xl font-bold pt-4 ">
          Simplifying Crypto for Everyone
        </h1>
        <p className="text-gray-300 py-3">
          One command. Endless possibilities.
          Create memecoins, NFTs, swaps, and more.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          Beta Launch Now Live 🚀
        </button>
      </div>

          {/* Feature 2 */}
         <div >
          <img src={Frame} className="h-[280px] w-[700px]" alt="" />
         </div>


          {/* Feature 3 */}
          <div className="flex justify-between  rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 p-8">
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-start ">
            <div className="p-1 bg-blue-100 rounded-full">
              <Bird className="w-4 h-4 text-blue-500 " /> 
            </div>
            <div>
              <h3 className="font-semibold text-[12px]">AI Crypto Assistant Suggestion</h3>
              <p className="text-[10px] text-gray-600 mt-1">
                Launch a memecoin in seconds, optimized for scalability and security. All with a single AI command.
              </p>
              <button className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">
                Deploy Now
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 mt-1 lg:mt-0 lg:ml-2 w-full ">
    {[
      { icon: Zap, title: 'Instant Launch' },
      { icon: Link, title: 'Multichain Support' },
      { icon: Coins, title: 'Low Gas Costs' },
      { icon: Gauge, title: 'Speed Optimized' },
    ].map((feature, index) => (
      <div
        key={index}
        className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center"
      >
        <div className="p-2 bg-gray-100 rounded-full">
          <feature.icon className="w-3 h-3 text-gray-700" />
        </div>
        <span className="mt-2 text-[10px] font-medium text-gray-800">{feature.title}</span>
      </div>
    ))}
  </div>

      </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
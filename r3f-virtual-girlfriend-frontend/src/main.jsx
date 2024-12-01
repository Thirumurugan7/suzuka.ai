import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import { GoogleOAuthProvider } from '@react-oauth/google';

import "./index.css";
// const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_ID = "382833983704-bns3ev7fcji4iq4tfcjqjlb1arqna9b9.apps.googleusercontent.com"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
       <GoogleOAuthProvider clientId = {GOOGLE_CLIENT_ID}>

    <ChatProvider>
      <App />
    </ChatProvider>
    </GoogleOAuthProvider>

  </React.StrictMode>
);

import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import backgroundImage from "../assets/HerpSection.png";

// Check if SpeechRecognition is available
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  const [isListening, setIsListening] = useState(false);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      chat(text);
      input.current.value = "";
    }
  };

  const startVoiceInput = () => {
    if (isListening) {
      console.log("Already listening...");
      return; // Prevent starting another recognition session while one is active
    }

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Do not continue capturing once speech ends
      recognition.interimResults = false; // Do not capture interim results
      recognition.lang = "en-US"; // Change to your preferred language

      recognition.onstart = () => {
        setIsListening(true);
        console.log("Voice input started...");
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log("Voice input ended...");
      };

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        console.log("Recognized speech:", speechToText);
        document.getElementById('messageInput').value = speechToText;

        setTimeout(() => {
          console.log("This happens after 2 seconds");
        }, 2000); 
        
        // Append to the input box after a 2-second delay
        setTimeout(() => {
          input.current.value = speechToText; // Display the speech in the input box
          sendMessage(); // Send the message after delay
        }, 2000); // 2-second delay
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onabort = () => {
        console.error("Speech recognition aborted.");
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setIsListening(false);
      }
    } else {
      console.error("Speech Recognition API is not supported in this browser.");
      alert("Your browser does not support speech recognition. Please use Chrome or Firefox.");
    }
  };

  // Ensure microphone permissions are granted
  if (navigator.permissions) {
    navigator.permissions.query({ name: "microphone" }).then((result) => {
      if (result.state === "denied") {
        console.error("Microphone access denied");
        alert("Please enable microphone access to use voice input.");
      }
    });
  }

  if (hidden) {
    return null;
  }

  return (
    <div
      className="overflow-hidden min-h-screen w-full bg-cover mx-auto my-auto bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
      <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-bold text-2xl text-purple-800">Suzuka</h1>
          <p>The Crypto Agent</p>
        </div>
       
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-blue-200 hover:bg-blue-400 text-white p-4 transition duration-200 group"
            id="btn"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#333333"
                className="w-6 h-6 transition-colors duration-200 group-hover:stroke-white svg-path"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#333333"
                className="w-6 h-6 transition-colors duration-200 group-hover:stroke-white svg-path"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-purple-200 hover:bg-purple-400 text-white p-4 rounded-xl transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="pointer-events-auto bg-blue-200 hover:bg-blue-400 text-white p-4 transition duration-200 group"
            id="btn"
          >
            <svg
              className="w-6 h-6 transition-colors duration-200 group-hover:stroke-white"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                className="svg-path"
                stroke="#333333"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              >
                <path d="M19.933 13.041a8 8 0 1 1-9.925-8.788c3.899-1 7.935 1.007 9.425 4.747" />
                <path d="M20 4v5h-5" />
              </g>
            </svg>
          </button>
          <style jsx>{`
            #btn:hover .svg-path {
              stroke: white;
            }
          `}</style>
        </div>
        {message && message.text && (
          <div className="self-center bg-gray-100 bg-opacity-75 p-4 rounded-lg mt-40 inline-block w-fit">
            <p className="text-gray-900">{message.text}</p>
          </div>
        )}
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            id="messageInput"
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading || message}
            onClick={sendMessage}
            className={`bg-blue-200 hover:bg-blue-400 text-gray-800 hover:text-white p-4 px-10 font-semibold uppercase rounded-md transition duration-200 ${
              loading || message ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            Send
          </button>
          {/* Voice Input Button */}
          <button
            onClick={startVoiceInput}
            disabled={loading || message}
            className={`bg-green-200 hover:bg-green-400 text-gray-800 hover:text-white p-4 rounded-md transition duration-200 ${
              loading || message ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
};

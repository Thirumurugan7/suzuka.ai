import cors from "cors";
import dotenv from "dotenv";
import gTTS from 'gtts';  // Import gTTS library for Text-to-Speech
import express from "express";
import axios from 'axios';  // Axios to handle local chatbot API calls
import * as THREE from "three"; // For morph target influences and interpolation
import streamBuffers from 'stream-buffers';  // To handle the audio as a stream in memory

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*',  // This allows all origins to access the resources
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // You can specify which HTTP methods are allowed
  allowedHeaders: ['Content-Type', 'Authorization']  // Specify which headers are allowed
}));
const port = 3000;

// Phoneme to Viseme mapping for morph target influences
const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

// Function to generate speech using gTTS and return it as a Base64 string (without writing to a file)
const generateSpeech = async (text) => {
  const gtts = new gTTS(text, 'en');
  return new Promise((resolve, reject) => {
    const writableBuffer = new streamBuffers.WritableStreamBuffer({
      initialSize: 1024,  // Start with 1KB buffer
      incrementAmount: 1024,  // Grow buffer in 1KB increments if needed
    });

    gtts.stream().pipe(writableBuffer);  // Pipe the gTTS stream to buffer

    writableBuffer.on('finish', () => {
      const audioBuffer = writableBuffer.getContents();
      if (audioBuffer) {
        const base64Audio = audioBuffer.toString('base64');
        resolve(base64Audio);
      } else {
        reject(new Error("Failed to convert speech to Base64"));
      }
    });

    writableBuffer.on('error', (err) => {
      reject(err);
    });
  });
};

// Function to generate random lip sync data
const generateRandomLipSync = () => {
  const phonemes = ["A", "B", "C", "D", "E", "F", "G", "H", "X"]; // Random phoneme placeholders
  const lipSyncData = [];
  const numEntries = Math.floor(Math.random() * 10) + 5; // Random number of entries between 5 and 15

  for (let i = 0; i < numEntries; i++) {
    lipSyncData.push({
      start: Math.random() * 3,  // Random start time within 3 seconds
      end: Math.random() * 3 + 1,  // Random end time within 4 seconds
      value: phonemes[Math.floor(Math.random() * phonemes.length)]
    });
  }

  return lipSyncData;
};

// Function to update morph targets based on lip sync data
const updateMorphTargets = (nodes, lipSyncData, currentTime, smoothMorphTarget, morphTargetSmoothing) => {
  Object.values(corresponding).forEach((value) => {
    if (!smoothMorphTarget) {
      nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]] = 0;
      nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]] = 0;
    } else {
      nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[value]], 0, morphTargetSmoothing
      );
      nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[value]], 0, morphTargetSmoothing
      );
    }
  });

  for (let i = 0; i < lipSyncData.length; i++) {
    const mouthCue = lipSyncData[i];
    if (currentTime >= mouthCue.start && currentTime <= mouthCue.end) {
      const viseme = corresponding[mouthCue.value];
      if (!smoothMorphTarget) {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]] = 1;
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]] = 1;
      } else {
        nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Head.morphTargetInfluences[nodes.Wolf3D_Head.morphTargetDictionary[viseme]], 1, morphTargetSmoothing
        );
        nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]] = THREE.MathUtils.lerp(
          nodes.Wolf3D_Teeth.morphTargetInfluences[nodes.Wolf3D_Teeth.morphTargetDictionary[viseme]], 1, morphTargetSmoothing
        );
      }
      break;
    }
  }
};

// POST route to handle chat messages and generate the virtual girlfriend's response
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await generateSpeech("Hey dear... How was your day?"),  // Generate speech in-memory as Base64
          lipsync: generateRandomLipSync(),  // Generating random lip sync data
          facialExpression: "smile",
          animation: "Talking_1", 
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await generateSpeech("I missed you so much... Please don't go for so long!"),  // Generate speech in-memory
          lipsync: generateRandomLipSync(),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }

  try {
    // Call the external chatbot service
    const chatbotResponse = await axios.post('https://virtual-gf-py.vercel.app/chat', { message: userMessage });

    const messages = chatbotResponse.data;

    // Loop through the messages and generate audio data
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      // Generate speech directly into Base64
      message.audio = await generateSpeech(message.text);

      // Attach random lip sync data to each message
      message.lipsync = generateRandomLipSync();
    }

    // Send the response back to the client
    res.send({ messages });

  } catch (error) {
    console.error('Error calling the external chatbot service:', error.message);

    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      res.status(error.response.status).send({ error: error.response.data });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).send({ error: 'No response from chatbot service' });
    } else {
      // Something happened in setting up the request
      res.status(500).send({ error: 'Failed to process the request' });
    }
  }
});

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});

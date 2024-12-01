import { useEffect } from 'react';
import { Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import { Experience } from './components/Experience';
import { UI } from './components/UI';

function App() {
  useEffect(() => {
    // Extract the `userid` from the URL
    const urlParts = window.location.pathname.split('/');
    const userid = urlParts[1];
    console.log(userid, urlParts)
    if (userid) {
      localStorage.setItem('gfuserid', userid);
      console.log('userid stored in localStorage: ', userid);
    }else{
      console.log("User not found..!");
    }
  }, []);

  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
        <Experience />
      </Canvas>
    </>
  );
}

export default App;

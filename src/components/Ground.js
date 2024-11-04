// Ground.js
import { usePlane } from "@react-three/cannon";
import { groundTexture } from "../images/textures";
import { useStore } from '../hooks/useStore';
import * as THREE from 'three';

export const Ground = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, -0.5, 0]
  }));
  const [addCube] = useStore((state) => [state.addCube]);

  // Configure ground texture properties for improved clarity
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping; // Repeat texture to cover ground
  groundTexture.repeat.set(100, 100); // Set texture repeat
  groundTexture.anisotropy = 16; // Enable anisotropic filtering for clarity at angles
  groundTexture.minFilter = THREE.LinearMipMapLinearFilter; // Enable mipmapping for distant texture smoothing

  return (
    <mesh
      onClick={(e) => {
        e.stopPropagation();
        const [x, y, z] = Object.values(e.point).map(val => Math.ceil(val));
        addCube(x, y, z);
      }}
      ref={ref}
      receiveShadow // Enable shadow reception
    >
      <planeBufferGeometry attach="geometry" args={[100, 100]} />
      <meshStandardMaterial 
        attach="material" 
        map={groundTexture} 
        roughness={0.8} 
        metalness={0.1} 
      />
    </mesh>
  );
};

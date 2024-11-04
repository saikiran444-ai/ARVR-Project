import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client"; // Import Socket.IO client
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Ground } from './components/Ground';
import { Player } from './components/Player';
import { FPV } from './components/FPV';
import { Cubes } from './components/Cubes';
import { TextureSelector } from './components/TextureSelector';
import { Menu } from './components/Menu';
import { useStore } from './hooks/useStore';

function App() {
    const loadWorld = useStore(state => state.loadWorld); // Get loadWorld function from the store
    const socket = io("http://localhost:3000"); // Initialize Socket.IO client
    const [players, setPlayers] = useState({}); // State to track players

    useEffect(() => {
        if (loadWorld) {
            loadWorld(); // Load cubes from local storage when the app starts
        } else {
            console.error("loadWorld is undefined");
        }

        // Socket.IO event listeners
        socket.on("connect", () => {
            console.log("Connected to server");
        });

        socket.on("playerMoved", (data) => {
            console.log("Player moved:", data);
            setPlayers(prev => ({ ...prev, [data.playerId]: data.position })); // Update player positions
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            socket.disconnect(); // Cleanup on unmount
        };
    }, [loadWorld, socket]);

    // Function to emit player move
    const handlePlayerMove = (direction) => {
        const playerId = socket.id; // Get the socket ID to identify the player
        const newPosition = calculateNewPosition(direction); // Calculate new position based on direction
        socket.emit("playerMove", { playerId, position: newPosition }); // Emit player move
        setPlayers(prev => ({ ...prev, [playerId]: newPosition })); // Update local state immediately for smooth experience
    };

    // Function to calculate new position based on direction
    const calculateNewPosition = (direction) => {
        const movementSpeed = 1; // Change this value based on your needs
        const currentPosition = players[socket.id] || { x: 0, y: 1, z: 0 }; // Get current position or default

        switch (direction) {
            case "up":
                return { x: currentPosition.x, y: currentPosition.y, z: currentPosition.z - movementSpeed }; // Move up in the z direction
            case "down":
                return { x: currentPosition.x, y: currentPosition.y, z: currentPosition.z + movementSpeed }; // Move down in the z direction
            case "left":
                return { x: currentPosition.x - movementSpeed, y: currentPosition.y, z: currentPosition.z }; // Move left
            case "right":
                return { x: currentPosition.x + movementSpeed, y: currentPosition.y, z: currentPosition.z }; // Move right
            default:
                return currentPosition; // No movement
        }
    };


    // Keydown event handler
    const handleKeyDown = (event) => {
        if (event.key === "ArrowUp") {
            handlePlayerMove("up");
        } else if (event.key === "ArrowDown") {
            handlePlayerMove("down");
        } else if (event.key === "ArrowLeft") {
            handlePlayerMove("left");
        } else if (event.key === "ArrowRight") {
            handlePlayerMove("right");
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <>
            <Canvas shadows>
                <directionalLight
                    position={[50, 50, 50]}
                    intensity={1.5}
                    castShadow
                    shadow-camera-left={-40}
                    shadow-camera-right={40}
                    shadow-camera-top={40}
                    shadow-camera-bottom={-40}
                    shadow-camera-near={0.1}
                    shadow-camera-far={200}
                    shadow-bias={-0.0001}
                    shadow-mapSize={[2048, 2048]}
                />
                <ambientLight intensity={0.2} />
                <FPV />
                <Physics>
                    <Player players={players} /> {/* Pass the players state to Player */}
                    <Cubes />
                    <Ground />
                </Physics>
            </Canvas>
            <div className="absolute centered cursor">+</div>
            <TextureSelector />
            <Menu />
        </>
    );
}

export default App;

import { useFrame, useThree } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useKeyboard } from "../hooks/useKeyboard";
import { io } from "socket.io-client"; // Import Socket.IO client

const JUMP_FORCE = 4;
const SPEED = 4;

// Initialize socket connection (optional: can be in App.js)
const socket = io("http://localhost:3000");

export const Player = ({ players }) => { // Receive players as props
    const { moveBackward, moveForward, moveRight, moveLeft, jump } = useKeyboard();
    const { camera } = useThree();
    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: 'Dynamic',
        position: [0, 1, 0],
    }));

    const vel = useRef([0, 0, 0]);
    useEffect(() => {
        api.velocity.subscribe((v) => vel.current = v);
    }, [api.velocity]);

    const pos = useRef([0, 0, 0]);
    useEffect(() => {
        api.position.subscribe((p) => pos.current = p);
    }, [api.position]);

    // Effect to handle player movement from server
    useEffect(() => {
        const handlePlayerMove = (data) => {
            if (data.playerId !== socket.id) {
                // Move other players based on received data
                api.position.set(data.position[0], data.position[1], data.position[2]);
            }
        };

        socket.on("playerMoved", handlePlayerMove);

        return () => {
            socket.off("playerMoved", handlePlayerMove); // Cleanup listener on unmount
        };
    }, [api]);

    useFrame(() => {
        camera.position.copy(new Vector3(pos.current[0], pos.current[1], pos.current[2]));

        const direction = new Vector3();

        const frontVector = new Vector3(
            0,
            0,
            (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
        );

        const sideVector = new Vector3(
            (moveLeft ? 1 : 0) - (moveRight ? 1 : 0),
            0,
            0,
        );

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyEuler(camera.rotation);

        api.velocity.set(direction.x, vel.current[1], direction.z);

        if (jump && Math.abs(vel.current[1]) < 0.05) {
            api.velocity.set(vel.current[0], JUMP_FORCE, vel.current[2]);
        }

        // Emit the player move event
        socket.emit("playerMove", {
            playerId: socket.id,
            position: pos.current,
        });
    });

    return (
        <mesh ref={ref}></mesh>
    );
};
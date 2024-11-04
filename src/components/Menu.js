import { useEffect } from "react";
import { useStore } from "../hooks/useStore";

export const Menu = () => {
    const [saveWorld, resetWorld] = useStore((state) => [state.saveWorld, state.resetWorld]);

    // Function to handle key presses
    const handleKeyPress = (event) => {
        if (event.key === 'r') { // Check for 'R' key
            resetWorld();
        } else if (event.key === 'Tab') { // Check for 'Tab' key for saving
            event.preventDefault(); // Prevent default behavior of Tab
            saveWorld();
        }
    };

    // Set up a useEffect to listen for keydown events
    useEffect(() => {
        const handleKeyDown = (event) => {
            handleKeyPress(event);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="menu absolute">
            <button
                name="save"
                onClick={saveWorld}
            >
                Save (Tab)
            </button>
            <button
                name="reset"
                onClick={resetWorld}
            >
                Reset (R)
            </button>
        </div>
    );
};

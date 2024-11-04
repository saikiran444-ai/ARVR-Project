const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const players = {}; // Object to hold player positions

// Serve static files from the React app
app.use(express.static("../build")); // Ensure this path is correct

io.on("connection", (socket) => {
    console.log("New player connected:", socket.id);

    // Initialize player position when a new player connects
    players[socket.id] = { position: { x: 0, y: 1, z: 0 } }; // Default starting position

    socket.on("playerMove", (data) => {
        // Update the player's position based on the movement
        players[socket.id].position = data.position;

        // Emit to all clients except the sender
        socket.broadcast.emit("playerMoved", {
            playerId: socket.id,
            position: players[socket.id].position,
        });
    });

    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id]; // Remove player on disconnect
    });
});

// Start the server
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

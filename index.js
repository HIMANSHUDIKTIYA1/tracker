require('dotenv').config();
const express = require("express");
const app = express();
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const path = require("path");
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on("connection", function(socket){
    console.log("Client connected:", socket.id);

    socket.on("send-location", function(data){
        users[socket.id] = { ...data };
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function(){
        console.log("Client disconnected:", socket.id);
        delete users[socket.id];
        io.emit("user-disconnected", socket.id);
    });

    // Send existing users' locations to the newly connected user
    socket.emit("existing-users", users);

    // Handle chat messages
    socket.on("chat-message", (data) => {
        io.emit("chat-message", data);
    });
});

app.get('/', (req, res) => {
  res.render("index");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

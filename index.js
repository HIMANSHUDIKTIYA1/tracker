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

io.on("connection", function(socket){
    console.log("Client connected:", socket.id);

    socket.on("send-location", function(data){
        console.log("Location received from", socket.id, data);
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function(){
        console.log("Client disconnected:", socket.id);
        io.emit("user disconnected", socket.id);
    });
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.render("index");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

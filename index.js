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
    socket.on("send-location", function(data){
        io.emit("receive-location",{id: socket.id, ...data});
    });
    socket.on("disconnect", function(){
        io.emit("user disconnected");
    })
    console.log(" its connected!!");
})

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.render("index");
})
server.listen( process.env.PORT  , () => { console.log(`Server is running .... ${port}`); });

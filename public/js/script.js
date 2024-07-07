
const socket = io();
let person = prompt("Please enter your name");
console.log(person);

document.getElementById("welcomeMessage").innerText = `Welcome, ${person}!`;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log(`Sending location: ${latitude}, ${longitude} for ${person}`);
      socket.emit("send-location", { latitude, longitude, username: person });
    },
    (error) => console.error(error),
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

const map = L.map("map").setView([0, 0], 15);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}', {
  attribution: '© himanshu'
}).addTo(map);

const markers = {};

socket.on("existing-users", (users) => {
  console.log("Existing users:", users);
  Object.keys(users).forEach(id => {
    const { latitude, longitude, username } = users[id];
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<b>${username}</b>`);
    markers[id] = marker;
  });
});

socket.on("receive-location", (data) => {
  console.log("Received location:", data); // Received data log
  const { id, latitude, longitude, username } = data;

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`<b>${username}</b>`);
    markers[id] = marker;
  }
  map.setView([latitude, longitude]);
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

// Chat functionality
function sendMessage() {
  const messageInput = document.getElementById("chatInput");
  const message = messageInput.value;
  if (message.trim() !== "") {
    socket.emit("chat-message", { username: person, message: message });
    messageInput.value = "";
  }
}

socket.on("chat-message", (data) => {
  const { username, message } = data;
  const chatMessages = document.getElementById("chatMessages");
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<b>${username}:</b> ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom
});

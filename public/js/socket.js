// Crea y exporta la conexión Socket.io
const socket = io();

// Escucha evento de conexión
socket.on("connect", () => {
  console.log("Conectado al servidor con socket ID:", socket.id);
});

// Haz disponible `socket` globalmente
window.socket = socket;
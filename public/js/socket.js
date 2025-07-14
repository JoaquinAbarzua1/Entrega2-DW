// socket.js
function iniciarSocket() {
  const socket = io();

  socket.on("connect", () => {
    console.log("✅ Conectado al servidor con socket ID:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Error al conectar el socket:", err.message);
  });

  window.socket = socket; // hacerlo global
}

// Hacer global también iniciarSocket
window.iniciarSocket = iniciarSocket;

// socket.js
function iniciarSocket() {
  const socket = io({ 
      withCredentials: true,
      transports: ["websocket"] // Asegura que se use WebSocket como transporte
    } 
  );

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

/* PARA USAR NGROK

function iniciarSocket() {
  // Usa la URL de ngrok
  const socket = io("https://silly-bear.ngrok-free.app" -> esto hace que mientras tengas ngrok corriendo, el front se conecte al servidor por la URL pública de ngrok.
  ,{
    withCredentials: true -
  });

  socket.on("connect", () => {
    console.log("✅ Conectado al servidor con socket ID:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Error al conectar el socket:", err.message);
  });

  window.socket = socket;
}
window.iniciarSocket = iniciarSocket;

*/
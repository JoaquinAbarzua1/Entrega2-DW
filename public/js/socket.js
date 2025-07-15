// socket.js
function iniciarSocket() {
  const socket = io(window.location.origin, {
    withCredentials: true,
    autoconnect: false, // Conectar automáticamente al cargar la página
    transports: ["websocket"], // Asegurarse de usar WebSocket
});

  socket.on("connect", () => {
    console.log("✅ Conectado al servidor con socket ID:", socket.id);
    console.log("🍪 Cookies del socket:", document.cookie); // Verificar cookies
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Error al conectar el socket:", err.message);
    // Intentar reconectar después de un error
    setTimeout(() => {
      console.log("🔄 Intentando reconectar...");
      socket.connect();
    }, 5000); // Esperar 5 segundos antes de intentar reconectar
  });

  window.socket = socket; // hacerlo global
  return socket; // Retornar el socket para uso posterior
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
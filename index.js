const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io'); 
const sharedSession = require('express-socket.io-session'); 
const mongoStore = require('connect-mongo'); // Para almacenar sesiones en MongoDB

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'usuarios.json');

// Crear middleware de sesión
const sessionMiddleware = session({
  secret: 'mi_secreto',
  resave: false,
  saveUninitialized: false,
  store: mongoStore.create({
    mongoUrl: 'mongodb+srv://joaquinabarzua:'+ process.env.PASS +'@cluster0.avkv65o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    collectionName: 'sessions', // Nombre de la colección para almacenar sesiones
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // Cambiar a true si se usa HTTPS
    sameSite: 'lax', // Configuración de SameSite para cookies
  },
  
});

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine({
  defaultLayout: 'main', partialsDir: path.join(__dirname, 'views', 'partials'), 
  helpers: {
    eq: (a, b) => a === b,
    isWhiteCell: (row, col) => (row + col) % 2 === 0,
    json: (context) => JSON.stringify(context, null, 2) // Helper para serializar objetos a JSON
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


// MIDDLEWARES
app.use(cookieParser());
app.use(sessionMiddleware); // Añadir middleware de sesión a Socket.io
app.use(bodyParser.urlencoded({ extended: true })); //Activa body-parser para leer formularios
app.use(bodyParser.json()); // Activa body-parser para leer JSON
app.use(express.static(path.join(__dirname, 'public')));

/*
app.use(session({
  secret: 'mi_secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24,} // Cambiar a true si se usa HTTPS
})); 
*/

// -----------------------------------------------
// 🔌 Servidor HTTP + Socket.io
// -----------------------------------------------

const server = http.createServer(app); // Crear el servidor con http
const io = new Server(server); // Inicializar socket.io

// Conectar sesiones a sockets
  io.use(sharedSession(sessionMiddleware, {
    autoSave: true // Guarda la sesión automáticamente
  }));

// Middleware para verificar autenticación en cada conexión de socket
io.use((socket, next) => {
  console.log('🍪 Cookies recibidas:', socket.request.headers.cookie);
  console.log('📦 Session en socket:', socket.request.session);
  if (socket.request.session && socket.request.session.userId) {
    return next();
  }
  next(new Error('No autenticado'));
});

// Eventos de conexión de socket.io
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('unirse-partida', async (partidaId) => {
    socket.join(partidaId);
    console.log(`Cliente ${socket.id} unido a partida ${partidaId}`);
    
    const partida = await Partida.findById(partidaId);
    if (partida) {
      socket.emit('estado-inicial', {
        tablero: partida.tablero,
        turno: partida.turno
      });
    }
  });
  socket.on('mover-pieza', async (data) => {
    try {
      const partida = await Partida.findByIdAndUpdate(data.partidaId, {
        $set: {
          tablero: data.tablero,
          turno: data.turno
        }
      }, 
      { new: true });
      if (!partida) return;
      /* para actualizar el tablero y turno en la base de datos
      partida.tablero = data.tablero;
      partida.turno = data.turno;
      await partida.save();
      */

      io.to(data.partidaId).emit('actualizar-tablero', {
        tablero: partida.tablero,
        turno: partida.turno,
        ultimoMovimiento: data.Movimiento
      });
    } catch (error) {
      console.error('Error al mover pieza:', error);
      socket.emit('error-movimiento', {error: 'Error al mover la pieza. Inténtalo de nuevo.'});
    }
  });


  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    // se puede añadir lógica para manejar la desconexión o abandonos de partida, como guardar el estado de la partida.
  });

    // Manejo de errores en el socket
  socket.on('error', (error) => {
    console.error('Error en el socket:', error);
  });
});
io.on('connection_error', (err) => {
  console.error('Socket connection error:', err.message);
});


//-----------------------Mongoose-----------------------------------------------------------------------------------------------------
mongoose.connect('mongodb+srv://joaquinabarzua:'+process.env.PASS+'@cluster0.avkv65o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB Atlas')
})
.catch(err => {
  console.error('Error conectando a MongoDB', err)
});

//Base de datos
const UsuarioSchema = new mongoose.Schema({
  username: String,
  email: String,
  nombre: String,
  apellido: String,
  birthdate: String,
  password: String
});
const PartidaSchema = new mongoose.Schema({
  jugador1: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true }, 
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}, // luego, cambiar a required: true si se implementa el segundo jugador
  fechaInicio: {type: Date, default: Date.now },
  resultado: {
    type: String,
    enum: ['jugador1', 'jugador2', 'empate', 'en_curso'],
    default: 'en_curso'
  },
  movimientos: [{type: String}], // Array de movimientos en formato FEN o notación algebraica
  tablero: { type: Array, default: [] },
   turno: { type: String, enum: ['blancas', 'negras'], default: 'blancas' } // turno actual
});

// Modelos
const Usuario = mongoose.model('Usuario', UsuarioSchema);
const Partida = mongoose.model('Partida', PartidaSchema);


//-------------------------Rutas de Express-------------------------------------------------------------------------------------------

//Ruta GET para mostrar formulario de registro
app.get('/registro', (req, res) => {
  res.render('registro')
});

//post que usa mongoose
app.post('/registro', async (req, res) => { // cambiar nombre a 'register' si hay problemas
  const { username, email, nombre, apellido, birthdate, password } = req.body
  const hash = await bcrypt.hash(password,10);
  const nuevoUsuario = new Usuario({ username, email, nombre, apellido, birthdate, password: hash })
  await nuevoUsuario.save()
  //res.send('Usuario registrado con éxito')
  res.redirect('/login')
});

//Ruta GET para mostrar formulario de login
app.get('/login', (req, res) => {
  res.render('login')
});


// Ruta POST para manejar el login
app.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const usuario = await Usuario.findOne({ email: username })
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
    }
    req.session.userId = usuario._id;
req.session.save((err) => {
  if (err) {
    console.error('❌ Error guardando la sesión:', err);
    return res.send('Error interno. Intenta de nuevo.');
  }
  res.redirect('/principal');
});
console.log('🔐 Sesión después del login:', req.session);


  } catch (err) {
    console.error('Error al buscar usuario:', err)
    res.send('Error interno del servidor')
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.get('/principal',  (req, res) => {
  res.redirect('/');
});
app.get('/',  (req, res) => {
  res.render('principal', {  });
});

//Ruta GET para mostrar formulario de registro
app.get('/partida', async (req, res) => {
  if(!req.session.userId) {
    console.log("No autenticado, redirigiendo a login");
    return res.redirect('/login');}
    // Buscar la ultima partida en curso del usuario
    const partida = await Partida.findOne({ jugador1: req.session.userId, resultado: 'en_curso' });
  if (!partida) {
    return res.redirect('/'); // Redirigir a la página principal si no hay partida en curso
  }
  res.redirect('/partida/' + partida._id);
});

app.get('/perfil', (req, res) =>
  res.render('perfil')
);
//agregar resto de rutas

//Ruta GET para mostrar desarrolladores
app.get('/desarrolladores', (req, res) => {
  res.render('desarrolladores')
});

//Ruta GET para mostrar formulario de registro
app.get('/historia', (req, res) => {
  res.render('historia')
});

app.get('/partida/:id', async (req, res) => {
  if(!req.session.userId) {
    console.log("No autenticado, redirigiendo a login");
    return res.redirect('/login');}
  const partidaId = req.params.id;
  const partida = await Partida.findById(partidaId);
  if(!partida) {return res.status(404).send('Partida no encontrada');}

  res.render('partida' ,{
    tablero: partida.tablero,
    turno: partida.turno,
    partidaId: partida._id,
    usuario: req.session.usuario
  }); 
});


// RUTA PARA NUEVA PARTIDA 
app.post('/nueva-partida', async (req, res) => {
  console.log("Intentando crear partida, session.userId:", req.session.userId);
  if (!req.session.userId) {
    /*
    console.log("No autenticado, asignando temporal userId");
    req.session.userId = "687226b98144725e0984dcf6"; // usa aquí un id real de tu colección Usuario
    */
   return res.status(401).send('No autenticado');
  }
  const nuevaPartida = new Partida({
    jugador1: req.session.userId,
    tablero: crearTablero()
  });
  await nuevaPartida.save();
  res.json({ success: true, partidaId: nuevaPartida._id });
});
//RUTA PARA RENDIRSE
app.post('/rendirse', (req,res)=>{
  //Logica para registrar rendirse
  //En un juego real, esto actualizaria la base de datos, ojo con esto mas a futuro
  res.json({
    result: 'Derrota por rendicion' , success: true
  });
});
//RUTA PARA EMPATAR
app.post('/empatar', (req,res) =>{
// Cuando se juegue con otro jugador se tendra que implementar algo que le notifique que su oponente quiere tablas xd
res.json({
  status: 'Empate ofrecido. Espera la respuesta de tu oponente..' , success: true
});
});

//-------------Funciones------------------------------------------------------------------------------------------------------------

//hacer funcion para verificar conexion (que esté logeado), por ahora cada vez que abra la pagina, mandará a principal

function estaLogeado() {
  let logged = false;
//true res.render()
//false res.redirect('login)
}
const letras = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const tablero = [];

for (let y = 7; y >= 0; y--) {
  const fila = [];
  for (let x = 0; x < 8; x++) {
    fila.push(letras[x] + (y + 1));
  }
  tablero.push(fila);
}

function crearTablero() {
    const tablero = Array.from({ length: 8 }, () => Array(8).fill(null));
  
    const piezas = ['torre', 'caballo', 'alfil', 'reina', 'rey', 'alfil', 'caballo', 'torre'];
  
    // Blancas
    for (let x = 0; x < 8; x++) {
      tablero[7][x] = { tipo: piezas[x], color: 'blanca' };
      tablero[6][x] = { tipo: 'peon', color: 'blanca' };
    }
  
    // Negras
    for (let x = 0; x < 8; x++) {
      tablero[0][x] = { tipo: piezas[x], color: 'negra' };
      tablero[1][x] = { tipo: 'peon', color: 'negra' };
    }
  
    return tablero;
}

server.listen(PORT, () => {
  console.log(`Servidor con WebSockets escuchando en http://localhost:${PORT}`);
});

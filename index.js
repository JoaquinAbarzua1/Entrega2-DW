const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express()
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'usuarios.json');

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

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: 'mi_secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false} // Cambiar a true si se usa HTTPS
})); 


app.use(bodyParser.urlencoded({ extended: true })); //Activa body-parser para leer formularios
app.use(bodyParser.json()); // Activa body-parser para leer JSON

//-----------------------Mongoose-----------------------------------------------------------------------------------------------------

//Base de datos

const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  username: String,
  email: String,
  nombre: String,
  apellido: String,
  birthdate: String,
  password: String
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

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

//Modelo de Partidas

const PartidaSchema = new mongoose.Schema({
  jugador1: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true }, 
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}, // luego, cambiar a required: true si se implementa el segundo jugador
  fechaInicio: {type: Date, default: Date.now },
  resultado: {
    type: String,
    enum: ['jugador1', 'jugador2', 'empate', 'en_curso'],
    default: 'en_curso'
  },
  tablero: { type: Array, default: [] },
   turno: { type: String, enum: ['blancas', 'negras'], default: 'blancas' } // turno actual
});

const Partida = mongoose.model('Partida', PartidaSchema);

//-------------------------Rutas-------------------------------------------------------------------------------------------

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

//Ruta POST para autenticar usuario
/*
app.post('/login', (req, res) => {
  res.send('El login debe manejarse en el cliente usando localStorage.');
});
*/

//post que usa mongoose
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const usuario = await Usuario.findOne({ email: username })
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
    }
    req.session.userId = usuario._id // Guarda el ID del usuario en la sesión
    console.log('Usuario logueado:', usuario._id); // se muestran en la consola del servidor
console.log('req.session.userId:', req.session.userId);
    res.redirect('/principal')
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


//Ruta raíz
//app.get('/', estaLoggeado ,(req, res) => { //hacer funcion estaLogeado
app.get('/principal',  (req, res) => {
  res.redirect('/');
});
app.get('/',  (req, res) => {
  res.render('principal', {  });
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

app.get('/partida/:id', async (req, res) => {
  const partida = await Partida.findById(req.params.id);
  if(!partida) return res.status(404).send('Partida no encontrada');
  res.render('partida' ,{
    tablero: partida.tablero,
    turno: "blancas",
    partidaId: partida._id
  }); 
});


// RUTA PARA NUEVA PARTIDA 
app.post('/nueva-partida', async (req, res) => {
  console.log("Intentando crear partida, session.userId:", req.session.userId);
  if (!req.session.userId) {
    console.log("No autenticado, asignando temporal userId");
    req.session.userId = "687226b98144725e0984dcf6"; // usa aquí un id real de tu colección Usuario
  }
  const nuevaPartida = new Partida({
    jugador1: req.session.userId,
    tablero: crearTablero()
  });
  await nuevaPartida.save();
  res.json({ success: true, partidaId: nuevaPartida._id });
});

app.get('/api/partidas/:id/tablero', async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ success: false, error: 'Partida no encontrada' });

    res.json({
      success: true,
      tablero: partida.tablero,
      turno: partida.turno
    });
  } catch (err) {
    console.error('Error al obtener tablero:', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
});


app.post('/api/partidas/:id/tablero', async (req, res) => {
  try {
    const partida = await Partida.findById(req.params.id);
    if (!partida) return res.status(404).json({ success: false, error: 'Partida no encontrada' });

    // req.body debe traer { tablero, turno }
    const { tablero, turno } = req.body;
    if (!tablero || !turno) {
      return res.status(400).json({ success: false, error: 'Faltan datos' });
    }

    partida.tablero = tablero;
    partida.turno = turno;

    await partida.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar tablero:', err);
    res.status(500).json({ success: false, error: 'Error interno' });
  }
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

//---------------------------------------------------------------------------------------------------------------------------------------
//Iniciar el servidor

app.listen(PORT, () => {
  console.log(`App escuchando en http://localhost:${PORT}`)
});

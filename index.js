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
    isWhiteCell: (row, col) => (row + col) % 2 === 0
  }

}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'mi_secreto',
  resave: false,
  saveUninitialized: false,
  cookie: {secure: false} // Cambiar a true si se usa HTTPS
})); 


app.use(bodyParser.urlencoded({ extended: true })); //Activa body-parser para leer formularios

app.use(cookieParser());


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
  jugador2: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaInicio: {type: Date, default: Date.now },
  resultado: {
    type: String,
    enum: ['jugador1', 'jugador2', 'empate', 'en_curso'],
    default: 'en_curso'
  }
});

const Partida = mongoose.model('Partida', PartidaSchema);

//-------------------------Rutas-------------------------------------------------------------------------------------------




//Ruta GET para mostrar formulario de registro
app.get('/registro', (req, res) => {
  res.render('registro')
});

//Ruta POST para registrar un nuevo usuario Local Storage
/*
app.post('/registro', (req, res) => {
  const { username, password } = req.body;
  const existe = usuarios.find(u => u.username === username);

  if (existe) {
    return res.send('Usuario ya existe. <a href="/registro">Volver</a>');
  }

  usuarios.push({ username, password });
  fs.writeFileSync(DB_FILE, JSON.stringify(usuarios)); // Guarda en archivo
  res.redirect('/login');
});
*/

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
    const usuario = await Usuario.findOne({ username })
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
    }
    req.session.userId = usuario._id // Guarda el ID del usuario en la sesión
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
  res.redirect('/', { 
     
  });
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
app.get('/partida',  (req, res) => {
  const tablero = crearTablero();
  res.render('partida', { 
    tablero,
     // Pasa el nombre de usuario
  });
});


// RUTA PARA NUEVA PARTIDA 
app.post('/nueva-partida', (req,res) =>{
  //Aqui iria la logica para reiniciar el estado del juego
  //Por ahora simplemente se redigira a la misma pagina de esta forma
  res.redirect('/partida'); // despues se tendra que hacer otras cosas pero por ahora se queda asi.
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

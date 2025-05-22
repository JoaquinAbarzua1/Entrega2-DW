const express = require('express') 
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()
const port = 80
const path = require('path');


app.engine('handlebars', engine({
  defaultLayout: 'main', partialsDir: path.join(__dirname, 'views', 'partials'), 
  helpers: {
    eq: (a, b) => a === b,
    isWhiteCell: (row, col) => (row + col) % 2 === 0
  }
}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.set('views', './views')


//Activa body-parser para leer formularios
app.use(bodyParser.urlencoded({ extended: true }))



//----------------------------------------------------------------------------------------------------------------------------

//Base de datos

/* QUEDA COMENTADO PORQUE SE SUPONE QUE AÚN NO HAY QUE USAR BASE DE DATOS
const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
})

const Usuario = mongoose.model('Usuario', UsuarioSchema)

mongoose.connect('mongodb+srv://joaquinabarzua:<contraseña>@cluster0.avkv65o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB Atlas')
})
.catch(err => {
  console.error('Error conectando a MongoDB', err)
})

*/

//-----------------------------------------------------------------------------------------------------------------------------------------



//-------------------------------------------------------------------------------------------------------------------------------------------

//Crea base de datos temporal
const usuarios = []


//-------------------------Rutas-------------------------------------------------------------------------------------------
// Ruta principal que renderiza index.handlebars
//comentado para evitar confusiones
/*app.get('/', (req, res) => {
  res.render('index', {
    titulo: 'Hello World!',
    mensaje: 'Bienvenido a mi app usando Handlebars y no sé usar Git'
  })
})*/

// Ruta adicional sin plantilla
app.get('/despedirse', (req, res) => {
  res.send('Bye cruel World!')
})

//Ruta GET para mostrar formulario de registro
app.get('/registro', (req, res) => {
  res.render('registro')
})

//Ruta POST para registrar un nuevo usuario

app.post('/registrarse', (req, res) => {
  const { username, password } = req.body
  const existe = usuarios.find(u => u.username === username)

  if (existe) {return res.send('Usuario ya existe. <a href="/registro">Volver</a>')}

  usuarios.push({ username, password })
  res.redirect('/login')
})


//post que usa mongoose
/*
app.post('/register', async (req, res) => {
  const { username, password } = req.body
  const nuevoUsuario = new Usuario({ username, password })
  await nuevoUsuario.save()
  res.send('Usuario registrado con éxito')
})
*/

//Ruta GET para mostrar formulario de login
app.get('/login', (req, res) => {
  res.render('login')
})

//Ruta POST para autenticar usuario

app.post('/login', (req, res) => {
  const { username, password } = req.body
  const usuario = usuarios.find(u => u.username === username && u.password === password)

  if (!usuario) {return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')}
  res.render('welcome', { username })
})


//post que usa mongoose
/*
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const usuario = await Usuario.findOne({ username, password })

    if (!usuario) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
    }

    res.render('Profewelcome', { username })
  } catch (err) {
    console.error('Error al buscar usuario:', err)
    res.send('Error interno del servidor')
  }
})
*/

//Ruta raíz
//app.get('/', estaLoggeado ,(req, res) => { //hacer funcion estaLogeado
app.get('/', (req, res) =>
  res.render('principal')
)
app.get('/principal', (req, res) =>
  res.render('principal')
)

app.get('/perfil', (req, res) =>
  res.render('perfil')
)
//agregar resto de rutas

//Ruta GET para mostrar desarrolladores
app.get('/desarrolladores', (req, res) => {
  res.render('desarrolladores')
})

//Ruta GET para mostrar formulario de registro
app.get('/historia', (req, res) => {
  res.render('historia')
});

//Ruta GET para mostrar formulario de registro
app.get('/partida', (req, res) => {
  const tablero = crearTablero();
  res.render('partida', { tablero });
})


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
//true res.render()
//false res.redirect('login)

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
// funciones de movimientos
function movimientosCaballo(x, y) {
    const movimientos = [
      [2, 1], [1, 2],
      [-1, 2], [-2, 1],
      [-2, -1], [-1, -2],
      [1, -2], [2, -1]
    ];
  
    const movimientosValidos = [];
  
    for (const [dx, dy] of movimientos) {
      const nx = x + dx;
      const ny = y + dy;
  
      // Verificar si está dentro del tablero
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        movimientosValidos.push([nx, ny]);
      }
    }
  
    return movimientosValidos;
}

function movimientosAlfil(x, y) {
    const movimientos = [];
  
    for (let i = 1; i < 8; i++) {
      if (x + i < 8 && y + i < 8) movimientos.push([x + i, y + i]);
      if (x - i >= 0 && y + i < 8) movimientos.push([x - i, y + i]);
      if (x + i < 8 && y - i >= 0) movimientos.push([x + i, y - i]);
      if (x - i >= 0 && y - i >= 0) movimientos.push([x - i, y - i]);
    }
  
    return movimientos;
}

function movimientosTorre(x, y) {
    const movimientos = [];
  
    for (let i = 0; i < 8; i++) {
      if (i !== x) movimientos.push([i, y]); // Horizontal
      if (i !== y) movimientos.push([x, i]); // Vertical
    }
  
    return movimientos;
  }
  

function movimientosReina(x, y) {
    return [...movimientosTorre(x, y), ...movimientosAlfil(x, y)];
}

function movimientosRey(x, y) {
    const movimientos = [];
  
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < 8 && ny < 8) {
          movimientos.push([nx, ny]);
        }
      }
    }
  
    return movimientos;
}

function movimientosPeon(x, y, color = 'blanca') {
    const dir = color === 'blanca' ? -1 : 1;
    const inicioFila = color === 'blanca' ? 6 : 1;
    const movimientos = [];
  
    const ny = y + dir;
    if (ny >= 0 && ny < 8) {
      movimientos.push([x, ny]); // Movimiento normal
      if (y === inicioFila && ny + dir >= 0 && ny + dir < 8) {
        movimientos.push([x, ny + dir]); // Doble avance
      }
    }
  
    // Capturas diagonales (no consideramos piezas enemigas por ahora)
    if (x > 0 && ny >= 0 && ny < 8) movimientos.push([x - 1, ny]);
    if (x < 7 && ny >= 0 && ny < 8) movimientos.push([x + 1, ny]);
  
    return movimientos;
}

//---------------------------------------------------------------------------------------------------------------------------------------
//Iniciar el servidor

app.listen(port, () => {
  console.log(`App escuchando en http://localhost:${port}`)
})

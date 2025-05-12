const express = require('express') 
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()
const port = 80

/////////////////////////////////////////////////////////////////////////////////////////////ALGO NO FUNCIONA DE MONGOOSE, lo dejaré comentado
//Base de datos
/*

const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema({
  username: String,
  password: String
})

const Usuario = mongoose.model('Usuario', UsuarioSchema)

mongoose.connect('mongodb+srv://joaquinabarzua:admin@cluster0.avkv65o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conexión exitosa a MongoDB Atlas')
})
.catch(err => {
  console.error('Error conectando a MongoDB', err)
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body
  const nuevoUsuario = new Usuario({ username, password })
  await nuevoUsuario.save()
  res.send('Usuario registrado con éxito')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const usuario = await Usuario.findOne({ username, password })

    if (!usuario) {
      return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
    }

    res.render('welcome', { username })
  } catch (err) {
    console.error('Error al buscar usuario:', err)
    res.send('Error interno del servidor')
  }
})

////////////////////////////////////////////////////////////////////

*/

// Configurar Handlebars con layout por defecto
app.engine('handlebars', engine({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
app.set('views', './views')

//Activa body-parser para leer formularios
app.use(bodyParser.urlencoded({ extended: true }))

//Crea base de datos temporal
const usuarios = []

// Ruta principal que renderiza index.handlebars
//comentado
/*app.get('/', (req, res) => {
  res.render('index', {
    titulo: 'Hello World!',
    mensaje: 'Bienvenido a mi app usando Handlebars y no sé usar Git'
  })
})*/

// Ruta adicional sin plantilla
app.get('/despedirse', (req, res) => {
  res.send('Bye World!')
})

//Ruta GET para mostrar formulario de registro
app.get('/register', (req, res) => {
  res.render('register')
})

//Ruta POST para registrar un nuevo usuario
app.post('/register', (req, res) => {
  const { username, password } = req.body
  const existe = usuarios.find(u => u.username === username)

  if (existe) {return res.send('Usuario ya existe. <a href="/register">Volver</a>')}

  usuarios.push({ username, password })
  res.redirect('/login')
})

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

//Ruta raíz
app.get('/', (req, res) => {
  res.redirect('/login')
})


//Iniciar el servidor
app.listen(port, () => {
  console.log(`App escuchando en http://localhost:${port}`)
})

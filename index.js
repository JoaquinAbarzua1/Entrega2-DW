const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')

const app = express()
const port = 80

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

//Activa body-parser para leer formularios
app.use(bodyParser.urlencoded({ extended: true }))

//Crea base de datos temporal
const usuarios = []

// Ruta principal que renderiza index.handlebars
app.get('/', (req, res) => {
  res.render('index', {
    layout: false,
    titulo: 'Hello World!',
    mensaje: 'Bienvenido a mi app usando Handlebars 😎'
  })
})

// Ruta adicional sin plantilla
app.get('/despedirse', (req, res) => {
  res.send('Bye World!')
})

//Ruta GET para mostrar formulario de registro
app.get('/register', (req, res) => {
  res.render('register', {layout: false})
})

//Ruta POST para registrar un nuevo usuario
app.post('/register', (req, res) => {
  const { username, password } = req.body
  const existe = usuarios.find(u => u.username === username)

  if (existe) {
    return res.send('Usuario ya existe. <a href="/register">Volver</a>')
  }

  usuarios.push({ username, password })
  res.redirect('/login')
})

//Ruta GET para mostrar formulario de login
app.get('/login', (req, res) => {
  res.render('login', {layout:false})
})

//Ruta POST para autenticar usuario
app.post('/login', (req, res) => {
  const { username, password } = req.body
  const usuario = usuarios.find(u => u.username === username && u.password === password)

  if (!usuario) {
    return res.send('Credenciales inválidas. <a href="/login">Intentar de nuevo</a>')
  }

  res.render('welcome', { username }, {layout:false})
})

//Ruta raíz redirige a login
app.get('/', (req, res) => {
  res.redirect('/login')
})


//Iniciar el servidor
app.listen(port, () => {
  console.log(`App escuchando en http://localhost:${port}`)
})

//Variables adicionales
let registroMovimientos=[];
let numeroMovimiento =1;
let piezaArrastrada = null;
let posInicial = null;

// Variables de estado
let turnoActual = turnoInicial;
const jugadores = {
    blancas: "Jugador 1",
    negras: "Jugador 2"
};

// Tablero inicial
let tableroActual = tableroInicial;

//-------RENDIRIZAR TABLERO-----------

function renderizarTablero(tablero) {
  const letras = ["a","b","c","d","e","f","g","h"];
  const contenedor = document.querySelector(".tablero.piezas");
  contenedor.innerHTML = ""; // Limpia todo

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const celda = document.createElement("div");
      const pos = letras[x] + (8 - y);
      celda.className = pos + " "  + ((x + y) % 2 === 0 ? "blanco" : "negro");

      const pieza = tablero[y][x];
      if (pieza) {
        const span = document.createElement("span");
        span.className = "pieza " + pieza.color;
        span.setAttribute("draggable", "true");
        span.setAttribute("data-info", JSON.stringify(pieza));
        span.textContent = obtenerSimboloPieza(pieza.tipo, pieza.color);
        celda.appendChild(span);
      }
      contenedor.appendChild(celda);
    }
  }
}

// --------------------------HELPERS--------------------------------

function obtenerSimboloPieza(tipo, color) {
  const simbolos = {
    torre: { blanca: "♖", negra: "♜" },
    caballo: { blanca: "♘", negra: "♞" },
    alfil: { blanca: "♗", negra: "♝" },
    reina: { blanca: "♕", negra: "♛" },
    rey: { blanca: "♔", negra: "♚" },
    peon: { blanca: "♙", negra: "♟︎" }
  };
  return simbolos[tipo][color];
}

function posicionACoordenadas(pos) {
    const x = pos.charCodeAt(0) - "a".charCodeAt(0); 
    const y = 8 - parseInt(pos[1]); 
    return [x, y];
}

function actualizarListaMovimientos(){
    const lista = document.getElementById("lista-movimientos");
        lista.innerHTML = registroMovimientos.map(mov => `<div class=movimiento>${mov}</div>`).join("");
}

//----------------TURNOS Y PERSISTENCIA-----------------

function CambiarTurno(pieza, desde, hacia) {
    turnoActual = turnoActual === "blancas" ? "negras" : "blancas";
    // registrar el movimiento

    const notacion = `${numeroMovimiento}. ${desde} → ${hacia}`;
    registroMovimientos.push(notacion);
    actualizarListaMovimientos();

    // Solo incrementa el numero despues del turno de negras
    if(turnoActual==="blancas") {numeroMovimiento++;}

    document.getElementById("jugador-actual").textContent = jugadores[turnoActual];
    console.log(`Ahora es el turno de: ${turnoActual}`);
    guardarTableroEnServidor(obtenerEstadoTablero());
}

async function guardarTableroEnServidor(tablero) {
  const partidaId = window.partidaId;
  if (!partidaId) {
    console.error("No hay partidaId, no se guarda el tablero.");
    return;
  }

  await fetch(`/api/partidas/${partidaId}/tablero`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tablero })
  });
}


function obtenerEstadoTablero() {
    const matriz = Array.from({ length: 8 }, () => Array(8).fill(null));
    document.querySelectorAll(".tablero > div").forEach(celda => {
        const clase = celda.className.match(/([a-h][1-8])/);
        if (!clase) return;
        const pos = clase[0];
        const x = pos.charCodeAt(0) - "a".charCodeAt(0); // a=0, b=1, ..., h=7
        const y = 8 - parseInt(pos[1]); // 8=0, 7=1, ..., 1=7
        const pieza = celda.querySelector(".pieza");
        if (pieza) {
            const info = JSON.parse(pieza.getAttribute("data-info"));
            matriz[y][x] = { tipo: info.tipo, color: info.color };
        }
    });
    return matriz;
}
//------------------EVENTOS DE DRAG & DROP---------------------

function configurarEventosPiezas() {
    document.querySelectorAll(".pieza").forEach(pieza => {
        pieza.addEventListener("dragstart", (e) => {
            const colorPieza = pieza.classList.contains("negra") ? "negra" : "blanca";

            if ((colorPieza === "negra" && turnoActual !== "negras") || 
                (colorPieza === "blanca" && turnoActual !== "blancas")) {
                e.preventDefault();
                alert("¡No es tu turno!");
                return;
            }

            piezaArrastrada = pieza;
            posInicial = pieza.parentElement.className.match(/([a-h][1-8])/)[0];
            setTimeout(() => pieza.style.display = "none", 0);
            e.dataTransfer.setDragImage(pieza, 0, 0); // Usa la pieza como imagen de arrastre
    pieza.classList.add("arrastrando"); // Agrega una clase durante el arrastre
        });

        pieza.addEventListener("dragend", () => {
            pieza.style.display = "";
            pieza.classList.remove("arrastrando"); // Remueve la clase al terminar
        });
    });
}

function configurarEventosCasillas() {
  document.querySelectorAll(".tablero > div").forEach(casilla => {
    casilla.addEventListener("dragover", (e) => {
      e.preventDefault(); // Necesario para permitir drop
    });

    casilla.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!piezaArrastrada) return;

      const posDestino = casilla.className.match(/([a-h][1-8])/)[0];
      const [xInicial, yInicial] = posicionACoordenadas(posInicial);
      const [xDestino, yDestino] = posicionACoordenadas(posDestino);

      // Obtener tipo y color de la pieza
      const tipoPieza = JSON.parse(piezaArrastrada.getAttribute("data-info")).tipo;
      const colorPieza = piezaArrastrada.classList.contains("negra") ? "negra" : "blanca";

        // Verificar si la casilla destino ya tiene una pieza
        const piezaEnDestino = tableroActual[yDestino][xDestino];
        if(piezaEnDestino && piezaEnDestino.color === colorPieza) {
            alert("No puedes mover a una casilla ocupada por tu propia pieza.");
            return;}

      // Verificar si es un movimiento válido
      let movimientosValidos = [];
      switch (tipoPieza) {
        case "caballo":
          movimientosValidos = movimientosCaballo(xInicial, yInicial);
          break;
        case "torre":
          movimientosValidos = movimientosTorre(xInicial, yInicial);
          break;
        case "alfil":
          movimientosValidos = movimientosAlfil(xInicial, yInicial);
          break;
        case "reina":
          movimientosValidos = movimientosReina(xInicial, yInicial);
          break;
        case "rey":
          movimientosValidos = movimientosRey(xInicial, yInicial);
          break;
        case "peon":
          movimientosValidos = movimientosPeon(xInicial, yInicial, colorPieza);
          break;
      }

      // Verificar si la posición destino está en movimientos válidos
      const destinoValido = movimientosValidos.some(([nx, ny]) => nx === xDestino && ny === yDestino);
      if (!destinoValido) {
        alert("Movimiento inválido");
        return;
      }

      // Actualizar el tablero actual (mover la pieza)
      tableroActual[yDestino][xDestino] = tableroActual[yInicial][xInicial];
      tableroActual[yInicial][xInicial] = null;

      // Cambiar turno, registrar movimiento
      CambiarTurno(tableroActual[yDestino][xDestino], posInicial, posDestino);

      // Volver a renderizar tablero y reconfigurar eventos
      renderizarTablero(tableroActual);
      configurarEventosPiezas();
      configurarEventosCasillas();

      piezaArrastrada = null;
      posInicial = null;
    });
  });
}
//------------------INICIALIZACIÓN DE EVENTOS---------------------
document.addEventListener("DOMContentLoaded", function () // espera a que el DOM esté completamente cargado
 {
        renderizarTablero(tableroActual);
        configurarEventosPiezas();
        configurarEventosCasillas();
        document.getElementById("jugador-actual").textContent = jugadores[turnoActual];
    });

/* ---------------LOCAL STORAGE------------------- */ // no pescar pq ya no usamos localStorage xd

/*
//Restaura la partida
    // const partidaGuardada = localStorage.getItem("partidaAjedrez");

    if (partidaGuardada) {
        const datos = JSON.parse(partidaGuardada);
        registroMovimientos = datos.movimientos || [];
        turnoActual = datos.turno || "blancas";
        numeroMovimiento = datos.numeroMovimiento || 1;

        if (datos.piezas && Array.isArray(datos.piezas)) {
            const celdas = document.querySelectorAll(".tablero > div");
            celdas.forEach(celda => celda.innerHTML = "");

            datos.piezas.forEach(pieza => {
                const celda = document.querySelector(`.${pieza.pos}`);
                if (celda) {
                    const span = document.createElement("span");
                    span.classList.add("pieza", pieza.color);
                    span.style.fontSize = "2.5rem";
                    span.setAttribute("draggable", "true");
                    span.setAttribute("data-info", JSON.stringify({ tipo: pieza.tipo, color: pieza.color }));

                    switch (pieza.tipo) {
                        case "torre": span.innerHTML = pieza.color === "blanca" ? "&#9814;" : "&#9820;"; break;
                        case "caballo": span.innerHTML = pieza.color === "blanca" ? "&#9816;" : "&#9822;"; break;
                        case "alfil": span.innerHTML = pieza.color === "blanca" ? "&#9815;" : "&#9821;"; break;
                        case "reina": span.innerHTML = pieza.color === "blanca" ? "&#9813;" : "&#9819;"; break;
                        case "rey": span.innerHTML = pieza.color === "blanca" ? "&#9812;" : "&#9818;"; break;
                        case "peon": span.innerHTML = pieza.color === "blanca" ? "&#9817;" : "&#9823;"; break;
                    }

                    celda.appendChild(span);
                }
            });
        }

            actualizarListaMovimientos();
            document.getElementById("jugador-actual").textContent = jugadores[turnoActual];
        }
*/

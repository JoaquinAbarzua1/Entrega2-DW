//Variables adicionales
let registroMovimientos=[];
let numeroMovimiento =1;
let piezaArrastrada = null;
let posInicial = null;

// Variables de estado
let turnoActual = "blancas";
const jugadores = {
    blancas: "Jugador 1",
    negras: "Jugador 2"
};

// Funciones..

function obtenerEstadoTablero() {
    const celdas = document.querySelectorAll(".tablero > div");
    const estado = [];

    celdas.forEach(celda => {
        const clase = celda.className.match(/([a-h][1-8])/);
        if (!clase) return;

        const pos = clase[0]; // ejemplo: "a8"
        const pieza = celda.querySelector(".pieza");
        if (pieza) {
            estado.push({
                pos,
                tipo: JSON.parse(pieza.getAttribute("data-info")).tipo,
                color: pieza.classList.contains("blanca") ? "blanca" : "negra"
            });
        }
    });

    return estado;
}
        //Funcion CambiarTurno

function CambiarTurno(pieza, desde, hacia) {
    turnoActual = turnoActual === "blancas" ? "negras" : "blancas";
    // registrar el movimiento

    const notacion = `${numeroMovimiento}. ${desde} → ${hacia}`;
    registroMovimientos.push(notacion);
            
    // Persitencia..
    localStorage.setItem("partidaAjedrez", JSON.stringify({
        movimientos: registroMovimientos , turno: turnoActual , numeroMovimiento: numeroMovimiento, piezas: obtenerEstadoTablero()
    }));

    // actualizar lista de movimientos
    actualizarListaMovimientos();

    // Solo incrementa el numero despues del turno de negras
    if(turnoActual==="blancas") {numeroMovimiento++;}

    document.getElementById("jugador-actual").textContent = jugadores[turnoActual];
    console.log(`Ahora es el turno de: ${turnoActual}`);
}

function actualizarListaMovimientos(){
    const lista = document.getElementById("lista-movimientos");
        lista.innerHTML = registroMovimientos.map(mov => `<div class=movimiento>${mov}</div>`).join("");
}


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



document.addEventListener("DOMContentLoaded", function () {
    

//Restaura la partida
    const partidaGuardada = localStorage.getItem("partidaAjedrez");
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

        configurarEventosPiezas();

// Convertir posición "a8" a coordenadas [x, y] (ej: "a8" → [0, 0])
    function posicionACoordenadas(pos) {
        const x = pos.charCodeAt(0) - "a".charCodeAt(0); // a=0, b=1, ..., h=7
        const y = 8 - parseInt(pos[1]); // 8=0, 7=1, ..., 1=7
        return [x, y];
    }
        // Habilita cada casilla como zona de "soltar"
    document.querySelectorAll(".tablero > div").forEach(casilla => {
        casilla.addEventListener("dragover", (e) => {
            e.preventDefault(); // Necesario para permitir drop
        });

        casilla.addEventListener("drop", (e) => {
            e.preventDefault();
            if (!piezaArrastrada) return; // LOGICA DE VALIDACION DE MOVIMIENTO [LINEA 443-492]

            const posDestino = casilla.className.match(/([a-h][1-8])/)[0]; // Ej: "b6"
            const [xInicial, yInicial] = posicionACoordenadas(posInicial);
            const [xDestino, yDestino] = posicionACoordenadas(posDestino);

            // Obtener tipo y color de la pieza (desde data-info o clases)
            const tipoPieza = JSON.parse(piezaArrastrada.getAttribute("data-info")).tipo ;
            const colorPieza = piezaArrastrada.classList.contains("negra") ? "negra" : "blanca";

            // Verificar movimiento válido
            let movimientosValidos = [];
            switch (tipoPieza) {
                case "caballo":
                    movimientosValidos = movimientosCaballo(xInicial, yInicial);
                    break;
                case "alfil":
                    movimientosValidos = movimientosAlfil(xInicial, yInicial);
                    break;
                case "torre":
                    movimientosValidos = movimientosTorre(xInicial, yInicial);
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

            // Verificar si el destino está en movimientos válidos
            const movimientoPermitido = movimientosValidos.some(([x, y]) => 
                x === xDestino && y === yDestino
            );

            // Verificar si hay una pieza del mismo color en el destino
            const piezaDestino = casilla.querySelector(".pieza");
            const mismoColor = piezaDestino && piezaDestino.classList.contains(colorPieza);

            // Evita que se agregue más de una pieza en la misma casilla
            if(movimientoPermitido && !mismoColor){
                const piezaInfo = JSON.parse(piezaArrastrada.getAttribute("data-info"));
                const desde = posInicial;
                const hacia = posDestino;
                casilla.innerHTML = "";
                casilla.appendChild(piezaArrastrada);
                CambiarTurno(piezaInfo.tipo, desde, hacia);
            }

            piezaArrastrada = null;
            posInicial = null;
            
        });
        });


        document.getElementById("jugador-actual").textContent = jugadores[turnoActual];
    });


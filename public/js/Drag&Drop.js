//Variables adicionales
let registroMovimientos=[];
let numeroMovimiento =1;

// Variables de estado
        let turnoActual = "blancas";
        const jugadores = {
            blancas: "Jugador 1",
            negras: "Jugador 2"
        };


        //Funcion CambiarTurno

        function CambiarTurno(pieza, desde, hacia) {
            turnoActual = turnoActual === "blancas" ? "negras" : "blancas";
            // registrar el movimiento

            const notacion = `${numeroMovimiento}. ${desde} → ${hacia}`;
            registroMovimientos.push(notacion);
            
            // Persitencia..
            localStorage.setItem("partidaAjedrez", JSON.stringify({
                movimientos: registroMovimientos , turno: turnoActual , numeroMovimiento: numeroMovimiento
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



        // DE AQUI PARA ABAJO PONER NOMBRE A LAS FUNCIONES 
    document.addEventListener("DOMContentLoaded", () => {

        //FUNCION 'CONFIGURAR ELEMENTOS DEL TABLERO'
        document.querySelectorAll(".pieza").forEach(pieza => { 
        pieza.setAttribute("draggable", "true");
        });

        //--Info 
// querySelectorAll: Cadena de texto que contiene un selector CSS válido, como un ID, clase, nombre de etiqueta, o cualquier combinador CSS.
// En este caso seleccionas todos los elementos de la clase "pieza" 


    });

    let x = 1;
    let pos = 0;
    let y = ["a", "b", "c", "d", "e", "f", "g"];
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".cuadro").forEach(pieza => {
            cuadro.classList.add(y[pos]+x);
            if(x <= 8){
                x++;
            }
            else{
                pos++;
            }
        });
    });
    
    document.addEventListener("DOMContentLoaded", () => {
        var tablero = document.querySelector(".tablero");

        for(let i = 0; i<8; i++){
            for(let j = 0; j<8; j++){
            for(let i = 0; i<8; i++){
            
        }
            }
        }
    });

        document.addEventListener("DOMContentLoaded", function () {
        let piezaArrastrada = null;
        let posInicial = null;

        // Cuando empieza a arrastrar una pieza
        document.querySelectorAll(".pieza").forEach(pieza => {
        pieza.addEventListener("dragstart", (e) => {
            const colorPieza = pieza.classList.contains("negra") ? "negra" : "blanca";

            if ((colorPieza === "negra" && turnoActual !== "negras") || 
                (colorPieza === "blanca" && turnoActual !== "blancas")){
                    e.preventDefault();
                    alert("¡No es tu turno!");
                    return;
            }

            piezaArrastrada = pieza;
            posInicial = pieza.parentElement.className.match(/([a-h][1-8])/)[0]; // Ej: "a8"
            setTimeout(() => pieza.style.display = "none", 0);
        });

        pieza.addEventListener("dragend", (e) => {
            pieza.style.display = "";
        });
        });

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
            const tipoPieza = piezaArrastrada.getAttribute("data-info") // ocupas el data-info
                ? JSON.parse(piezaArrastrada.getAttribute("data-info")).tipo 
                : piezaArrastrada.textContent.trim().toLowerCase(); // Por si no hay data-info
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


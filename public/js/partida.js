// Mapa de coordenadas (letra a número)
const letraANumero = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };

document.addEventListener("DOMContentLoaded", function () {
    let piezaArrastrada = null;
    let turno = 'blanca'; // Empiezan las blancas

    // Configurar piezas como arrastrables
    document.querySelectorAll(".pieza").forEach(pieza => {
        pieza.setAttribute('draggable', 'true');
        
        pieza.addEventListener("dragstart", (e) => {
            const piezaData = JSON.parse(e.target.dataset.info);
            
            // Verificar turno
            if (piezaData.color !== turno) {
                e.preventDefault();
                return;
            }
            
            piezaArrastrada = e.target;
            e.dataTransfer.setData('text/plain', JSON.stringify(piezaData));
            setTimeout(() => pieza.style.opacity = "0.4", 0);
        });

        pieza.addEventListener("dragend", (e) => {
            e.target.style.opacity = "1";
        });
    });

    // Configurar casillas como zonas de drop
    document.querySelectorAll(".tablero > div").forEach(casilla => {
        casilla.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        casilla.addEventListener("dragenter", (e) => {
            e.preventDefault();
            
            // Obtener coordenadas de la casilla destino
            const id = casilla.className.split(' ')[1] || casilla.className;
            const x = letraANumero[id[0]];
            const y = parseInt(id[1]) - 1;
            
            // Verificar si el movimiento es válido (aquí necesitarías implementar más lógica)
            casilla.style.backgroundColor = "rgba(0, 255, 0, 0.3)";
        });

        casilla.addEventListener("dragleave", () => {
            casilla.style.backgroundColor = "";
        });

        casilla.addEventListener("drop", (e) => {
            e.preventDefault();
            casilla.style.backgroundColor = "";
            
            if (piezaArrastrada) {
                const piezaData = JSON.parse(e.dataTransfer.getData('text/plain'));
                const id = casilla.className.split(' ')[1] || casilla.className;
                const xDestino = letraANumero[id[0]];
                const yDestino = parseInt(id[1]) - 1;
                
                // Obtener movimientos válidos
                const movimientosValidos = obtenerMovimientosValidos(
                    piezaData.tipo, 
                    piezaData.x, 
                    piezaData.y, 
                    piezaData.color
                );
                
                // Verificar si el movimiento es válido
                const movimientoValido = movimientosValidos.some(
                    ([x, y]) => x === xDestino && y === yDestino
                );
                
                if (movimientoValido) {
                    // Actualizar posición de la pieza
                    piezaArrastrada.dataset.info = JSON.stringify({
                        ...piezaData,
                        x: xDestino,
                        y: yDestino
                    });
                    
                    // Mover la pieza
                    const existingPiece = casilla.querySelector('.pieza');
                    if (existingPiece) {
                        existingPiece.remove();
                    }
                    
                    casilla.appendChild(piezaArrastrada);
                    piezaArrastrada.style.opacity = "1";
                    piezaArrastrada = null;
                    
                    // Cambiar turno
                    turno = turno === 'blanca' ? 'negra' : 'blanca';
                    document.querySelector('.turno-indicador').textContent = `Turno: ${turno === 'blanca' ? 'Tú' : 'Oponente'}`;
                }
            }
        });
    });
});

// Resto de tus funciones de movimientos (caballo, alfil, etc.) permanecen igual

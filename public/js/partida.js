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

let turno = 'blanca';

function obtenerMovimientosValidos(tipo, x, y, color) {
  switch (tipo) {
    case 'caballo': return movimientosCaballo(x, y);
    case 'alfil': return movimientosAlfil(x, y);
    case 'torre': return movimientosTorre(x, y);
    case 'reina': return movimientosReina(x, y);
    case 'rey': return movimientosRey(x, y);
    case 'peon': return movimientosPeon(x, y, color);
    default: return [];
  }
}

// Este evento se lanza al iniciar el drag
document.querySelectorAll('.pieza').forEach(pieza => {
  pieza.addEventListener('dragstart', (e) => {
    const piezaData = JSON.parse(e.target.dataset.info); // debes guardar tipo/color/x/y como data-info
    if (piezaData.color !== turno) {
      e.preventDefault(); // No permite mover pieza si no es su turno
      return;
    }

    // Guardar info en el drag
    e.dataTransfer.setData("text/plain", JSON.stringify(piezaData));
  });
});

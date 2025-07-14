document.addEventListener("DOMContentLoaded", () => {
    // Botón para crear una nueva partida
    const btnNuevaPartida = document.getElementById("btnNuevaPartida");
    if (btnNuevaPartida) {
       btnNuevaPartida.addEventListener("click", async () => {
    if (confirm("Estas seguro de crear una nueva partida?")) {
        try {
            const respuesta = await fetch("/nueva-partida", { method: "POST", headers: {"Content-Type": "application/json"} });
            if (respuesta.ok) {
                const data = await respuesta.json();
                alert(`Invita a tu amigo con este link: ${data.linkInvitacion}`);
                window.location.href = `/partida/${data.partidaId}`;
            } else {
                alert("No se pudo crear nueva partida");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
});

    }
    // Botón para rendirse
    const btnRendirse = document.getElementById("btnRendirse");
    if (btnRendirse) {
        btnRendirse.addEventListener("click", async () => {
            if (confirm("Estas seguro de rendirte?")) {
                try {
                    const respuesta = await fetch("/rendirse", { method: "POST" });
                    if (respuesta.ok) {
                        const resultado = await respuesta.json();
                        alert(`Has abandonado la partida. Resultado: ${resultado.resultado}`);
                        location.reload();
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }
        });
    }
    // Botón para ofrecer tablas
    const btnEmpatar = document.getElementById("btnEmpatar");
    if (btnEmpatar) {
        btnEmpatar.addEventListener("click", async () => {
            if (confirm("Quieres tablas?")) {
                try {
                    const respuesta = await fetch("/empatar", { method: "POST" });
                    if (respuesta.ok) {
                        const resultado = await respuesta.json();
                        alert(`Has ofrecido tablas. Estado: ${resultado.status}`);
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }
        });
    }
    // Botón para eliminar la partida
    const btnEliminar = document.getElementById("btnEliminarPartida");
if (btnEliminar) {
  btnEliminar.addEventListener("click", async () => {
    if (confirm("¿Seguro que quieres eliminar esta partida?")) {
      const id = btnEliminar.dataset.partidaId;
      const res = await fetch(`/partida/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Partida eliminada");
        window.location.href = "/"; // volver al inicio
      } else {
        alert("No se pudo eliminar la partida");
      }
    }
  });
}

});

document.addEventListener("DOMContentLoaded", () => {
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
});

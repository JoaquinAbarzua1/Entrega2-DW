document.addEventListener("DOMContentLoaded", () => {

            // PARA CREAR NUEVA PARTIDA..

            document.getElementById("btnNuevaPartida").addEventListener("click", async() => {
                if (confirm("Estas seguro de crear una nueva partida?")){
                    try{
                        const respuesta = await fetch("/nueva-partida", { 
                            // aca se hizo una peticion HTTP mediante fetch(), 
                        // /nueva-partida es la URL a la que se envia la peticion, mediante una ruta del servidor express
                            method: "POST", headers: {
                                // method: POST especifica que estoy haciendo una peticion POST (para crear/modificar datos), Alternativas serían GET (para leer), PUT/PATCH (para actualizar), DELETE
                                "Content-Type": "aplication/json"

                                // Esto de arriba le dice al servidor que estoy enviando datos en formato JSON ya que el servidor express saber como interpretar los datos recibidos
                            }
                        });

                        if (respuesta.ok){
                            location.reload(); //recargar la pagina 
                        }else{
                            alert("No se pudo crear nueva partida");
                        }
                    } catch (error){
                        console.error("Error:", error);
                    }
                }
            });

            //RENDIRSE..

            document.getElementById("btnRendirse").addEventListener("click", async()=>{
                if(confirm("Estas seguro de rendirte?")){
                    try{
                        const respuesta = await fetch("/rendirse", {
                            method: "POST"
                        });

                        if(respuesta.ok){
                            const resultado = await respuesta.json();
                            alert(`Has abandonado la partida de una forma muy gay. Resultado: ${resultado.resultado}`); // OJO AQUI
                            location.reload();
                        }
                    } catch(error){
                        console.error("Error:",error);
                    }
                }
            });

            //EMPATAR..

            document.getElementById("btnEmpatar").addEventListener("click", async() =>{
                if(confirm("Quieres un stalemate wekito?")){
                    try{
                        const respuesta = await fetch("/empatar", {
                            method: "POST"
                        });

                        if(respuesta.ok){
                            const resultado = await respuesta.json();
                            alert(`Has ofrecido tablas. Estado: ${resultado.status}`); // OJO AQUI
                            // Actualizar UI segun sea necesario
                        }
                    }catch(error)
                    {
                        console.error("Error:",error);
                    }
                }
            });
        });
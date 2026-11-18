var listaPersonajes = [];
var modalInstancia = null;

function iniciar() {
    var elementoModal = document.getElementById("modalDetalle");
    modalInstancia = new bootstrap.Modal(elementoModal);
    obtenerDatos();
}

function obtenerDatos() {
    fetch("https://api.disneyapi.dev/character")
        .then(procesarRespuesta)
        .then(guardarYMostrar)
        .catch(manejarError);
}

function procesarRespuesta(respuesta) {
    return respuesta.json();
}

function guardarYMostrar(datosJson) {
    listaPersonajes = datosJson.data;
    renderizarLista();
}

function manejarError(error) {
    var contenedor = document.getElementById("contenedor");
    contenedor.innerHTML = "<div class='alert alert-danger'>Error al conectar con la API.</div>";
}

function renderizarLista() {
    var contenedor = document.getElementById("contenedor");
    var htmlAcumulado = "";
    var i = 0;

    for (i = 0; i < listaPersonajes.length; i++) {
        htmlAcumulado += "<div class='card p-3 shadow-sm tarjeta-personaje d-flex align-items-center justify-content-center text-center' onclick='verDetalle(" + i + ")'>";
        htmlAcumulado += "  <h6 class='m-0'>" + listaPersonajes[i].name + "</h6>";
        htmlAcumulado += "  <small class='text-primary mt-2'>Ver foto y detalle</small>";
        htmlAcumulado += "</div>";
    }

    contenedor.innerHTML = htmlAcumulado;
}

function verDetalle(indice) {
    var personaje = listaPersonajes[indice];
    var titulo = document.getElementById("modalTitulo");
    var imagen = document.getElementById("modalImagen");
    var info = document.getElementById("modalInfo");
    var textoPeliculas = "Ninguna";
    var textoSeries = "Ninguna";

    titulo.innerText = personaje.name;
    
    // Carga diferida: recién aquí el navegador descarga la imagen al hacer clic
    imagen.src = ""; 
    if (personaje.imageUrl) {
        imagen.src = personaje.imageUrl;
        imagen.style.display = "inline-block";
    } else {
        imagen.style.display = "none";
    }

    if (personaje.films && personaje.films.length > 0) {
        textoPeliculas = personaje.films.join(", ");
    }

    if (personaje.tvShows && personaje.tvShows.length > 0) {
        textoSeries = personaje.tvShows.join(", ");
    }

    info.innerHTML = "<p><strong>ID:</strong> " + personaje._id + "</p>" +
                     "<p><strong>Películas:</strong> " + textoPeliculas + "</p>" +
                     "<p><strong>Series de TV:</strong> " + textoSeries + "</p>";

    modalInstancia.show();
}

window.onload = iniciar;

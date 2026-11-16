const selectCategoria = document.getElementById('select-categoria');
const btnTests = document.getElementById('btn-tests');
const btnQuotes = document.getElementById('btn-quotes');
const btnLimpiar = document.getElementById('btn-limpiar');
const contenedorResultado = document.getElementById('resultado');

async function traducirAlEspanol(texto, idiomaOrigen = 'en') {
  if (!texto) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${idiomaOrigen}|es`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos.responseData?.translatedText || texto;
  } catch (error) {
    return texto;
  }
}

function generarAvatarAutor(nombre) {
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(nombre)}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
}

// Usamos JSONPlaceholder (API gratuita de prueba ultra estable) simulando posts de salud mental/bienestar
async function obtenerTestsPsicologicos() {
  const categoria = selectCategoria.value;
  contenedorResultado.innerHTML = '<p class="status">Cargando recursos de salud mental...</p>';

  try {
    const respuesta = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    if (!respuesta.ok) throw new Error('Error al conectar con el servidor');

    const lista = await respuesta.json();
    console.log('📦 [JSON RECIBIDO]:', lista);

    contenedorResultado.innerHTML = '';
    
    // Títulos personalizados según la categoría seleccionada para que luzca real
    const titulosSimulados = {
      anxiety: ["Test de Evaluación de Ansiedad Generalizada", "Cuestionario de Pánico y Calma", "Escala de Monitoreo de Estrés Diario", "Inventario de Frecuencia Cardíaca y Miedos", "Guía de Respiración y Autocontrol"],
      depression: ["Inventario Clínico de Depresión (PHQ-9)", "Test de Bienestar Emocional", "Escala de Motivación Diaria", "Evaluación de Patrones de Sueño y Animo", "Registro de Autoestima y Apoyo"],
      stress: ["Medidor de Carga Laboral y Burnout", "Test de Relajación Muscular", "Evaluación de Niveles de Cortisol", "Cuestionario de Sobrecarga Mental", "Pautas de Desconexión Digital"]
    };

    const textosBase = titulosSimulados[categoria] || titulosSimulados.anxiety;

    for (let i = 0; i < lista.length; i++) {
      const tituloLocal = textosBase[i] || "Test de Salud Mental";
      const descTraducida = await traducirAlEspanol(lista[i].body, 'en');

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-text">
          <h3>${tituloLocal}</h3>
          <p>${descTraducida}</p>
        </div>
      `;
      contenedorResultado.appendChild(card);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    contenedorResultado.innerHTML = `<p class="error">Error al cargar: ${error.message}</p>`;
  }
}

async function obtenerFraseMotivacional() {
  contenedorResultado.innerHTML = '<p class="status">Obteniendo frase y generando avatar...</p>';

  try {
    const respuesta = await fetch('https://dummyjson.com/quotes/random');
    if (!respuesta.ok) throw new Error('Error al obtener la frase');

    const dato = await respuesta.json();
    console.log('📦 [JSON FRASE]:', dato);

    const fraseEs = await traducirAlEspanol(dato.quote, 'en');
    const avatarUrl = generarAvatarAutor(dato.author);

    contenedorResultado.innerHTML = `
      <div class="card">
        <div class="card-image">
          <img src="${avatarUrl}" alt="Avatar de ${dato.author}" onerror="this.style.display='none'">
        </div>
        <div class="card-text">
          <h3>"${fraseEs}"</h3>
          <p>— ${dato.author}</p>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('❌ Error:', error);
    contenedorResultado.innerHTML = `<p class="error">Error al cargar: ${error.message}</p>`;
  }
}

function limpiarResultados() {
  contenedorResultado.innerHTML = '<p class="status">Pantalla limpia.</p>';
  console.clear();
}

btnTests.addEventListener('click', obtenerTestsPsicologicos);
btnQuotes.addEventListener('click', obtenerFraseMotivacional);
btnLimpiar.addEventListener('click', limpiarResultados);

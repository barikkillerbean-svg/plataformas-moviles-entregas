// ==========================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ==========================================
const selectCategoria = document.getElementById('select-categoria');
const btnTests = document.getElementById('btn-tests');
const btnQuotes = document.getElementById('btn-quotes');
const btnLimpiar = document.getElementById('btn-limpiar');
const contenedorResultado = document.getElementById('resultado');

// ==========================================
// 2. FUNCIONES AUXILIARES (Traducción y Avatar)
// ==========================================
async function traducirAlEspanol(texto, idiomaOrigen = 'en') {
  if (!texto) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${idiomaOrigen}|es`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos.responseData?.translatedText || texto;
  } catch (error) {
    console.warn('No se pudo traducir automáticamente:', error);
    return texto;
  }
}

function generarAvatarAutor(nombre) {
  return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(nombre)}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
}

// ==========================================
// 3. CONSUMO DE API 1: TESTS PSICOLÓGICOS
// ==========================================
async function obtenerTestsPsicologicos() {
  const categoria = selectCategoria.value;
  contenedorResultado.innerHTML = '<p class="status">Consultando API de tests psicológicos...</p>';

  try {
    const url = `https://psychologieetserenite.com/api/tests?category=${encodeURIComponent(categoria)}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al consultar los tests.`);
    }

    const datos = await respuesta.json();
    console.log('📦 [JSON TESTS]:', datos);

    const lista = Array.isArray(datos) ? datos : (datos.tests || datos.data || []);

    if (lista.length === 0) {
      contenedorResultado.innerHTML = '<p class="status">No se encontraron tests para esta categoría.</p>';
      return;
    }

    const primerosCinco = lista.slice(0, 5);
    contenedorResultado.innerHTML = '<p class="status">Traduciendo resultados al español...</p>';

    const tarjetasTraducidas = await Promise.all(
      primerosCinco.map(async (item) => {
        const tituloOriginal = item.title || item.name || 'Test de Evaluación';
        const descOriginal = item.description || 'Cuestionario estandarizado de evaluación psicológica.';
        const idioma = /[éèêàùç]/.test(tituloOriginal) ? 'fr' : 'en';

        const tituloEs = await traducirAlEspanol(tituloOriginal, idioma);
        const descEs = await traducirAlEspanol(descOriginal, idioma);

        return { titulo: tituloEs, descripcion: descEs };
      })
    );

    contenedorResultado.innerHTML = '';
    tarjetasTraducidas.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-text">
          <h3>${item.titulo}</h3>
          <p>${item.descripcion}</p>
        </div>
      `;
      contenedorResultado.appendChild(card);
    });

  } catch (error) {
    console.error('❌ Error en Tests:', error);
    contenedorResultado.innerHTML = `<p class="error">Ocurrió un error: ${error.message}</p>`;
  }
}

// ==========================================
// 4. CONSUMO DE API 2: FRASE + AVATAR
// ==========================================
async function obtenerFraseMotivacional() {
  contenedorResultado.innerHTML = '<p class="status">Obteniendo frase y generando avatar...</p>';

  try {
    const respuesta = await fetch('https://dummyjson.com/quotes/random');

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status} al obtener la frase.`);
    }

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
    console.error('❌ Error en Frase:', error);
    contenedorResultado.innerHTML = `<p class="error">Ocurrió un error: ${error.message}</p>`;
  }
}

// ==========================================
// 5. LIMPIAR PANTALLA Y EVENTOS
// ==========================================
function limpiarResultados() {
  contenedorResultado.innerHTML = '<p class="status">Pantalla limpia. Selecciona una opción para consultar nuevamente.</p>';
  console.clear();
}

btnTests.addEventListener('click', obtenerTestsPsicologicos);
btnQuotes.addEventListener('click', obtenerFraseMotivacional);
btnLimpiar.addEventListener('click', limpiarResultados);

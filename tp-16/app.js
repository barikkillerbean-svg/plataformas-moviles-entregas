const btnTests = document.getElementById('btn-tests');
const btnQuotes = document.getElementById('btn-quotes');
const contenedorResultado = document.getElementById('resultado');

const traducciones = {
  "anxiety": "Ansiedad",
  "depression": "Depresión",
  "stress": "Estrés",
  "attachment": "Apego",
  "self-esteem": "Autoestima",
  "burnout": "Desgaste profesional (Burnout)",
  "General Anxiety Disorder": "Trastorno de Ansiedad Generalizada",
  "Beck Anxiety Inventory": "Inventario de Ansiedad de Beck",
  "Social Anxiety": "Ansiedad Social",
  "Panic Disorder": "Trastorno de Pánico"
};


async function traducirAlEspanol(texto, idiomaOrigen = 'en') {
  if (!texto) return '';
  if (traducciones[texto]) return traducciones[texto];
  
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${idiomaOrigen}|es`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (e) {
    console.warn('No se pudo traducir automáticamente:', e);
  }
  return texto;
}

async function obtenerTestsPsicologicos() {
  contenedorResultado.innerHTML = '<p class="status">Cargando y traduciendo tests al español...</p>';
  
  try {
    
    const respuesta = await fetch('https://psychologieetserenite.com/api/tests?category=anxiety&lang=es');
    
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    
    const datos = await respuesta.json();
    console.log('Respuesta JSON original (Tests):', datos);

    const lista = Array.isArray(datos) ? datos : (datos.tests || datos.data || []);
    
    if (lista.length === 0) {
      contenedorResultado.innerHTML = '<p class="status">No se encontraron resultados.</p>';
      return;
    }

    const primerosCinco = lista.slice(0, 5);
    
    
    const tarjetasTraducidas = await Promise.all(
      primerosCinco.map(async (item) => {
        const tituloOriginal = item.title || item.name || 'Test de Evaluación';
        const descOriginal = item.description || 'Cuestionario estandarizado de evaluación psicológica.';
        
        
        const esFrances = /[éèêàùçâîôû]| (de|du|des|le|la|les|pour|avec) /i.test(tituloOriginal);
        const idiomaOrigen = esFrances ? 'fr' : 'en';

        const tituloEs = await traducirAlEspanol(tituloOriginal, idiomaOrigen);
        const descEs = await traducirAlEspanol(descOriginal, idiomaOrigen);

        return { titulo: tituloEs, descripcion: descEs };
      })
    );

    contenedorResultado.innerHTML = '';
    tarjetasTraducidas.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${item.titulo}</h3>
        <p>${item.descripcion}</p>
      `;
      contenedorResultado.appendChild(card);
    });
  } catch (error) {
    console.error('Error al consultar la API de tests:', error);
    contenedorResultado.innerHTML = `<p class="status">Hubo un problema al conectar con la API: ${error.message}</p>`;
  }
}

async function obtenerFraseMotivacional() {
  contenedorResultado.innerHTML = '<p class="status">Cargando frase en español...</p>';
  
  try {
    const respuesta = await fetch('https://dummyjson.com/quotes/random');
    
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    
    const dato = await respuesta.json();
    console.log('Respuesta JSON original (Frase):', dato);

    const fraseEs = await traducirAlEspanol(dato.quote, 'en');

    contenedorResultado.innerHTML = `
      <div class="card">
        <h3>"${fraseEs}"</h3>
        <p>— ${dato.author}</p>
      </div>
    `;
  } catch (error) {
    console.error('Error al consultar la API de frases:', error);
    contenedorResultado.innerHTML = `<p class="status">Error al cargar la frase: ${error.message}</p>`;
  }
}

// Asignar eventos a los botones
btnTests.addEventListener('click', obtenerTestsPsicologicos);
btnQuotes.addEventListener('click', obtenerFraseMotivacional);

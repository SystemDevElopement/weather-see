// utilidades.js
// Funciones chicas y reutilizables que no tienen nada que ver con el clima en sí.
// La idea es que clima.js y ubicacion.js puedan apoyarse en esto sin repetir código.

const Utilidades = {

  // Redondeamos siempre para mostrar, pero guardamos los valores originales
  // por si en algún momento hace falta más precisión (ej. gráficos).
  redondear(numero) {
    return Math.round(numero);
  },

  celsiusAFahrenheit(gradosCelsius) {
    return (gradosCelsius * 9) / 5 + 32;
  },

  // Recibe la unidad actual ('c' o 'f') y devuelve el número ya convertido y redondeado,
  // para no repetir el if/else de conversión en cada lugar donde se pinta una temperatura.
  formatearTemperatura(gradosCelsius, unidad) {
    const valor = unidad === 'f' ? this.celsiusAFahrenheit(gradosCelsius) : gradosCelsius;
    return this.redondear(valor);
  },

  capitalizar(texto) {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  },

  // Formatea una hora tipo "14:00" en algo más natural para leer, ej "14 h".
  // Si es la hora actual, mostramos "Ahora" en vez del número, que es lo que uno espera ver primero.
  formatearHora(fechaISO, esLaPrimera) {
    if (esLaPrimera) return 'Ahora';

    const fecha = new Date(fechaISO);
    const hora = fecha.getHours();
    return `${hora} h`;
  },

  // Nombre corto del día. "Hoy" y "Mañana" en vez de la fecha, porque es lo que
  // una persona real diría, y el resto de los días con el nombre en español.
  nombreDelDia(fechaISO, indice) {
    const fecha = new Date(`${fechaISO}T12:00:00`);
    const hoy = new Date();

    if (fecha.toDateString() === hoy.toDateString()) return 'Hoy';
    if (indice === 1) return 'Mañana';

    const nombre = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    return this.capitalizar(nombre);
  },

  formatearHoraDelDia(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  },

  // Espera a que el usuario deje de tipear antes de disparar la búsqueda,
  // para no golpear la API de geocodificación con cada tecla que aprieta.
  esperarQueTermineDeEscribir(funcion, milisegundos) {
    let temporizador = null;

    return function (...argumentos) {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => funcion.apply(this, argumentos), milisegundos);
    };
  },

  // Atajo para no escribir document.createElement + asignaciones sueltas
  // cada vez que arma un pedazo de interfaz desde JS.
  crearElemento(etiqueta, clases, contenidoHTML) {
    const elemento = document.createElement(etiqueta);

    if (clases) elemento.className = clases;
    if (contenidoHTML !== undefined) elemento.innerHTML = contenidoHTML;

    return elemento;
  },

  // Metros a kilómetros, para la visibilidad. Open-Meteo la devuelve en metros
  // y a nadie le sirve ver "8000 m", conviene mostrarlo en km.
  metrosAKilometros(metros) {
    return Math.round(metros / 1000);
  },

};

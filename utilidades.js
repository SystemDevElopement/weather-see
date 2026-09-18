
const Utilidades = {

  
  redondear(numero) {
    return Math.round(numero);
  },

  celsiusAFahrenheit(gradosCelsius) {
    return (gradosCelsius * 9) / 5 + 32;
  },

  formatearTemperatura(gradosCelsius, unidad) {
    const valor = unidad === 'f' ? this.celsiusAFahrenheit(gradosCelsius) : gradosCelsius;
    return this.redondear(valor);
  },

  capitalizar(texto) {
    if (!texto) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  },

  formatearHora(fechaISO, esLaPrimera) {
    if (esLaPrimera) return 'Ahora';

    const fecha = new Date(fechaISO);
    const hora = fecha.getHours();
    return `${hora} h`;
  },

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


  esperarQueTermineDeEscribir(funcion, milisegundos) {
    let temporizador = null;

    return function (...argumentos) {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => funcion.apply(this, argumentos), milisegundos);
    };
  },


  crearElemento(etiqueta, clases, contenidoHTML) {
    const elemento = document.createElement(etiqueta);

    if (clases) elemento.className = clases;
    if (contenidoHTML !== undefined) elemento.innerHTML = contenidoHTML;

    return elemento;
  },

  metrosAKilometros(metros) {
    return Math.round(metros / 1000);
  },

};

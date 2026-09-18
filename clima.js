
let unidadElegida = 'c';

let ultimosDatosDelClima = null;
let ultimoNombreDeLugar = '';

const CODIGOS_DE_CLIMA = {
  0: { tipo: 'despejado', texto: 'Despejado' },
  1: { tipo: 'despejado', texto: 'Mayormente despejado' },
  2: { tipo: 'nublado', texto: 'Parcialmente nublado' },
  3: { tipo: 'nublado', texto: 'Nublado' },
  45: { tipo: 'niebla', texto: 'Niebla' },
  48: { tipo: 'niebla', texto: 'Niebla helada' },
  51: { tipo: 'lluvia', texto: 'Llovizna ligera' },
  53: { tipo: 'lluvia', texto: 'Llovizna' },
  55: { tipo: 'lluvia', texto: 'Llovizna intensa' },
  56: { tipo: 'lluvia', texto: 'Llovizna helada' },
  57: { tipo: 'lluvia', texto: 'Llovizna helada intensa' },
  61: { tipo: 'lluvia', texto: 'Lluvia ligera' },
  63: { tipo: 'lluvia', texto: 'Lluvia' },
  65: { tipo: 'lluvia', texto: 'Lluvia intensa' },
  66: { tipo: 'lluvia', texto: 'Lluvia helada' },
  67: { tipo: 'lluvia', texto: 'Lluvia helada intensa' },
  71: { tipo: 'nieve', texto: 'Nieve ligera' },
  73: { tipo: 'nieve', texto: 'Nieve' },
  75: { tipo: 'nieve', texto: 'Nieve intensa' },
  77: { tipo: 'nieve', texto: 'Granizo fino' },
  80: { tipo: 'lluvia', texto: 'Chubascos ligeros' },
  81: { tipo: 'lluvia', texto: 'Chubascos' },
  82: { tipo: 'lluvia', texto: 'Chubascos intensos' },
  85: { tipo: 'nieve', texto: 'Chubascos de nieve' },
  86: { tipo: 'nieve', texto: 'Chubascos de nieve intensos' },
  95: { tipo: 'tormenta', texto: 'Tormenta' },
  96: { tipo: 'tormenta', texto: 'Tormenta con granizo' },
  99: { tipo: 'tormenta', texto: 'Tormenta con granizo intenso' },
};

function obtenerIcono(codigoClima, esDeDia) {
  const info = CODIGOS_DE_CLIMA[codigoClima] || { tipo: 'nublado', texto: 'Sin datos' };

  if (info.tipo === 'despejado') {
    return { id: esDeDia ? 'icono-sol' : 'icono-luna', texto: info.texto };
  }

  const idsPorTipo = {
    nublado: 'icono-nube',
    niebla: 'icono-niebla',
    lluvia: 'icono-lluvia',
    nieve: 'icono-nieve',
    tormenta: 'icono-tormenta',
  };

  return { id: idsPorTipo[info.tipo] || 'icono-nube', texto: info.texto };
}


function obtenerClaseDeTema(codigoClima, esDeDia) {
  const info = CODIGOS_DE_CLIMA[codigoClima] || { tipo: 'nublado' };

  if (info.tipo === 'despejado') return esDeDia ? 'tema-despejado-dia' : 'tema-despejado-noche';

  const clasesPorTipo = {
    nublado: 'tema-nublado',
    niebla: 'tema-niebla',
    lluvia: 'tema-lluvia',
    nieve: 'tema-nieve',
    tormenta: 'tema-tormenta',
  };

  return clasesPorTipo[info.tipo] || 'tema-nublado';
}

async function obtenerClimaActual(latitud, longitud, nombreLugar) {
  mostrarMensajeDeEstado('Consultando el clima…');

  
  const parametros = new URLSearchParams({
    latitude: latitud,
    longitude: longitud,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,is_day',
    hourly: 'temperature_2m,weather_code,precipitation_probability,is_day,visibility',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });

  try {
    const respuesta = await fetch(`https://api.open-meteo.com/v1/forecast?${parametros}`);

    if (!respuesta.ok) {
      throw new Error('Open-Meteo respondió con un error');
    }

    const datos = await respuesta.json();

    ultimosDatosDelClima = datos;
    ultimoNombreDeLugar = nombreLugar;

    pintarTodaLaInterfaz(datos, nombreLugar);
  } catch (error) {
  
    mostrarMensajeDeEstado(
      'No pudimos obtener el clima para esta ubicación. ' +
      '<button class="boton-reintentar" id="boton-reintentar">Reintentar</button>'
    );

    const boton = document.getElementById('boton-reintentar');
    if (boton) {
      boton.addEventListener('click', () => obtenerClimaActual(latitud, longitud, nombreLugar));
    }
  }
}

function pintarTodaLaInterfaz(datos, nombreLugar) {
  pintarTarjetaPrincipal(datos, nombreLugar);
  pintarPronosticoPorHoras(datos);
  pintarPronosticoPorDias(datos);
  pintarDetallesAdicionales(datos);
  limpiarMensajeDeEstado();
}

function pintarTarjetaPrincipal(datos, nombreLugar) {
  const actual = datos.current;
  const esDeDia = actual.is_day === 1;
  const icono = obtenerIcono(actual.weather_code, esDeDia);
  const claseDeTema = obtenerClaseDeTema(actual.weather_code, esDeDia);

  
  const tarjeta = document.getElementById('tarjeta-principal');
  tarjeta.className = 'tarjeta-principal ' + claseDeTema;

  document.getElementById('texto-lugar').textContent = nombreLugar;

  const temperatura = Utilidades.formatearTemperatura(actual.temperature_2m, unidadElegida);
  document.getElementById('temperatura-actual').textContent = `${temperatura}°`;

  document.getElementById('estado-del-cielo').innerHTML =
    `<svg class="icono" width="20" height="20"><use href="#${icono.id}"/></svg> ${icono.texto}`;

  const sensacion = Utilidades.formatearTemperatura(actual.apparent_temperature, unidadElegida);
  const maxima = Utilidades.formatearTemperatura(datos.daily.temperature_2m_max[0], unidadElegida);
  const minima = Utilidades.formatearTemperatura(datos.daily.temperature_2m_min[0], unidadElegida);

  document.getElementById('linea-secundaria').innerHTML =
    `Sensación térmica ${sensacion}° · Máx ${maxima}° / Mín ${minima}°`;

  requestAnimationFrame(() => tarjeta.classList.add('lista'));

  actualizarBotonDeUnidad();
}

function pintarPronosticoPorHoras(datos) {
  const contenedor = document.getElementById('lista-horas');
  contenedor.innerHTML = '';

  const horas = datos.hourly.time;
  const ahora = new Date();

  
  let indiceDeInicio = 0;
  for (let i = 0; i < horas.length; i++) {
    if (new Date(horas[i]) >= ahora) {
      indiceDeInicio = i;
      break;
    }
  }

  const cantidadAMostrar = 24;

  for (let i = indiceDeInicio; i < indiceDeInicio + cantidadAMostrar && i < horas.length; i++) {
    const esDeDia = datos.hourly.is_day[i] === 1;
    const icono = obtenerIcono(datos.hourly.weather_code[i], esDeDia);
    const temperatura = Utilidades.formatearTemperatura(datos.hourly.temperature_2m[i], unidadElegida);
    const probabilidadDeLluvia = datos.hourly.precipitation_probability[i];

    const chip = Utilidades.crearElemento('div', 'chip-hora', `
      <span class="chip-hora-etiqueta">${Utilidades.formatearHora(horas[i], i === indiceDeInicio)}</span>
      <svg class="icono" width="24" height="24"><use href="#${icono.id}"/></svg>
      <span class="chip-hora-temperatura">${temperatura}°</span>
      <span class="chip-hora-lluvia">${probabilidadDeLluvia > 10 ? probabilidadDeLluvia + '%' : ''}</span>
    `);

    contenedor.appendChild(chip);
  }

  document.getElementById('seccion-horas').hidden = false;
}

function pintarPronosticoPorDias(datos) {
  const contenedor = document.getElementById('lista-dias');
  contenedor.innerHTML = '';

  const dias = datos.daily.time;

  for (let i = 0; i < dias.length; i++) {
    const icono = obtenerIcono(datos.daily.weather_code[i], true);
    const nombre = Utilidades.nombreDelDia(dias[i], i);
    const maxima = Utilidades.formatearTemperatura(datos.daily.temperature_2m_max[i], unidadElegida);
    const minima = Utilidades.formatearTemperatura(datos.daily.temperature_2m_min[i], unidadElegida);
    const probabilidadDeLluvia = datos.daily.precipitation_probability_max[i];

    const tarjetaDelDia = Utilidades.crearElemento('div', 'tarjeta-dia', `
      <span class="dia-nombre">${nombre}</span>
      <svg class="icono" width="22" height="22"><use href="#${icono.id}"/></svg>
      <span class="dia-lluvia">${probabilidadDeLluvia > 10 ? probabilidadDeLluvia + '%' : ''}</span>
      <span class="dia-temperaturas">
        <span class="dia-maxima">${maxima}°</span>
        <span class="dia-minima">${minima}°</span>
      </span>
    `);

    contenedor.appendChild(tarjetaDelDia);
  }

  document.getElementById('seccion-dias').hidden = false;
}

function pintarDetallesAdicionales(datos) {
  const actual = datos.current;

  
  const horas = datos.hourly.time;
  const ahora = new Date();
  let indiceDeLaHoraActual = 0;
  for (let i = 0; i < horas.length; i++) {
    if (new Date(horas[i]) >= ahora) {
      indiceDeLaHoraActual = i;
      break;
    }
  }
  const visibilidadEnKm = Utilidades.metrosAKilometros(datos.hourly.visibility[indiceDeLaHoraActual]);

  const detalles = [
    { icono: 'icono-gota', etiqueta: 'Humedad', valor: `${Utilidades.redondear(actual.relative_humidity_2m)}%` },
    { icono: 'icono-viento', etiqueta: 'Viento', valor: `${Utilidades.redondear(actual.wind_speed_10m)} km/h` },
    { icono: 'icono-presion', etiqueta: 'Presión', valor: `${Utilidades.redondear(actual.surface_pressure)} hPa` },
    { icono: 'icono-ojo', etiqueta: 'Visibilidad', valor: `${visibilidadEnKm} km` },
  ];

  const contenedor = document.getElementById('grilla-detalles');
  contenedor.innerHTML = '';

  detalles.forEach((detalle) => {
    const tarjeta = Utilidades.crearElemento('div', 'tarjeta-detalle', `
      <svg class="icono" width="20" height="20"><use href="#${detalle.icono}"/></svg>
      <span class="detalle-etiqueta">${detalle.etiqueta}</span>
      <span class="detalle-valor">${detalle.valor}</span>
    `);
    contenedor.appendChild(tarjeta);
  });

  document.getElementById('seccion-detalles').hidden = false;
}

function actualizarBotonDeUnidad() {
  const boton = document.getElementById('boton-unidad');
  boton.textContent = unidadElegida === 'c' ? '°F' : '°C';
}

function alternarUnidadDeTemperatura() {
  unidadElegida = unidadElegida === 'c' ? 'f' : 'c';
  
  if (ultimosDatosDelClima) {
    pintarTodaLaInterfaz(ultimosDatosDelClima, ultimoNombreDeLugar);
  }
}

function mostrarMensajeDeEstado(mensajeHTML) {
  document.getElementById('mensaje-de-estado').innerHTML = mensajeHTML;
  document.getElementById('mensaje-de-estado').hidden = false;
}

function limpiarMensajeDeEstado() {
  document.getElementById('mensaje-de-estado').hidden = true;
  document.getElementById('mensaje-de-estado').innerHTML = '';
}

// --- arranque de la app y conexin con la ubicación ---

function iniciarBusquedaDeUbicacion() {
  mostrarMensajeDeEstado('Ubicando…');

  Ubicacion.obtenerPorGPS(
    async (coordenadas) => {
      const lugar = await Ubicacion.obtenerNombreDeLugar(coordenadas.latitud, coordenadas.longitud);
      obtenerClimaActual(coordenadas.latitud, coordenadas.longitud, lugar);
    },
    async () => {
      
      mostrarMensajeDeEstado('No pudimos usar el GPS. Buscando tu zona aproximada…');

      try {
        const datosPorIP = await Ubicacion.obtenerPorIP();
        obtenerClimaActual(datosPorIP.latitud, datosPorIP.longitud, datosPorIP.nombreLugar);
      } catch (error) {
        mostrarMensajeDeEstado(
          'No pudimos detectar tu ubicación automáticamente. Escribí tu ciudad en el buscador de arriba.'
        );
      }
    }
  );
}

function configurarBuscadorDeCiudades() {
  const campoDeTexto = document.getElementById('campo-busqueda');
  const listaDeSugerencias = document.getElementById('lista-sugerencias');

  function ocultarSugerencias() {
    listaDeSugerencias.classList.remove('abierta');
    listaDeSugerencias.innerHTML = '';
  }

  async function buscarYMostrarSugerencias(consulta) {
    if (consulta.trim().length < 2) {
      ocultarSugerencias();
      return;
    }

    try {
      const resultados = await Ubicacion.buscarCiudad(consulta);
      listaDeSugerencias.innerHTML = '';

      if (resultados.length === 0) {
        listaDeSugerencias.innerHTML = '<div class="sugerencia-vacia">No encontramos esa ciudad</div>';
        listaDeSugerencias.classList.add('abierta');
        return;
      }

      resultados.forEach((resultado) => {
        const partesDelNombre = [resultado.name, resultado.admin1, resultado.country].filter(Boolean);
        const boton = Utilidades.crearElemento('button', 'sugerencia', partesDelNombre.join(', '));

        boton.addEventListener('click', () => {
          ocultarSugerencias();
          campoDeTexto.value = partesDelNombre.join(', ');

          const nombreCorto = [resultado.name, resultado.country].filter(Boolean).join(', ');
          obtenerClimaActual(resultado.latitude, resultado.longitude, nombreCorto);
        });

        listaDeSugerencias.appendChild(boton);
      });

      listaDeSugerencias.classList.add('abierta');
    } catch (error) {
      ocultarSugerencias();
    }
  }

  const buscarConEspera = Utilidades.esperarQueTermineDeEscribir(buscarYMostrarSugerencias, 350);

  campoDeTexto.addEventListener('input', (evento) => buscarConEspera(evento.target.value));

  campoDeTexto.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') ocultarSugerencias();
  });

  document.addEventListener('click', (evento) => {
    const clickFueraDelBuscador = !listaDeSugerencias.contains(evento.target) && evento.target !== campoDeTexto;
    if (clickFueraDelBuscador) ocultarSugerencias();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  configurarBuscadorDeCiudades();

  document.getElementById('boton-ubicarme').addEventListener('click', iniciarBusquedaDeUbicacion);
  document.getElementById('boton-unidad').addEventListener('click', alternarUnidadDeTemperatura);

  iniciarBusquedaDeUbicacion();
});

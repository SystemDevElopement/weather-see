// ubicacion.js
// Todo lo relacionado a "dónde está el usuario" vive acá, separado de la lógica del clima.
// Hay tres niveles, de más preciso a más básico:
//   1. GPS del navegador (con permiso del usuario)
//   2. Ubicación aproximada por IP (si el usuario no da permiso o falla el GPS)
//   3. Que el propio usuario escriba su ciudad (si los dos anteriores fallan)

const Ubicacion = {

  // Intenta el GPS del navegador primero. Si el usuario lo rechaza o el navegador
  // no lo soporta, avisamos con onError para que quien nos llama decida el siguiente paso.
  obtenerPorGPS(onExito, onError) {
    if (!navigator.geolocation) {
      onError('El navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        onExito({
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude,
        });
      },
      (error) => {
        // No nos importa el detalle técnico del error (permiso denegado, timeout, etc.),
        // para el usuario todos terminan en lo mismo: probar con la IP.
        onError(error.message);
      },
      {
        timeout: 8000,
        maximumAge: 10 * 60 * 1000, // una ubicación de los últimos 10 minutos nos sirve igual
      }
    );
  },

  // Si no hay GPS, un servicio de geolocalización por IP nos da algo razonable
  // (la ciudad, no la dirección exacta) sin pedir ningún permiso.
  async obtenerPorIP() {
    const respuesta = await fetch('https://ipapi.co/json/');

    if (!respuesta.ok) {
      throw new Error('El servicio de ubicación por IP no respondió bien');
    }

    const datos = await respuesta.json();

    if (!datos.latitude || !datos.longitude) {
      throw new Error('La respuesta no trajo coordenadas usables');
    }

    const lugar = [datos.city, datos.country_name].filter(Boolean).join(', ');

    return {
      latitud: datos.latitude,
      longitud: datos.longitude,
      nombreLugar: lugar || 'Tu zona',
    };
  },

  // Convierte coordenadas en un nombre legible ("Rosario, Argentina"). Es un servicio
  // aparte de Open-Meteo porque Open-Meteo no hace geocodificación inversa.
  async obtenerNombreDeLugar(latitud, longitud) {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitud}&longitude=${longitud}&localityLanguage=es`;
      const respuesta = await fetch(url);

      if (!respuesta.ok) throw new Error('reverse geocode falló');

      const datos = await respuesta.json();
      const ciudad = datos.city || datos.locality || datos.principalSubdivision;

      if (ciudad && datos.countryName) return `${ciudad}, ${datos.countryName}`;
      if (datos.countryName) return datos.countryName;

      return 'Tu ubicación';
    } catch (error) {
      // Si esto falla no es grave, el clima igual se puede mostrar sin el nombre exacto.
      return 'Tu ubicación';
    }
  },

  // Búsqueda manual de ciudad para cuando el usuario escribe algo en el buscador,
  // o cuando ninguno de los métodos automáticos funcionó.
  async buscarCiudad(consulta) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(consulta)}&count=5&language=es&format=json`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error('La búsqueda de ciudades no respondió bien');
    }

    const datos = await respuesta.json();
    return datos.results || [];
  },

};

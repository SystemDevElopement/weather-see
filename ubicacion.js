
const Ubicacion = {

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
  
      return 'Tu ubicación';
    }
  },


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

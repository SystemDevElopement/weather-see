# Clima local

Una app de clima con detección automática de ubicación, sin backend, sin build tools
y sin ninguna API key. Interfaz inspirada en la app de Clima de Samsung: tarjeta
principal con degradado según el estado del cielo, pronóstico por horas con scroll
horizontal, y pronóstico por días.

## Cómo correrla

No hace falta instalar nada. Alcanza con abrir `index.html` directamente en el
navegador, haciendo doble click sobre el archivo.

Si tu navegador te pide permiso de ubicación y no aparece el diálogo (algunos
navegadores son más estrictos con `file://`), podés levantar un servidor local
simple desde la carpeta del proyecto:

```
python3 -m http.server 8000
```

y entrar a `http://localhost:8000` — no cambia nada del comportamiento, es solo
para que el navegador esté más cómodo pidiendo el permiso de geolocalización.

## Estructura

```
mi-app-clima/
├── index.html          → estructura y semántica, además de los íconos SVG
├── css/estilos.css      → toda la apariencia
├── js/utilidades.js     → helpers genéricos (fechas, grados, DOM)
├── js/ubicacion.js      → GPS del navegador, fallback por IP, búsqueda de ciudad
├── js/clima.js          → pide los datos a Open-Meteo y arma la interfaz
└── README.md
```

Se cargan como scripts clásicos (sin `type="module"`), a propósito: los módulos
de JS no funcionan bien abriendo un archivo directo con `file://` en varios
navegadores por las reglas de CORS. Con scripts normales, en orden, alcanza.

## De dónde salen los datos

- **Clima:** [Open-Meteo](https://open-meteo.com/) — pública, gratuita, sin
  registro ni API key. Se pide clima actual, próximas 24 horas y próximos 7 días
  en una sola llamada.
- **Ubicación:** primero se intenta con la API de geolocalización del navegador.
  Si el usuario no da permiso, se cae a una ubicación aproximada por IP
  ([ipapi.co](https://ipapi.co/)). Si eso también falla, queda el buscador manual
  de ciudad (geocodificador de Open-Meteo).
- **Nombre del lugar:** cuando tenemos coordenadas pero no un nombre (GPS o IP),
  se resuelve con la geocodificación inversa de
  [BigDataCloud](https://www.bigdatacloud.com/), que tampoco pide clave.

## Decisiones de diseño

- **Por qué separar en archivos:** `utilidades.js` no sabe nada de clima ni de
  ubicación — son funciones que cualquier otra parte de la app podría reusar.
  `ubicacion.js` no sabe nada de Open-Meteo. `clima.js` es el único que conecta
  todo. Esa separación hace que, si mañana hay que cambiar el proveedor de clima,
  alcance con tocar un solo archivo.
- **Por qué sin frameworks:** el proyecto es chico y no lo justifica. Manipular
  el DOM a mano acá es más simple que meter una capa de build.
- **Los degradados por clima** son la parte más "Samsung" de la interfaz: cada
  código de clima de Open-Meteo se agrupa en un tipo (despejado, nublado, niebla,
  lluvia, nieve, tormenta) y cada tipo tiene su propio degradado y su ícono.

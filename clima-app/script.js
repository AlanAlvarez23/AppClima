const apiKey = "d37435632f1686e7cddfb85a38884cf3"; // ← Reemplaza con tu API Key real

async function getWeather(city = null, lat = null, lon = null) {
  let currentUrl = "";
  let forecastUrl = "";

  if (city) {
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${apiKey}`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=es&appid=${apiKey}`;
  } else if (lat && lon) {
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
  } else {
    document.getElementById("weatherResult").innerHTML = "<p>⚠️ Ingresa una ciudad válida.</p>";
    return;
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    if (!currentRes.ok || !forecastRes.ok) throw new Error("Error al obtener datos");

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    mostrarClima(currentData);
    mostrarPronostico(forecastData.list);
  } catch (error) {
    document.getElementById("weatherResult").innerHTML = "<p>❌ Error al obtener el clima.</p>";
    document.getElementById("forecastResult").innerHTML = "";
  }
}

function mostrarClima(data) {
  const windDirection = gradosAViento(data.wind.deg);
  const html = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="icono clima" />
    <p><strong>${data.weather[0].description}</strong></p>
    <p>🌡 Temperatura: ${data.main.temp} °C</p>
    <p>🤗 Sensación térmica: ${data.main.feels_like} °C</p>
    <p>💧 Humedad: ${data.main.humidity}%</p>
    <p>🌬 Viento: ${data.wind.speed} m/s (${windDirection})</p>
    <p>🧭 Presión atmosférica: ${data.main.pressure} hPa</p>
  `;
  document.getElementById("weatherResult").innerHTML = html;

  cambiarFondo(data.weather[0].main);
}

// Función auxiliar para convertir grados en dirección cardinal
function gradosAViento(grados) {
  const direcciones = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(grados / 45) % 8;
  return direcciones[index];
}

function mostrarPronostico(forecastList) {
  // Filtrar solo 1 por día (por la tarde, ej. 15:00h)
  const daily = forecastList.filter(item => item.dt_txt.includes("15:00:00"));

  const cards = daily.slice(0, 5).map(day => {
    const fecha = new Date(day.dt_txt).toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });

    return `
      <div class="forecast-card">
        <p><strong>${fecha}</strong></p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
        <p>${day.main.temp.toFixed(1)} °C</p>
        <p>${day.weather[0].description}</p>
      </div>
    `;
  }).join("");

  document.getElementById("forecastResult").innerHTML = `
    <h3>🗓 Pronóstico 5 días</h3>
    <div class="forecast-container">${cards}</div>
  `;
}

function getWeatherFromInput() {
  const city = document.getElementById("cityInput").value.trim();
  if (city) {
    getWeather(city);
  }
}

function getWeatherByCoords(lat, lon) {
  getWeather(null, lat, lon);
}

function getLocalWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        getWeatherByCoords(lat, lon);
      },
      () => {
        document.getElementById("weatherResult").innerHTML = "<p>⚠️ No se pudo obtener ubicación.</p>";
      }
    );
  }
}

function cambiarFondo(clima) {
  let fondo = "#007BFF"; // fondo azul por defecto

  switch (clima.toLowerCase()) {
    case "clear":
      fondo = "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80')";
      break;
    case "clouds":
      fondo = "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1350&q=80')";
      break;
    case "rain":
    case "drizzle":
      fondo = "url('https://images.unsplash.com/photo-1526676030023-6c8d0c45f872?auto=format&fit=crop&w=1350&q=80')";
      break;
    case "thunderstorm":
      fondo = "url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1350&q=80')";
      break;
    case "snow":
      fondo = "url('https://images.unsplash.com/photo-1606788075761-3a1f796a1819?auto=format&fit=crop&w=1350&q=80')";
      break;
    default:
      fondo = "#007BFF";
  }

  document.body.style.backgroundImage = fondo.startsWith("url") ? fondo : "none";
  document.body.style.backgroundColor = fondo.startsWith("url") ? "" : fondo;
}
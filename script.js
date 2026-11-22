
const API_KEY = "ced520cf3f6989db47171ce0edb39075";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchButton = form.querySelector("button");
const message = document.getElementById("message");
const result = document.getElementById("weatherResult");

const localities = {
  "miyapur": { lat: 17.4968, lon: 78.3570 },
  "lingampally": { lat: 17.4930, lon: 78.3190 }
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showMessage("Please enter a city name.");
    return;
  }

  if (API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE") {
    showMessage("Please add your API key.");
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Searching...";
  showMessage("Fetching weather information...");
  result.classList.add("hidden");

  try {
    const searchName = city.toLowerCase();

    let location;

    if (localities[searchName]) {
      location = localities[searchName];
    } else {
      const geoResponse = await fetch(
        `${GEO_URL}?q=${encodeURIComponent(city + ",IN")}&limit=1&appid=${API_KEY}`
      );

      const locations = await geoResponse.json();

      if (!geoResponse.ok) {
        throw new Error(locations.message || "Location search failed.");
      }

      if (locations.length === 0) {
        throw new Error("City not found. Check the spelling and try again.");
      }

      location = {
        lat: locations[0].lat,
        lon: locations[0].lon
      };
    }

    const response = await fetch(
      `${API_URL}?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch weather information.");
    }

    document.getElementById("cityName").textContent =
      `${data.name}, ${data.sys.country}`;

    document.getElementById("temperature").textContent =
      `${Math.round(data.main.temp)}°C`;

    document.getElementById("condition").textContent =
      data.weather[0].description;

    document.getElementById("humidity").textContent =
      `${data.main.humidity}%`;

    document.getElementById("feelsLike").textContent =
      `${Math.round(data.main.feels_like)}°C`;

    document.getElementById("windSpeed").textContent =
      `${data.wind.speed} m/s`;

    const icon = document.getElementById("weatherIcon");

    icon.src =
      `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    icon.alt = data.weather[0].description;

    result.classList.remove("hidden");
    showMessage("Weather information updated successfully.");

  } catch (error) {
    showMessage(error.message);
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});

function showMessage(text) {
  message.textContent = text;
}

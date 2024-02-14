import React, { useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

function App() {
  const [location, setLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState({});
  const [countryCode, setCountryCode] = useState("");
  const [name, setName] = useState("");

  const fetchWeather = async () => {
    if (location.length <= 2) return setWeather({});
    setIsLoading(true);
    setWeather("");
    try {
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`
      );
      console.log(geoRes);
      const geoData = await geoRes.json();
      console.log(geoData);

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();

      setWeather(weatherData.daily);
      setCountryCode(country_code);
      setName(name);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLocation(localStorage.getItem("location") || "");
  }, []);

  useEffect(() => {
    fetchWeather();
    localStorage.setItem("location", location);
  }, [location]);

  const updateLocation = (e) => {
    setLocation(e.target.value);
  };
  return (
    <div className="app">
      <h1>Classy Weather</h1>
      <Input location={location} onChangeLocation={updateLocation} />

      {isLoading && <span className="loader">...Loading</span>}

      {weather.weathercode && (
        <Weather weather={weather} name={name} countryCode={countryCode} />
      )}
    </div>
  );
}

export default App;

function Input({ location, onChangeLocation }) {
  return (
    <input
      type="text"
      placeholder="input location..."
      value={location}
      onChange={onChangeLocation}
    ></input>
  );
}

function Weather({ weather, name, countryCode }) {
  const { temperature_2m_max, temperature_2m_min, time, weathercode } = weather;
  return (
    <>
      <h2>
        Weather for {name}
        {convertToFlag(countryCode)}
      </h2>
      <ul className="weather">
        {time &&
          time.map((day, index) => (
            <div className="day" key={index}>
              <Day
                temperatureMax={temperature_2m_max[index]}
                temperatureMin={temperature_2m_min[index]}
                weathercode={weathercode[index]}
                day={day}
                isToday={index === 0}
              />
            </div>
          ))}
      </ul>
    </>
  );
}

function Day({ temperatureMax, temperatureMin, weathercode, day, isToday }) {
  return (
    <li className="day">
      <span>{getWeatherIcon(weathercode)}</span>
      <p>{isToday ? "Today" : formatDay(day)}</p>
      <p>
        {Math.round(temperatureMin)}°-
        <strong>{Math.round(temperatureMax)}°</strong>
      </p>
    </li>
  );
}

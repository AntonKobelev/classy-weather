import React from "react";

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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      location: "lisbon",
      isLoading: false,
      weather: "",
      countryCode: "",
      name: "",
    };
    this.fetchWeather = this.fetchWeather.bind(this);
  }

  async fetchWeather() {
    this.setState({ isLoading: true, weather: "" });
    try {
      // 1) Getting location (geocoding)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${this.state.location}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results) throw new Error("Location not found");

      const { latitude, longitude, timezone, name, country_code } =
        geoData.results.at(0);

      // 2) Getting actual weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
      );
      const weatherData = await weatherRes.json();
      this.setState({
        weather: weatherData.daily,
        countryCode: country_code,
        name: name,
      });
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <div className="app">
        <h1>Classy Weather</h1>
        <input
          type="text"
          placeholder="input location..."
          value={this.state.location}
          onChange={(e) => this.setState({ location: e.target.value })}
        ></input>
        <button onClick={this.fetchWeather}>Get Weather</button>

        {this.state.isLoading && <span className="loader">...Loading</span>}

        {this.state.weather.weathercode && (
          <Weather
            weather={this.state.weather}
            name={this.state.name}
            countryCode={this.state.countryCode}
          />
        )}
      </div>
    );
  }
}

export default App;

class Weather extends React.Component {
  render() {
    const { weather, name, countryCode } = this.props;
    const { temperature_2m_max, temperature_2m_min, time, weathercode } =
      this.props.weather;

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
}

class Day extends React.Component {
  render() {
    const { temperatureMax, temperatureMin, weathercode, day, isToday } =
      this.props;
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
}

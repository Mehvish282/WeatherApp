export class WeatherApp {
  constructor() {
    this.apiKey = 'e84a3372a8c880353eb23d6026fe7edb'
    this.baseUrl = 'https://api.openweathermap.org/data/2.5'
    this.currentWeather = null
    this.forecast = null
  }

  init() {
    this.createUI()
    this.bindEvents()
    this.getUserLocation()
  }

  createUI() {
    const app = document.getElementById('app')
    app.innerHTML = `
      <div class="weather-container">
        <div class="search-section">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input type="text" id="cityInput" placeholder="Search for a city..." />
            <button id="searchBtn" class="search-btn">
              <i class="fas fa-arrow-right"></i>
            </button>
          </div>
          <button id="locationBtn" class="location-btn">
            <i class="fas fa-location-dot"></i>
            Use My Location
          </button>
        </div>

        <div id="loadingSpinner" class="loading-spinner">
          <div class="spinner"></div>
          <p>Getting weather data...</p>
        </div>

        <div id="weatherContent" class="weather-content hidden">
          <div class="current-weather">
            <div class="weather-main">
              <div class="location-info">
                <h1 id="cityName">City Name</h1>
                <p id="currentDate">Date</p>
              </div>
              <div class="weather-icon-container">
                <img id="weatherIcon" src="" alt="Weather Icon" />
              </div>
            </div>
            
            <div class="temperature-section">
              <div class="main-temp">
                <span id="temperature">--</span>
                <span class="temp-unit">°C</span>
              </div>
              <div class="weather-description">
                <p id="weatherDescription">Description</p>
                <p id="feelsLike">Feels like --°C</p>
              </div>
            </div>

            <div class="weather-details">
              <div class="detail-item">
                <i class="fas fa-eye"></i>
                <div>
                  <span class="detail-label">Visibility</span>
                  <span id="visibility" class="detail-value">-- km</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-droplet"></i>
                <div>
                  <span class="detail-label">Humidity</span>
                  <span id="humidity" class="detail-value">--%</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-wind"></i>
                <div>
                  <span class="detail-label">Wind Speed</span>
                  <span id="windSpeed" class="detail-value">-- km/h</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-gauge"></i>
                <div>
                  <span class="detail-label">Pressure</span>
                  <span id="pressure" class="detail-value">-- hPa</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-sun"></i>
                <div>
                  <span class="detail-label">UV Index</span>
                  <span id="uvIndex" class="detail-value">--</span>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-temperature-high"></i>
                <div>
                  <span class="detail-label">Max Temp</span>
                  <span id="maxTemp" class="detail-value">--°C</span>
                </div>
              </div>
            </div>
          </div>

          <div class="forecast-section">
            <h2>5-Day Forecast</h2>
            <div id="forecastContainer" class="forecast-container">
              <!-- Forecast items will be inserted here -->
            </div>
          </div>
        </div>

        <div id="errorMessage" class="error-message hidden">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Unable to fetch weather data. Please try again.</p>
        </div>
      </div>
    `
  }

  bindEvents() {
    const searchBtn = document.getElementById('searchBtn')
    const cityInput = document.getElementById('cityInput')
    const locationBtn = document.getElementById('locationBtn')

    searchBtn.addEventListener('click', () => this.searchWeather())
    cityInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchWeather()
    })
    locationBtn.addEventListener('click', () => this.getUserLocation())
  }

  async searchWeather() {
    const city = document.getElementById('cityInput').value.trim()
    if (!city) return

    this.showLoading()
    try {
      await this.getWeatherByCity(city)
    } catch (error) {
      this.showError()
    }
  }

  async getUserLocation() {
    if (!navigator.geolocation) {
      this.showError('Geolocation is not supported by this browser.')
      return
    }

    this.showLoading()
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          await this.getWeatherByCoords(latitude, longitude)
        } catch (error) {
          this.showError()
        }
      },
      () => {
        this.showError('Unable to retrieve your location.')
      }
    )
  }

  async getWeatherByCity(city) {
    const [currentWeather, forecast] = await Promise.all([
      this.fetchWeatherData(`${this.baseUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`),
      this.fetchWeatherData(`${this.baseUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`)
    ])

    this.currentWeather = currentWeather
    this.forecast = forecast
    this.displayWeather()
  }

  async getWeatherByCoords(lat, lon) {
    const [currentWeather, forecast] = await Promise.all([
      this.fetchWeatherData(`${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`),
      this.fetchWeatherData(`${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`)
    ])

    this.currentWeather = currentWeather
    this.forecast = forecast
    this.displayWeather()
  }

  async fetchWeatherData(url) {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  }

  displayWeather() {
    this.hideLoading()
    this.hideError()
    
    const weatherContent = document.getElementById('weatherContent')
    weatherContent.classList.remove('hidden')

    // Update current weather
    document.getElementById('cityName').textContent = `${this.currentWeather.name}, ${this.currentWeather.sys.country}`
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    document.getElementById('temperature').textContent = Math.round(this.currentWeather.main.temp)
    document.getElementById('weatherDescription').textContent = this.currentWeather.weather[0].description
    document.getElementById('feelsLike').textContent = `Feels like ${Math.round(this.currentWeather.main.feels_like)}°C`
    
    const iconCode = this.currentWeather.weather[0].icon
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`
    
    // Update weather details with more accurate data
    document.getElementById('visibility').textContent = `${(this.currentWeather.visibility / 1000).toFixed(1)} km`
    document.getElementById('humidity').textContent = `${this.currentWeather.main.humidity}%`
    document.getElementById('windSpeed').textContent = `${(this.currentWeather.wind.speed * 3.6).toFixed(1)} km/h`
    document.getElementById('pressure').textContent = `${this.currentWeather.main.pressure} hPa`
    document.getElementById('maxTemp').textContent = `${Math.round(this.currentWeather.main.temp_max)}°C`
    
    // Get UV Index from additional API call
    this.getUVIndex(this.currentWeather.coord.lat, this.currentWeather.coord.lon)

    // Update forecast with more accurate processing
    this.displayForecast()
    
    // Update background based on weather
    this.updateBackground()
  }

  async getUVIndex(lat, lon) {
    try {
      const uvData = await this.fetchWeatherData(`${this.baseUrl}/uvi?lat=${lat}&lon=${lon}&appid=${this.apiKey}`)
      document.getElementById('uvIndex').textContent = Math.round(uvData.value)
    } catch (error) {
      document.getElementById('uvIndex').textContent = 'N/A'
    }
  }

  displayForecast() {
    const forecastContainer = document.getElementById('forecastContainer')
    const dailyForecasts = this.processForecastData()
    
    forecastContainer.innerHTML = dailyForecasts.map(day => `
      <div class="forecast-item">
        <div class="forecast-day">${day.day}</div>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" class="forecast-icon">
        <div class="forecast-temps">
          <span class="forecast-high">${day.high}°</span>
          <span class="forecast-low">${day.low}°</span>
        </div>
        <div class="forecast-desc">${day.description}</div>
      </div>
    `).join('')
  }

  processForecastData() {
    const dailyData = {}
    const today = new Date().toDateString()
    
    // Group forecast data by day, excluding today
    this.forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000)
      const dateString = date.toDateString()
      
      // Skip today's data to show only future days
      if (dateString === today) return
      
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      
      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          day: dayKey,
          temps: [],
          icons: [],
          descriptions: [],
          date: date
        }
      }
      
      dailyData[dayKey].temps.push(item.main.temp)
      dailyData[dayKey].icons.push(item.weather[0].icon)
      dailyData[dayKey].descriptions.push(item.weather[0].main)
    })
    
    // Convert to array and get most common icon/description for each day
    return Object.values(dailyData)
      .sort((a, b) => a.date - b.date)
      .slice(0, 5)
      .map(day => {
        // Get the most common icon (usually midday icon)
        const iconCounts = {}
        day.icons.forEach(icon => {
          iconCounts[icon] = (iconCounts[icon] || 0) + 1
        })
        const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) => 
          iconCounts[a] > iconCounts[b] ? a : b
        )
        
        // Get the most common description
        const descCounts = {}
        day.descriptions.forEach(desc => {
          descCounts[desc] = (descCounts[desc] || 0) + 1
        })
        const mostCommonDesc = Object.keys(descCounts).reduce((a, b) => 
          descCounts[a] > descCounts[b] ? a : b
        )
        
        return {
          day: day.day,
          high: Math.round(Math.max(...day.temps)),
          low: Math.round(Math.min(...day.temps)),
          icon: mostCommonIcon,
          description: mostCommonDesc
        }
      })
  }

  updateBackground() {
    const weatherMain = this.currentWeather.weather[0].main.toLowerCase()
    const body = document.body
    
    // Remove existing weather classes
    body.className = body.className.replace(/weather-\w+/g, '')
    
    // Add new weather class
    body.classList.add(`weather-${weatherMain}`)
  }

  showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden')
    document.getElementById('weatherContent').classList.add('hidden')
    document.getElementById('errorMessage').classList.add('hidden')
  }

  hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden')
  }

  showError(message = 'Unable to fetch weather data. Please try again.') {
    document.getElementById('errorMessage').classList.remove('hidden')
    document.getElementById('errorMessage').querySelector('p').textContent = message
    document.getElementById('weatherContent').classList.add('hidden')
    this.hideLoading()
  }

  hideError() {
    document.getElementById('errorMessage').classList.add('hidden')
  }
}
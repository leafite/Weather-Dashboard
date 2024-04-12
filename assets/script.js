document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '698e5aca93eee5454cc5fbbd53e632d8';

    function handleSearch(cityName) {
        const locationApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

        fetch(locationApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error('Invalid response format or no results found');
                }
                const location = data[0];
                if (!location.lat || !location.lon) {
                    throw new Error('Latitude or longitude not found in response');
                }
                const lat = location.lat;
                const lon = location.lon;
                const weatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

                return fetch(weatherApiUrl);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {

                document.getElementById('cityName').textContent = data.city.name;
                document.getElementById('date').textContent = new Date().toLocaleDateString();
                document.getElementById('temp').textContent = `${((data.list[0].main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F`;
                document.getElementById('windspeed').textContent = `${data.list[0].wind.speed} m/s`;
                document.getElementById('humidity').textContent = `${data.list[0].main.humidity}%`;
            
                const forecastContainer = document.getElementById('forecastRow');
                forecastContainer.innerHTML = '';
            

                for (let i = 1; i <= 5; i++) {
                    if (data.list[i * 8 - 1] && data.list[i * 8 - 1].dt) { 
                        const forecastItem = document.createElement('div');
                        forecastItem.classList.add('col');
            
                        const forecastDate = new Date(data.list[i * 8 - 1].dt * 1000).toLocaleDateString(); 
                        const forecastTemp = `${((data.list[i * 8 - 1].main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F`;
                        const forecastWindSpeed = `${data.list[i * 8 - 1].wind.speed} m/s`;
                        const forecastHumidity = `${data.list[i * 8 - 1].main.humidity}%`;

                        const weatherEmoji = getWeatherEmoji(data.list[i * 8 - 1].weather[0].main);
            
                        forecastItem.innerHTML = `
                            <div class="card weatherForecast-item me-5">
                                <div class="card-body">
                                    <h5 class="card-title">${forecastDate}</h5>
                                    <p class="card-text">Temperature: ${forecastTemp} ${weatherEmoji}</p>
                                    <p class="card-text">Wind Speed: ${forecastWindSpeed}</p>
                                    <p class="card-text">Humidity: ${forecastHumidity}</p>
                                </div>
                            </div>`;
                        forecastContainer.appendChild(forecastItem);
                    }
                }

                const searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];
                searchedCities.unshift(cityName); 
                localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
                renderSearchedCities(searchedCities);
            })
            .catch(error => {
                console.error('There was a problem with the Fetch operation:', error);
            });
    }

    function getWeatherEmoji(weatherCondition) {
        switch (weatherCondition) {
            case 'Clear':
                return '☀️';
            case 'Clouds':
                return '☁️';
            case 'Rain':
                return '🌧️';
            case 'Snow':
                return '❄️';
            case 'Thunderstorm':
                return '⛈️';
            default:
                return '';
        }
    }

    function renderSearchedCities(searchedCities) {
        const previousSearchesContainer = document.getElementById('previous-searches');
        previousSearchesContainer.innerHTML = '';

        const uniqueCities = new Set();
        for (let i = searchedCities.length - 1; i >= 0; i--) {
            const city = searchedCities[i];
            if (!uniqueCities.has(city)) {
                const button = document.createElement('button');
                button.textContent = city;
                button.classList.add('btn', 'btn-outline-secondary', 'me-2');
                button.addEventListener('click', () => {
                    handleSearch(city);
                });
                previousSearchesContainer.appendChild(button);

                uniqueCities.add(city);
            }
        }
    }

    document.getElementById('search-button').addEventListener('click', function() {
        const cityName = document.querySelector('.city-input').value;
        handleSearch(cityName);
    });

    const searchedCities = JSON.parse(localStorage.getItem('searchedCities')) || [];
    renderSearchedCities(searchedCities);
});

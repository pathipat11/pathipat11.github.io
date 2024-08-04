const apiKey = '6a4b064b404444b59455106cfccc89b3';
const debounceDelay = 300;
let debounceTimeout;

async function showSuggestions(value) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';

    if (value.length > 0) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/find?q=${value}&type=like&sort=population&cnt=5&appid=${apiKey}`;
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data.list.length === 0) {
                    suggestions.innerHTML = '<div>No suggestions found</div>';
                } else {
                    data.list.forEach(city => {
                        const div = document.createElement('div');
                        div.innerText = city.name;
                        div.onclick = () => selectCity(city.name);
                        suggestions.appendChild(div);
                    });
                }
            } else {
                // showError('Error fetching city data. Please try again later.');
            }
        } catch {
            showError('Error fetching city data. Please try again later.');
        }
    }
}

function selectCity(name) {
    document.getElementById('cityInput').value = name;
    document.getElementById('suggestions').innerHTML = '';
}

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (city === '') {
        showError('Please enter a city name');
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    showLoading(true);

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            updateWeatherData(data);
            document.getElementById('error').innerText = '';
        } else {
            handleResponseError(response);
        }
    } catch {
        showError('Error fetching weather data. Please try again later.');
    } finally {
        showLoading(false);
    }
}

function handleResponseError(response) {
    if (response.status === 401) {
        showError('Unauthorized: Invalid API key');
    } else if (response.status === 404) {
        showError('City not found');
    } else {
        showError('Failed to fetch data');
    }
    clearWeatherData();
}

function updateWeatherData(data) {
    document.getElementById('temp').innerText = data.main.temp;
    document.getElementById('humidity').innerText = data.main.humidity;
    document.getElementById('windSpeed').innerText = data.wind.speed;
}

function showError(message) {
    document.getElementById('error').innerText = message;
}

function clearWeatherData() {
    document.getElementById('temp').innerText = '';
    document.getElementById('humidity').innerText = '';
    document.getElementById('windSpeed').innerText = '';
}

function showLoading(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
}

function debounceShowSuggestions(value) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => showSuggestions(value), debounceDelay);
}

function resetResult() {
    document.getElementById('cityInput').value = '';
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('error').innerText = '';
    clearWeatherData();
}

document.getElementById('cityInput').addEventListener('keyup', (event) => {
    debounceShowSuggestions(event.target.value);
});

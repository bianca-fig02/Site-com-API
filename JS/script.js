async function buscarClima() {
    const cidade = document.getElementById('cidade').value.trim();
    const resultadoDiv = document.getElementById('resultado');

    if (!cidade) {
        alert("Por favor, digite o nome de uma cidade.");
        return;
    }

    try {
        // Etapa 1: Obter coordenadas da cidade
        const geocodingResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name= ${encodeURIComponent(cidade)}&count=1`);
        const geocodingData = await geocodingResponse.json();

        if (!geocodingData.results || geocodingData.results.length === 0) {
            resultadoDiv.innerHTML = "Cidade não encontrada.";
            return;
        }

        const { latitude, longitude, name, country } = geocodingData.results[0];

        // Etapa 2: Buscar dados climáticos atuais
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude= ${latitude}&longitude=${longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();

        const temperature = weatherData.current_weather.temperature;
        const weatherCode = weatherData.current_weather.weathercode;

        // Mapeamento dos códigos de clima
        const weatherDescriptions = {
            0: "Ensolarado ☀️",
            1: "Parcialmente nublado ⛅",
            2: "Nublado ☁️",
            3: "Encoberto 🌥️",
            45: "Neblina 🌫️",
            48: "Neblina com orvalho 🌫️",
            51: "Chuva leve 🌦️",
            53: "Chuva moderada 🌧️",
            55: "Chuva forte 🌧️",
            61: "Chuva fraca 🌦️",
            63: "Chuva 🌧️",
            65: "Chuva forte 🌧️",
            71: "Neve fraca ❄️",
            73: "Neve ❄️",
            75: "Neve forte ❄️",
            80: "Pancadas de chuva 🌦️",
            81: "Chuva forte 🌧️",
            82: "Chuva muito forte 🌧️",
            95: "Trovoada ⚡",
            96: "Trovoada com granizo 🌩️",
            99: "Trovoada com granizo violento 🌩️"
        };

        const description = weatherDescriptions[weatherCode] || "Condição desconhecida ❓";

        // Extrair descrição e ícone corretamente
        let descricaoClima = description;
        let iconeClima = "";

        // Regex para detectar emojis no final da string
        const emojiRegex = /([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu;
        const matches = [...description.matchAll(emojiRegex)];

        if (matches.length > 0) {
            const lastEmoji = matches[matches.length - 1][0];
            const parts = description.split(lastEmoji);
            descricaoClima = parts[0].trim();
            iconeClima = lastEmoji;
        } else {
            iconeClima = "🌐"; // Ícone padrão se não tiver emoji
        }

        // Validação adicional
        if (!name || !country || isNaN(temperature)) {
            resultadoDiv.innerHTML = "Erro ao carregar informações climáticas.";
            return;
        }

        // Exibir resultado formatado
        resultadoDiv.innerHTML = `
            <span class="icone-clima">${iconeClima}</span>
            <strong>${name}, ${country}</strong>: ${temperature}°C - ${descricaoClima}
        `;
    } catch (error) {
        console.error(error);
        resultadoDiv.innerHTML = "Erro ao carregar os dados do clima.";
    }
}
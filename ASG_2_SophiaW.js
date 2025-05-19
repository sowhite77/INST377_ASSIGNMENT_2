const apiKey = "Eue1Z1vIIs_eFJd0zNFxSNuexQCBULCf";
const main = document.getElementById('main');

document.getElementById('homeLink').onclick = showHome;
document.getElementById('stocksLink').onclick = showStocks;
document.getElementById('dogsLink').onclick = showDogs;
document.getElementById('goStocks').onclick = showStocks;
document.getElementById('goDogs').onclick = showDogs;

if (!window.Chart) {
  let script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  document.head.appendChild(script);
}
function fetchRedditStocks() {
  fetch('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03')
    .then(res => res.json())
    .then(data => {
      let html = '<table><tr><th>Ticker</th><th>Comments</th><th>Sentiment</th></tr>';
      data.slice(0,5).forEach(stock => {
        let icon = stock.sentiment === 'Bullish' ? '🐂' : '🐻';
        html += `<tr>
          <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
          <td>${stock.no_of_comments}</td>
          <td>${icon}</td>
        </tr>`;
      });
      html += '</table>';
      document.getElementById('topStocks').innerHTML = html;
    });
}

function fetchStockData() {
  let ticker = document.getElementById('stockInput').value.trim().toUpperCase();
  let days = parseInt(document.getElementById('dateRange').value, 10);
  if (!ticker) { alert("Please enter a stock ticker."); return; }
  let today = new Date();
  let end = today.toISOString().split('T')[0];
  let past = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
  let start = past.toISOString().split('T')[0];
  let url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${start}/${end}?adjusted=true&sort=asc&limit=120&apiKey=${apiKey}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) { alert("No data found for this ticker."); return; }
      let labels = data.results.map(x => {
        let d = new Date(x.t);
        return `${d.getMonth()+1}/${d.getDate()}`;
      });
      let prices = data.results.map(x => x.c);
      let ctx = document.getElementById('stockChart').getContext('2d');
      if (window.stockChartObj) window.stockChartObj.destroy();
      window.stockChartObj = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: ticker, data: prices, borderColor: 'blue', fill: false }] }
      });
    })
    .catch(() => { alert("Error fetching stock data."); });
}

function loadDogCarousel() {
  fetch('https://dog.ceo/api/breeds/image/random/10')
    .then(res => res.json())
    .then(data => {
      let html = '';
      data.message.forEach(img => {
        html += `<img src="${img}" style="width:100px;height:100px;margin:5px;border-radius:10px;">`;
      });
      document.getElementById('dogCarousel').innerHTML = html;
    });
}

function loadDogBreedsDropdown() {
  fetch('https://api.thedogapi.com/v1/breeds')
    .then(res => res.json())
    .then(breeds => {
      window.allBreeds = breeds;
      let breedSelect = document.getElementById('breedSelect');
      let breedSearch = document.getElementById('breedSearch');
      breeds.forEach(breed => {
        let option = document.createElement('option');
        option.value = breed.id;
        option.text = breed.name;
        breedSelect.appendChild(option);
      });
      breedSelect.onchange = () => {
        let selectedId = parseInt(breedSelect.value, 10);
        showBreedInfo(selectedId);
      };
      breedSearch.oninput = () => {
        let filter = breedSearch.value.toLowerCase();
        for (let i = 0; i < breedSelect.options.length; i++) {
          let option = breedSelect.options[i];
          option.style.display = option.text.toLowerCase().includes(filter) ? '' : 'none';
        }
      };
    });
}

window.showBreedInfo = function(id) {
  let breed = window.allBreeds.find(b => b.id === id);
  if (!breed) { document.getElementById('breedInfo').innerHTML = ''; return; }
  document.getElementById('breedInfo').innerHTML = `
    <div style="border:1px solid #ccc;padding:10px;margin:10px 0;">
      <h3>${breed.name}</h3>
      <p><b>Description:</b> ${breed.bred_for || "N/A"}</p>
      <p><b>Life Span:</b> ${breed.life_span}</p>
      <p><b>Temperament:</b> ${breed.temperament || "N/A"}</p>
    </div>
  `;
};

function loadBreedByName(breedName) {
  if (!window.allBreeds) return;
  let lower = breedName.toLowerCase();
  let breed = window.allBreeds.find(b => b.name.toLowerCase() === lower);
  if (!breed) breed = window.allBreeds.find(b => b.name.toLowerCase().includes(lower));
  if (breed) window.showBreedInfo(breed.id);
}
function showDogs() {
  main.innerHTML = `
    <h1>Dogs Page</h1>
    <div id="dogCarousel" style="margin-bottom: 20px;"></div>
    <div>
      <label for="breedSelect">Select Dog Breed:</label>
      <input type="text" id="breedSearch" placeholder="Search breeds..." style="width: 200px; margin-left: 10px; padding: 5px;">
      <select id="breedSelect" size="5" style="width: 220px; margin-top: 10px;"></select>
    </div>
    <div id="breedInfo" style="margin-top: 20px;"></div>
    <button class="custom-btn" id="backHome">Back Home</button>
  `;
  document.getElementById('backHome').onclick = showHome;
  loadDogCarousel();
  loadDogBreedsDropdown();
}

function showStocks() {
  main.innerHTML = `
    <h1>Stocks Page</h1>
    <input type="text" id="stockInput" placeholder="Enter Stock Ticker (e.g. AAPL)">
    <select id="dateRange">
      <option value="30">30 Days</option>
      <option value="60">60 Days</option>
      <option value="90">90 Days</option>
    </select>
    <button class="custom-btn" id="fetchStock">Show Chart</button>
    <br><br>
    <canvas id="stockChart" width="400" height="200"></canvas>
    <h2>Top 5 Reddit Stocks</h2>
    <div id="topStocks"></div>
    <button class="custom-btn" id="backHome">Back Home</button>
  `;
  document.getElementById('backHome').onclick = showHome;
  document.getElementById('fetchStock').onclick = fetchStockData;
  fetchRedditStocks();
}

function showHome() {
  main.innerHTML = `
    <h1>Welcome to the Class Activities Website!</h1>
    <button class="custom-btn" id="goStocks">Stocks</button>
    <button class="custom-btn" id="goDogs">Dogs</button>
    <p id="quote"></p>
  `;
  document.getElementById('goStocks').onclick = showStocks;
  document.getElementById('goDogs').onclick = showDogs;
  loadQuote();
}

function loadQuote() {
  fetch('https://zenquotes.io/api/random')
    .then(res => res.json())
    .then(data => {
      let quoteObj = data[0];
      document.getElementById('quote').innerHTML = `"${quoteObj.q}" - ${quoteObj.a}<br>
        <span style="font-size:12px;">Inspirational quotes provided by <a href="https://zenquotes.io/" target="_blank">ZenQuotes API</a></span>`;
    })
    .catch(() => {
      document.getElementById('quote').innerText = "Could not load quote.";
    });
}
loadQuote();

document.addEventListener('DOMContentLoaded', () => {
  if (window.annyang) {
    const commands = {
      'hello': () => alert('Hello World!'),
      'change the color to *color': color => { document.body.style.background = color; },
      'navigate to *page': page => {
        let p = page.toLowerCase();
        if (p === 'home') showHome();
        if (p === 'stocks') showStocks();
        if (p === 'dogs') showDogs();
      },
      'lookup *stock': stock => {
        showStocks();
        setTimeout(() => {
          let input = document.getElementById('stockInput');
          let btn = document.getElementById('fetchStock');
          if (input && btn) {
            input.value = stock.toUpperCase();
            document.getElementById('dateRange').value = '30';
            btn.click();
          }
        }, 800);
      },
      'search stock *stock': stock => {
        showStocks();
        setTimeout(() => {
          let input = document.getElementById('stockInput');
          let btn = document.getElementById('fetchStock');
          if (input && btn) {
            input.value = stock.toUpperCase();
            document.getElementById('dateRange').value = '30';
            btn.click();
          }
        }, 800);
      },
      'load dog breed *breed': breed => {
        showDogs();
        setTimeout(() => { loadBreedByName(breed); }, 1200);
      },
      'search *breed': breed => {
        showDogs();
        setTimeout(() => { loadBreedByName(breed); }, 1200);
      }
    };
    annyang.addCommands(commands);
    setTimeout(() => {
      let audioOnBtn = document.getElementById('audioOn');
      let audioOffBtn = document.getElementById('audioOff');
      if (audioOnBtn) audioOnBtn.onclick = () => annyang.start();
      if (audioOffBtn) audioOffBtn.onclick = () => annyang.abort();
    }, 500);
    annyang.start({ autoRestart: true, continuous: false });
  }
});

let watchlist = ['BTC/USDT', 'ETH/USDT']; // Default pairs

document.addEventListener("DOMContentLoaded", () => {
    renderWatchlist();
    fetchPrices();

    // Create input and button for adding coins
    const sidebar = document.querySelector(".sidebar");

    const input = document.createElement("input");
    input.id = "coin-input";
    input.type = "text";
    input.placeholder = "Add coin (e.g. LTC/USDT)";
    sidebar.appendChild(input);

    const addBtn = document.createElement("button");
    addBtn.id = "add-coin-btn";
    addBtn.textContent = "Add Coin";
    sidebar.appendChild(addBtn);

    addBtn.addEventListener("click", () => {
        const coin = input.value.toUpperCase().trim();
        if (coin && !watchlist.includes(coin)) {
            watchlist.push(coin);
            input.value = '';
            renderWatchlist();
            fetchPrices();
        }
    });
});

function renderWatchlist() {
    const ul = document.getElementById("coin-list");
    ul.innerHTML = '';

    watchlist.forEach((coin) => {
        const li = document.createElement("li");
        li.textContent = coin;
        li.title = "Click to remove";
        li.onclick = () => {
            watchlist = watchlist.filter(c => c !== coin);
            renderWatchlist();
            fetchPrices();
        };
        ul.appendChild(li);
    });
}

async function fetchPrices() {
    const tbody = document.querySelector("#opportunity-table tbody");
    tbody.innerHTML = '';

    if (watchlist.length === 0) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "No coins in watchlist.";
        row.appendChild(td);
        tbody.appendChild(row);
        return;
    }

    try {
        const query = watchlist.join(',');
        const res = await fetch(`/api/prices?pairs=${query}`);
        const data = await res.json();

        data.forEach(item => {
            if (item.error) return;

            const row = document.createElement("tr");

            const coinCell = document.createElement("td");
            coinCell.textContent = item.pair;

            const buyFromCell = document.createElement("td");
            const sellToCell = document.createElement("td");
            const diffCell = document.createElement("td");

            const binance = item.binance;
            const kucoin = item.kucoin;

            if (binance < kucoin) {
                buyFromCell.textContent = "Binance ($" + binance + ")";
                sellToCell.textContent = "KuCoin ($" + kucoin + ")";
            } else {
                buyFromCell.textContent = "KuCoin ($" + kucoin + ")";
                sellToCell.textContent = "Binance ($" + binance + ")";
            }

            diffCell.innerHTML = `<strong style="color:${item.diff >= 0 ? 'green' : 'red'}">${item.diff}%</strong>`;

            row.appendChild(coinCell);
            row.appendChild(buyFromCell);
            row.appendChild(sellToCell);
            row.appendChild(diffCell);

            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Error fetching prices:", err);
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.textContent = "Error fetching data.";
        td.style.color = "red";
        row.appendChild(td);
        tbody.appendChild(row);
    }
}

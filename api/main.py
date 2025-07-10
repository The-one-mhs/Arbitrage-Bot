from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import ccxt.async_support as ccxt
import os

app = FastAPI()

# Paths
current_dir = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(current_dir, "app", "static")
template_path = os.path.join(current_dir, "app", "templates")

# Mount static and templates
app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=template_path)

# Homepage route
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


# API to fetch live prices from Binance and KuCoin
@app.get("/api/prices")
async def get_prices(pairs: str):
    pair_list = pairs.split(",")  # Example: BTC/USDT,ETH/USDT

    binance = ccxt.binance()
    kucoin = ccxt.kucoin()
    result = []

    try:
        for pair in pair_list:
            try:
                binance_price = await binance.fetch_ticker(pair)
                kucoin_price = await kucoin.fetch_ticker(pair)

                b_price = binance_price['last']
                k_price = kucoin_price['last']
                diff = round(((k_price - b_price) / b_price) * 100, 2)

                result.append({
                    "pair": pair,
                    "binance": round(b_price, 2),
                    "kucoin": round(k_price, 2),
                    "diff": diff
                })
            except Exception as e:
                result.append({
                    "pair": pair,
                    "error": f"Error fetching {pair}: {str(e)}"
                })
    finally:
        await binance.close()
        await kucoin.close()

    return JSONResponse(content=result)

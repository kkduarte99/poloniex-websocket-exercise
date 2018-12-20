let bitcoinTickerInfo = {};
let socket = io.connect("http://localhost:4000");

let priceOutput = document.getElementById("converted-price");
let rawOutput = document.getElementById("raw-price");

console.log("priceOutput", priceOutput);
function httpGET(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.onload = () => {
      if (request.status == 200) {
        console.log("success")
        resolve(request.response);
      } else {
        console.log("rejecting")
        reject(Error(request.statusText));
      }
    }

    request.onerror = () => {
      reject(Error("Network Error"));
    };

    request.send();
  })
};

httpGET("https://api.coinmarketcap.com/v1/ticker/bitcoin/").then(response => {
  console.log("response", response);
  socket.emit("bitcoin", {bitcoinTickerInfo: response});
}, error => {
  console.error("error: ", error);
});

//listen for events
socket.on("currentPrices", (info) => {

  if (priceOutput !== null) {
    priceOutput.innerHTML = `USD converted price: ${info["convertedPrice"]}`;
  }

  if (rawOutput !== null) {
    rawOutput.innerHTML = `Raw ETH/BTC price: ${info["rawPrice"]}`;
  }
  console.log("currentPrice: ", info);
});

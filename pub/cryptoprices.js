//initializing frontend sockets
let socket = io.connect("http://localhost:4000");

//price divs to be updated via sockets
let priceOutput = document.getElementById("converted-price");
let rawOutput = document.getElementById("raw-price");
let bitcoinTickerInfo = {};

//gets the bitcoin information over a GET request
function httpGET(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.onload = () => {
      if (request.status == 200) {
        resolve(request.response);
      } else {
        reject(Error(request.statusText));
      }
    }

    request.onerror = () => {
      reject(Error("Network Error"));
    };

    request.send();
  })
};
//getting the information then fwd'ing the info to the server
httpGET("https://api.coinmarketcap.com/v1/ticker/bitcoin/").then(response => {
  socket.emit("bitcoin", {bitcoinTickerInfo: response});
}, error => {
  console.error("error: ", error);
});

//listen for events
socket.on("currentPrices", (info) => {

  if (priceOutput !== null) {
    //outputs the converted USD price
    priceOutput.innerHTML = `USD converted price: ${info["convertedPrice"]}`;
  }

  if (rawOutput !== null) {
    //outputs the raw price
    rawOutput.innerHTML = `Raw ETH/BTC price: ${info["rawPrice"]}`;
  }
});

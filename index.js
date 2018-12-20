const express = require("express");
const WebSocket = require("ws");
const socket =require("socket.io");

// create new websocket for poloniex
const poloniexWS = new WebSocket("wss://api2.poloniex.com");

//App init
let application = express();
let server = application.listen(4000, () => {
  console.log("initializing requests from port 4000");
});
application.use(express.static("pub"));

//initing variables
let convertedPrice = 0;
let rawPrice = 0;
let bitcoinTickerInfo = {};
let priceUsd;


let io = socket(server);
io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);

  socket.on("bitcoin", (data) => {
    //messaging the data into usable information
    bitcoinTickerInfo = JSON.parse(data.bitcoinTickerInfo)[0];
    priceUsd = parseFloat(bitcoinTickerInfo["price_usd"]);
  });
});

//make intial connection to the poliex websocket
poloniexWS.on("open", () => {
  console.log("successfully connected to wss://api2.poloniex.com");

  //since the initial message must be a string, we stringify the message to send
  let subscriptionMessage = JSON.stringify({
    "command": "subscribe",
    "channel": 1002});

  poloniexWS.send(subscriptionMessage);
});

//listen to all the necessary messages on the 1002 WS channel
poloniexWS.on("message", (data) => {
  if (data) {
    //only continue if data is truthy
    data = JSON.parse(data);
    let messagedData = data[data.length - 1];
    let lastValue = parseFloat(messagedData[messagedData.length - 1]);
    if (lastValue && priceUsd) {
      //only calculate if both are truthy
      convertedPrice = calculateCurrentPrice(priceUsd, lastValue);
      io.sockets.emit("currentPrices", {
        convertedPrice: convertedPrice.toString(),
        rawPrice: lastValue.toString()
      });
    }
  }
});

//simple helper function that multiplies the two values and returns the result
function calculateCurrentPrice(bitcoinUsdPrice, value) {
  return bitcoinUsdPrice * value;
}


module.exports = class Ticker
{

  constructor(product_code = "FX_BTC_JPY") {

    this.__product_code = product_code;


    //websocket
    const PeriodicMonitoring = require("./PeriodicMonitoring.js");
    this.pm = new PeriodicMonitoring(5000);

    this.WebSocket = require("rpc-websockets").Client;
    this.taker = "lightning_ticker_" + this.__product_code;

    //Executions
    this.__renewCallBack = () => {};

    this.__interval = true;
  }


  set interval(value) {
    this.__interval = value;
  }
  get interval() {
    return this.__interval;
  }
  //プロダクトコード
  set product_code(pc) {
    this.__product_code = pc;
  }
  get product_code() {
    return this.__product_code;
  }

  set renewCallBack(callback) {
    if (typeof(callback) === "function") {
      this.__renewCallBack = callback;
    } else {
      throw new TypeError("LookingBeforeChart : renewCallBack ERROR->notFunction");
    }
  }

  jsonParse(text) {
      var obj = null;
      try {
          obj = JSON.parse( text );
          return obj;
      } catch (err) {
        return {"error" : "TypeError : not JSON", "text": text};
      }
  }
  //////////////
  websocket_init() {
    console.log("WS init");
    this.__bordList = {};
    this.__bordRenge = 10000;
    this.pm.renewTimer();
  }
  websocket() {
    console.log("START WEBSOCKET");
    if (this.ws) {this.ws.close()};

    try {
      this.ws = new this.WebSocket("wss://ws.lightstream.bitflyer.com/json-rpc", {reconnect:false, max_reconnects:2});
      this.websocket_init();

    } catch (e) {
      setInterval(() => {
        this.websocket();
      }, 5);
      return;
    }

    //WebSocket接続監視Callback
    this.pm.setCheckCallback = (timerCount) => {
      //console.log("send ping");
      this.__interval = true;
    }
    this.pm.setErrorCallback = (timerCount) => {
      console.log("再起動");
      this.websocket();
    }
    ///////////////////////////
    this.ws.on("open", () => {
      this.ws.call("subscribe", {
          channel: this.taker
      });
      this.pm.startMonitoring();
    });

    this.ws.on("channelMessage", notify => {
      this.pm.renewTimer();

      if (notify.channel == this.taker && this.__interval) {
        //this.__interval = false;
        this.__renewCallBack(notify.message);
      } else {}
    });

  }
}


















//

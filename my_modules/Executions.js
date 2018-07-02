
module.exports = class Executions
{

  constructor(product_code = "FX_BTC_JPY") {

    this.__product_code = product_code;
    //websocket
    const PeriodicMonitoring = require("./PeriodicMonitoring.js");
    this.pm = new PeriodicMonitoring(5000);

    this.WebSocket = require("rpc-websockets").Client;
    this.executions = "lightning_executions_" + this.__product_code;


    //Executions
    this.__renewCallBack = () => {};
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
    }
    this.pm.setErrorCallback = (timerCount) => {
      console.log("再起動");
      this.websocket();
    }
    ///////////////////////////
    this.ws.on("open", () => {
      this.ws.call("subscribe", {
          channel: this.executions
      });
      this.pm.startMonitoring();
    });

    this.ws.on("channelMessage", notify => {
      this.pm.renewTimer();

      if (notify.channel == this.executions) {
        this.__renewCallBack(notify.message);
      } else {}
    });

  }
}


















//


module.exports = class bitflyer
{
  constructor(key, secret, product_code = "FX_BTC_JPY") {
    this.request = require('request');
    this.crypto = require('crypto');

    this.__key = key;
    this.__secret = secret;
    this.__product_code = product_code;

    this.__url = "https://lightning.bitflyer.jp";
  }


  //プロダクトコード
  set product_code(pc) {
    this.__product_code = pc;
  }
  get product_code() {
    return this.__product_code;
  }

  createRequest(path, method, body) {
    let timestamp = Date.now().toString();
    let orgtext = timestamp + method + path + (method === "POST" ? body : "");
    let sign = this.crypto.createHmac('sha256', this.__secret).update(orgtext).digest('hex');
    let options = {
      url: this.__url + path,
      method: method,
      body: body,
      headers: {
          'ACCESS-KEY': this.__key,
          'ACCESS-TIMESTAMP': timestamp,
          'ACCESS-SIGN': sign,
          'Content-Type': 'application/json'
      }
    };

    return options;
  }

  sendRequest(path, method, body) {
    const promise = new Promise((resolve, reject) => {
      try {
        let options = this.createRequest(path, method, body);
        this.request(options, (err, response, payload) => {
                resolve(payload);
        });
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }
  /////////////////////////////
  //POST
  /////////////////////////////
  simpleOrder(datas = []) {
    let [child_order_type, side, price, size, minute_to_expire, time_in_force] = datas;

    minute_to_expire = minute_to_expire ? minute_to_expire : 999999;
    time_in_force = time_in_force ? time_in_force : "GTC";

    var body = JSON.stringify({
                              product_code: this.__product_code,
                              child_order_type: child_order_type,
                              side: side,
                              price: price,
                              size: size,
                              minute_to_expire: minute_to_expire,
                              time_in_force: time_in_force
                              });
    return this.sendRequest("/v1/me/sendchildorder", "POST", body);
  }


  IFDOrder(order1 = [], order2= [], minute_to_expire, time_in_force) {
    minute_to_expire = minute_to_expire || 999999;
    time_in_force = time_in_force || "GTC";

    let body = {order_method: "IFD", minute_to_expire: minute_to_expire, time_in_force: time_in_force};
    body["parameters"] = [this.createOrderBody(order1), this.createOrderBody(order2)];

    return this.sendRequest("/v1/me/sendparentorder", "POST", JSON.stringify(body));
  }

  createOrderBody(orderData) {
    let body;
    let [child_order_type, side, price, size, minute_to_expire, time_in_force] = orderData;

    switch (child_order_type) {
      case "LIMIT":
        body = {product_code: this.__product_code, condition_type: child_order_type, side: side, price: price, size: size};
        break;
      default:
        body = null;
    }
    return body;
  }


  //キャンセル
  cancelOrder(datas = []) {
    let [child_order_acceptance_id, child_order_id] = datas;

    var body = JSON.stringify({
                              product_code: this.__product_code,
                              //child_order_id: child_order_id,
                              child_order_acceptance_id: child_order_acceptance_id
                              });
    return this.sendRequest("/v1/me/cancelchildorder", "POST", body);
  }
  cancelSpecialOrder(parent_order_acceptance_id) {

    var body = JSON.stringify({
                              product_code: this.__product_code,
                              //child_order_id: child_order_id,
                              parent_order_acceptance_id: parent_order_acceptance_id
                              });
    return this.sendRequest("/v1/me/cancelparentorder", "POST", body);
  }
  cancelAllOrder() {
    var body = JSON.stringify({
                              product_code: this.__product_code
                              });
    return this.sendRequest("/v1/me/cancelallchildorders", "POST", body);
  }

  /////////////////////////////
  //GET
  /////////////////////////////
  //特殊注文の詳細
  getOrderDetail(datas = []) {
    datas.push("product_code=" + this.__product_code);
    return this.sendRequest("/v1/me/getparentorders/?" + this.createGetUrl(datas), "GET", "");
  }

  getMarketList() {
    return this.sendRequest("/v1/getmarkets", "GET", "");
  }

  getAsset() {
    return this.sendRequest("/v1/me/getcollateral", "GET", "");
  }

  //注文一覧
  orderList(datas = []) {
    var body = ["product_code=" + this.__product_code];
    Array.prototype.push.apply(body, datas);
    return this.sendRequest("/v1/me/getchildorders/?" + this.createGetUrl(body), "GET", "");
  }

  //建玉一覧
  positionList() {
    var body = ["product_code=" + this.__product_code];
    return this.sendRequest("/v1/me/getpositions/?" + this.createGetUrl(body), "GET", "");
  }

  //約定履歴
  getExecutions(parameters = []) {
    let [count, before, after] = parameters;
    let body = ["product_code=" + this.__product_code, "count=" + count, "before=" + before, "after" + after];
    return this.sendRequest("/v1/getexecutions/?" + this.createGetUrl(body), "GET", "");

  }

  /////////////////////////////
  //ASSIST
  /////////////////////////////
  createGetUrl(datas = []) {
    let string = "";
    for (var i = 0; i < datas.length; i++) {
      string += (string ? "&" : "") + datas[i];
    }

    return string;
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
}


















//

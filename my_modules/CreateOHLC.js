
module.exports = class CreateOHLC
{

  constructor(dt = 60 * 1000) {
    this.moment = require('moment');
    this.__standardTime = this.moment.utc("2018-06-01 00:00:00").valueOf();

    this.__renewCallBack = () => {};
    this.initwithBeforeOHLCData([]);

    this.__dt = dt;
  }
  initwithBeforeOHLCData(beforeOHLCData = []) {
    this.__ohlcData = beforeOHLCData;
    this.__maxDataSize = 200;
    this.__makeDataClass = {};
    this.__makeDataClass.timestamp = 0;
    this.__makeDataClass.data = [];
  }

  pushPriceData(data = {}) {
    const [price, timestamp, size] = [data.price, this.moment.utc(data.timestamp).valueOf(), (data.size || 0)];
    const group = timestamp - ((timestamp - this.__standardTime) % (this.__dt));

    if (this.__makeDataClass.timestamp && this.__makeDataClass.timestamp != group) {
      const ohlc = this.askOHLC();

      this.__ohlcData.push(ohlc);
      this.renewDataSize();

      this.__makeDataClass.timestamp = 0;
      this.__makeDataClass.data = [];

      this.__renewCallBack(ohlc);
    }
    this.__makeDataClass.timestamp = group;
    this.__makeDataClass.data.push([price, size]);
  }

  askOHLC() {
    const candleTime = this.__makeDataClass.timestamp;
    if (!this.__makeDataClass.data.length) {
      return [0, 0, 0, 0, 0, candleTime];
    }
    const [o, c] = [this.__makeDataClass.data[0][0], this.__makeDataClass.data[this.__makeDataClass.data.length - 1][0]];
    let h, l;
    let v = 0;
    for(var i in this.__makeDataClass.data) {
      const [price, size] = this.__makeDataClass.data[i];
      v += size;
      (!h || h < price) ? (h = price) : (0);
      (!l || l > price) ? (l = price) : (0);
    }
    return [o, h, l, c, v, candleTime];
  }

  renewDataSize() {
    if (this.__ohlcData.length > this.__maxDataSize) {
      this.__ohlcData.shift();
      this.renewDataSize();
    }
  }

  set renewCallBack(callback) {
    if (typeof(callback) === "function") {
      this.__renewCallBack = callback;
    } else {
      throw new TypeError("LookingBeforeChart : renewCallBack ERROR->notFunction");
    }
  }
}


















//


module.exports = class PeriodicMonitoring
{
  constructor(timerDistance = 5000) {
    this.init();
    this.__timerDistance = timerDistance;
    this.__chackCallback = function () {};
    this.__errorCallback = function () {};
  }
  init() {
    this.__timer = null;
    this.__timerCount = 0;
  }

  //確認コールバック
  set setCheckCallback(callback) {
    if (typeof(callback) === "function") {
      this.__chackCallback = callback;
    } else {
      throw new TypeError("PeriodicMonitoring:callbackerror->notFunction");
    }
  }

  //エラー発生時コールバック
  set setErrorCallback(callback) {
    if (typeof(callback) === "function") {
      this.__errorCallback = callback;
    } else {
      throw new TypeError("PeriodicMonitoring:callbackerror->notFunction");
    }
  }

  startMonitoring() {
    if (this.__timer) {return;}
    this.__timer = setInterval(() => {
      if (this.__timerCount) {
        //２回目からcallback実行
        try {
          this.__errorCallback(this.__timerCount);
        } catch (e) {
          throw new Error("PeriodicMonitoring:callbackerror->contextError");
          this.endMonitoring();
        }
      } else {
        //１回目はここを実行
        this.__chackCallback(this.__timerCount);
      }
      this.__timerCount++;
    }, this.__timerDistance);
  }


  renewTimer() {
    this.endMonitoring();
    this.startMonitoring();
  }

  endMonitoring() {
    if (this.__timer) {
      clearInterval(this.__timer);
      this.init();
    }
  }
}


















//

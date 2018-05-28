
///////////////////////////
//ユーザー設定
///////////////////////////
var priceRange = 950;
var lot = 0.01;
var intervalTime = 5 * 1000;

const key = "";
const secret = "";



const BitFlyer = require('../../my_modules/bf.js');
const bitflyer = new BitFlyer(key, secret);

const Ticker = require('../../my_modules/Ticker.js');
const ticker = new Ticker();


let main = async function () {
  console.log("start main");

  ///////////////////////////
  //プロダクトコード取得
  ///////////////////////////
  /*
  //四半期先物　プロダクトコード取得
  console.log("四半期先物　プロダクトコード取得...");
  let marketList = bitflyer.jsonParse(await bitflyer.getMarketList());
  for (var i = 0; i < marketList.length; i++) {
    if (marketList[i].alias == "BTCJPY_MAT3M") {
      bitflyer.product_code = marketList[i].product_code;
      console.log("取得完了=>", bitflyer.product_code);
      break;
    }
  }
  */

  console.log(" BF_FX　プロダクトコード取得...");
  bitflyer.product_code = "FX_BTC_JPY";
  console.log("取得完了=>", bitflyer.product_code);
  console.log("--------------------");

  ///////////////////////////
  //証拠金取得
  ///////////////////////////
  console.log("証拠金取得...");
  let getasset = bitflyer.jsonParse(await bitflyer.getAsset());
  if (getasset.error) {
    console.log("取得失敗...");
  } else {
    console.log("現在の証拠金:", getasset.collateral);
    console.log("評価損益:", getasset.open_position_pnl);
    console.log("維持率:", getasset.keep_rate　* 100);
  }
  console.log("--------------------");

  var positionData = {size:0, side:null};
  ticker.renewCallBack = async (datas) => {
    ///////////////////////////
    //初期値設定
    ///////////////////////////
    let best_bid = datas.best_bid;
    let best_ask = datas.best_ask;
    let ltp = datas.ltp;

    ///////////////////////////
    //フィルター
    ///////////////////////////
    if (best_ask - best_bid < priceRange) {
      return;
    }
    ///////////////////////////
    //指値取消し
    ///////////////////////////
    ticker.interval = false;
    console.log("指値取消し...");
    bitflyer.cancelAllOrder();

    ///////////////////////////
    //注文処理
    ///////////////////////////
    let sellOrder = ["LIMIT", "SELL", best_ask - 10000, lot];
    let buyOrder = ["LIMIT", "BUY", best_bid + 10000, lot];
    console.log("注文開始...")
    let [sellData, buyData] = await Promise.all([bitflyer.simpleOrder(sellOrder), bitflyer.simpleOrder(buyOrder)]);
    console.log("売り注文ID：", bitflyer.jsonParse(sellData));
    console.log("買い注文ID：", bitflyer.jsonParse(buyData));
    console.log("--------------------");

    ///////////////////////////
    //ポジションリスト
    ///////////////////////////
    console.log("ポジションリスト取得...");
    let getpositionlist = bitflyer.jsonParse(await bitflyer.positionList());
    if (getpositionlist.error) {
      console.log("取得失敗...");
    } else {
      for (var i in getpositionlist) {
        let data = getpositionlist[i];
        if (data.product_code != bitflyer.product_code) {continue;}
        positionData.size += data.size;
        positionData.side = data.side;
      }
      console.log("ポジション情報:", positionData.side, "*", positionData.size, "BTC");
    }
    console.log("--------------------");
    console.log("========================================");

    ///////////////////////////
    //待機
    ///////////////////////////
    await sleep(intervalTime);
    ticker.interval = true;
  }
  ticker.websocket();
}

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}



main();

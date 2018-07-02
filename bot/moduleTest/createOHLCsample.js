

const Executions = require('../../my_modules/Executions.js');
const executions = new Executions();

const CreateOHLC = require('../../my_modules/CreateOHLC.js');
const createOHLC = new CreateOHLC(10 * 1000);

async function main () {

  //beforeChartData　→　以前のohlcデータ
  const beforeChartData = await readBeforeChart();
  createOHLC.initwithBeforeOHLCData(beforeChartData);


  createOHLC.renewCallBack = (newOHLC) => {
    //ohlcが出来次第呼ばれます
    const [o, h, l, c, v, timestamp] = newOHLC;
    console.log(newOHLC);
  }
  executions.websocket();
  executions.renewCallBack = (jsonData) => {
    for(var i in jsonData) {
      const [price, timestamp, size] = [jsonData[i].price, jsonData[i].exec_date, jsonData[i].size];
      createOHLC.pushPriceData({price:price, timestamp:timestamp, size:size});
    }
  }
}


//起動時に以前のohlcデータを読み込む
function readBeforeChart() {
  return new Promise((resolve, reject) => {
    resolve([]);
  });
}



main();

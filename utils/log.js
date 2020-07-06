import { Base } from 'base.js';

class Log extends Base {
  constructor() {
    super();
  }

  //获取商品信息,id是对应主题的id号
  writeLog(data, callback) {
    var params = {
      url: 'log',
      type: 'post',
      data: data,
      sCallback: function (res) {
        callback && callback(res);
      }
    };
    this.request(params);
  }

}

export { Log }
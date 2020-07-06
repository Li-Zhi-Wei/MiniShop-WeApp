import { Base } from 'base.js';

class Config extends Base{
  constructor(){
    super();
  }
  getShopStatus(callback) {
    const param = {
      url: 'config/shopStatus',
      sCallback: function (res) {
        if (res) {
          callback && callback(res);
        }
      }
    }
    this.request(param)
  }
}

// Config.restUrl = 'http://z.cn/api/v1/';
Config.restUrl = '';

export{Config};
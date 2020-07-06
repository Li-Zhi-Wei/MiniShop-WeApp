import { Base } from '../../utils/base.js';

class Theme extends Base{
  constructor(){
    super();
  }

  //获取商品信息,id是对应主题的id号
  getProductsData(id,callback) {
    var params = {
      url: 'theme/'+id,
      sCallback: function (res) {
        callback && callback(res);
      }
    };
    this.request(params);
  }

}

export {Theme}
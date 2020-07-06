
import {Base} from '../../utils/base.js';

class Home extends Base{
  
  constructor(){
    super();
  }

  //获取轮播图信息
  getBannerData(id,callback){
    var params = {
      url: 'banner/'+id,
      sCallback:function(res){
        callback && callback(res.items);
      }
    };
    this.request(params);
  }

  //获取主题信息
  getThemeData(callback){
    var params = {
      url: 'theme?ids=1,2,3',
      sCallback: function (res) {
        callback && callback(res);
      }
    };
    this.request(params);
  }

  //获取商品信息
  getProductsData(pageIndex,callback) {
    var params = {
      url: 'product/recent?page='+pageIndex,
      sCallback: function (res) {
        callback && callback(res);
      }
    };
    this.request(params);
  }

}
export{Home};
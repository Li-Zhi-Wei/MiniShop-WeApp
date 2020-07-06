import { Base } from '../../utils/base.js'

class Order extends Base {

  constructor() {
    super();
    this._storageKeyName = 'newOrder';
  }

  /*下订单*/
  doOrder(param, callback) {
    var that = this;
    var allParams = {
      url: 'order',
      type: 'post',
      data: { sku: param },
      sCallback: function (data) {
        that.execSetStorageSync(true);
        callback && callback(data);
      },
      eCallback: function (res) {
        wx.showModal({
          title: '下单失败',
          content: res.msg,
          showCancel: false,
          success: function (res) {
          }
        });
      }
    };
    this.request(allParams);
  }

  /*
  * 拉起微信支付
  * params:
  * norderNumber - {int} 订单id
  * return：
  * callback - {obj} 回调方法 ，返回参数 可能值 0:请求预订单失败，还未拉起支付页面。可能原因：缺货、服务器问题等;  1: 支付失败或者支付取消； 2:支付成功；
  * */
  execPay(orderNumber, callback) {
    var allParams = {
      url: 'pay/pre_order',
      type: 'post',
      data: { id: orderNumber },
      sCallback: function (data) {
        var timeStamp = data.timeStamp;
        if (timeStamp) { //可以支付
          wx.requestPayment({
            'timeStamp': timeStamp.toString(),
            'nonceStr': data.nonceStr,
            'package': data.package,
            'signType': data.signType,
            'paySign': data.paySign,
            success: function () {
              callback && callback(2);
            },
            fail: function () {
              callback && callback(1);
            }
          });
        } else {
          callback && callback(0);
        }
      },
      eCallback: function(data){
        callback && callback(0);
      }
    };
    this.request(allParams);
  }

  /*获得所有订单,pageIndex 从1开始*/
  getOrders(pageIndex, callback) {
    var allParams = {
      url: 'order/by_user',
      data: { page: pageIndex },
      type: 'get',
      sCallback: function (data) {
        callback && callback(data);  //1 未支付  2，已支付  3，已发货，4已支付，但库存不足
      }
    };
    this.request(allParams);
  }

  /*获得订单的具体内容*/
  getOrderInfoById(id, callback) {
    var that = this;
    var allParams = {
      url: 'order/' + id,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () {

      }
    };
    this.request(allParams);
  }

  /*本地缓存 保存／更新*/
  execSetStorageSync(data) {
    wx.setStorageSync(this._storageKeyName, data);
  };

  /*是否有新的订单*/
  hasNewOrder() {
    var flag = wx.getStorageSync(this._storageKeyName);
    return flag == true;
  }

  //获取运费信息
  getPostage(param,callback){
    var params = {
      url: 'order/postage',
      type:'post',
      data: { sku: param },
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () {
        
      }
    };
    this.request(params);
  }

  /**
   * 关闭订单
   */
  close(param, callback) {
    const params = {
      url: 'order/close/' + param,
      type: 'put',
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () {
        wx.showToast({
          title: '关闭订单失败，请检查网络',//提示文字
          duration: 2000,//显示时长
          mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
          icon: 'none', //图标，支持"success"、"loading"   
        })
      }
    }
    this.request(params)
  }

  /**
   * 确认收货
   */
  receive(param, callback) {
    const params = {
      url: 'order/receive/' + param,
      type: 'put',
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () {
        wx.showToast({
          title: '确认收货失败，请检查网络',//提示文字
          duration: 2000,//显示时长
          mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
          icon: 'none', //图标，支持"success"、"loading"   
        })
      }
    }
    this.request(params)
  }
}

export { Order };
import {
  Order
} from '../order/order-model.js';
import {
  Cart
} from '../cart/cart-model.js';
import {
  Address
} from '../../utils/address.js';
var order = new Order();
var cart = new Cart();
var address = new Address();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    flag:true,//控制 全场满xx包邮 这句话是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    var from = options.from;
    if(from == 'cart'){
      this._fromCart(options.account);
    }
    else if(from == 'product'){
      this._fromProduct(options);
    }
    else{
      var id = options.id;
      this._fromOrder(id);
    }
  },

  //从商品详情进入订单页面
  _fromProduct: function (options){
    var sku = JSON.parse(options.sku);
    var counts = options.counts;
    sku.counts = counts;
    var orderInfo = [];
    orderInfo.push({
      sku_id: sku.id,
      count: counts,
      price: sku.price,
      postage: sku.postage,
    });
    order.getPostage(orderInfo, (res) => {
      this.setData({
        productsArr: [sku],
        account: parseFloat(counts) * parseFloat(sku.price),
        totalPrice: parseFloat(counts) * parseFloat(sku.price) + parseFloat(res.postage),
        orderStatus: 0, //0表示第一次支付
        condition: res.condition ? res.condition : null,
        postage: res.postage,
        flag: res.postageFlag,
        fromProductFlag: true,
      })
    });
    //显示收货地址
    address.getAddress((res) => {
      this._bindAddressInfo(res);
    })
  },

  //从购物车进入订单页面
  _fromCart:function(account){
    var productsArr;
    productsArr = cart.getCartDataFromLocal(true);
    var orderInfo = [];
    for (let i = 0; i < productsArr.length; i++) {
      orderInfo.push({
        sku_id: productsArr[i].id,
        count: productsArr[i].counts,
        price: productsArr[i].price,
        postage: productsArr[i].postage,
      });
    }
    order.getPostage(orderInfo,(res)=>{
      this.setData({
        productsArr: productsArr,
        account: parseFloat(account),
        totalPrice: parseFloat(account) + parseFloat(res.postage),
        orderStatus: 0, //0表示第一次支付
        condition: res.condition,
        postage: res.postage,
        flag: res.postageFlag,
      });
    });

    //显示收货地址
    address.getAddress((res) => {
      this._bindAddressInfo(res);
    })
  },

  //从订单列表进入订单页面
  _fromOrder:function(id){
    if (id) {
      var that = this;
      //下单后，支付成功或者失败后，点左上角返回时能够更新订单状态 所以放在onshow中
      order.getOrderInfoById(id, (data) => {
        if (!data.deliver_record){
          data.deliver_record = { number:"暂无", comp:"暂无"}
        } 
        that.setData({
          orderStatus: data.status,
          productsArr: data.snap_items,
          account: (parseFloat(data.total_price) - parseFloat(data.postage_price)).toFixed(2),
          postage: data.postage_price,
          totalPrice: data.total_price,
          id:id,
          postage:data.postage_price,
          flag:false,
          basicInfo: {
            orderTime: data.create_time,
            orderNo: data.order_no,
            deliver_number: data.deliver_record.number,
            deliver_comp: data.deliver_record.comp
          },
        });
        // 快照地址
        var addressInfo = data.snap_address;
        addressInfo.totalDetail = address.setAddressInfo(addressInfo);
        that._bindAddressInfo(addressInfo);
      });
    }
  },

  /*修改或者添加地址信息*/
  editAddress: function() {
    var that = this;
    wx.chooseAddress({
      success: function(res) {
        var addressInfo = {
          name: res.userName,
          mobile: res.telNumber,
          totalDetail: address.setAddressInfo(res)
        };
        that._bindAddressInfo(addressInfo);
        //保存地址
        address.submitAddress(res, (flag) => {
          if (!flag) {
            that.showTips('操作提示', '地址信息更新失败！');
          }
        });
      }
    })
  },

  /*
   * 提示窗口
   * params:
   * title - {string}标题
   * content - {string}内容
   * flag - {bool}是否跳转到 "我的页面"
   */
  showTips: function(title, content, flag) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
      success: function(res) {
        if (flag) {
          wx.switchTab({
            url: '/pages/my/my'
          });
        }
      }
    });
  },

  /*绑定地址信息*/
  _bindAddressInfo: function(addressInfo) {
    this.setData({
      addressInfo: addressInfo
    });
  },

  //支付
  pay: function() {
    if (!this.data.addressInfo) {
      this.showTips('下单提示', '请填写您的收货地址');
      return;
    }
    if (this.data.orderStatus == 0) {
      this._firstTimePay();
    } else {
      this._oneMoresTimePay();
    }
  },

  /*第一次支付*/
  _firstTimePay: function() {
    var orderInfo = [],
      procuctInfo = this.data.productsArr,
      order = new Order();
    for (let i = 0; i < procuctInfo.length; i++) {
      orderInfo.push({
        sku_id: procuctInfo[i].id,
        count: procuctInfo[i].counts
      });
    }
    var that = this;
    //支付分两步，第一步是生成订单号，然后根据订单号支付
    order.doOrder(orderInfo, (data) => {
      //订单生成成功
      if (data.pass) {
        //更新订单状态
        var id = data.order_id;
        that.data.id = id;
        // that.data.fromCartFlag = false;
        if(!that.data.fromProductFlag){
          that.deleteProducts(); //将已经下单的商品从购物车删除
        }
        //开始支付
        that._execPay(id);
      } else {
        that._orderFail(data); // 下单失败
      }
    });
  },

  /* 再次次支付*/
  _oneMoresTimePay: function () {
    this._execPay(this.data.id);
  },

  /*
   *开始支付
   * params:
   * id - {int}订单id
   */
  _execPay: function(id) {

    var that = this;
    order.execPay(id, (statusCode) => {
      if (statusCode == 0) {
        wx.showToast({
          title: '当前无法支付，请稍后再试',//提示文字
          duration: 2000,//显示时长
          mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
          icon: 'none', //图标，支持"success"、"loading"   
        })
      } else {
        // 获取下发发货通知的权限
        wx.requestSubscribeMessage({
          tmplIds: [''], // 模板id
          success: function (res) {
            
          },
          fail(err) {
            
          }
        })
        var flag = statusCode == 2;
        wx.navigateTo({
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=order'
        });
      }
    });
  },

  //将已经下单的商品从购物车删除
  deleteProducts: function() {
    var ids = [],
      arr = this.data.productsArr;
    for (let i = 0; i < arr.length; i++) {
      ids.push(arr[i].id);
    }
    cart.delete(ids);
  },

  /*
   *下单失败
   * params:
   * data - {obj} 订单结果信息
   * */
  _orderFail: function(data) {
    var nameArr = [],
      name = '',
      str = '',
      pArr = data.pStatusArray;
    for (let i = 0; i < pArr.length; i++) {
      if (!pArr[i].haveStock || !pArr[i].status) {
        name = pArr[i].name;
        if (name.length > 15) {
          name = name.substr(0, 12) + '...';
        }
        nameArr.push(name);
        if (nameArr.length >= 2) {
          break;
        }
      }
    }
    str += nameArr.join('、');
    if (nameArr.length == 0) {
      str = '商品缺货或下架'
    } else {
      if (nameArr.length > 2) {
        str += ' 等'
      }
      str += ' 缺货'
    }
    wx.showModal({
      title: '下单失败',
      content: str,
      showCancel: false,
      success: function(res) {
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if(this.data.id){
      this._fromOrder(this.data.id, (res)=>{
        console.log(res)
      });
    }
  },

  /**
   * 关闭订单
   */
  close: function() {
    if (this.data.orderStatus == 1) {
      order.close(this.data.id,(res) => {
        if (res.code == 201){
          this.setData({
            orderStatus: 7,
          })
          wx.showToast({
            title: '已关闭订单',//提示文字
            duration: 2000,//显示时长
            mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
            icon: 'none', //图标，支持"success"、"loading"   
          })
        }
      })
    }
  },

  /**
   * 确认收货
   */
  receive: function() {
    if (this.data.orderStatus == 3) {
      order.receive(this.data.id, (res) => {
        if (res.code == 201) {
          this.setData({
            orderStatus: 6,
          })
          wx.showToast({
            title: '已确认收货',//提示文字
            duration: 2000,//显示时长
            mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
            icon: 'none', //图标，支持"success"、"loading"   
          })
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
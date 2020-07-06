import {
  Order
} from '../order/order-model.js';
var order = new Order();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1, //初始订单页数
    isLoadedAll: false,
    loadingHidden: false,
    orderArr: [], //订单列表数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    this._getOrders();
    order.execSetStorageSync(false); //更新标志位
  },

  /*订单信息*/
  _getOrders: function (callback) {
    var that = this;
    order.getOrders(this.data.pageIndex, (res) => {
      var data = res.data;
      that.setData({
        loadingHidden: true
      });
      if (data.length > 0) {
        that.data.orderArr.push.apply(that.data.orderArr, res.data); //数组合并
        that.setData({
          orderArr: that.data.orderArr
        });
      } else {
        that.setData({
          isLoadedAll: true,
          pageIndex: 1,
        })
      }
      callback && callback();
    });
  },

  /*显示订单的具体信息*/
  showOrderDetailInfo: function (event) {
    var id = order.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../order/order?from=order&id=' + id
    });
  },

  /*未支付订单再次支付*/
  rePay: function (event) {
    var id = order.getDataSet(event, 'id'),
      index = order.getDataSet(event, 'index');
    this._execPay(id, index);
  },

  /*支付*/
  _execPay: function (id, index) {
    var that = this;
    order.execPay(id, (statusCode) => {
      if (statusCode > 0) {
        var flag = statusCode == 2;

        //更新订单显示状态
        if (flag) {
          that.data.orderArr[index].status = 2;
          that.setData({
            orderArr: that.data.orderArr
          });
        }
        //跳转到 成功页面
        wx.navigateTo({
          url: '../pay-result/pay-result?id=' + id + '&flag=' + flag + '&from=myOrder'
        });
      } else {
        that.showTips('支付失败', '商品已下架或库存不足');
      }
    });
  },

  /*下拉刷新页面*/
  onPullDownRefresh: function () {
    this.setData({
      orderArr: [], //订单初始化
      isLoadedAll: false, //是否加载完全
      pageIndex: 1,
    })
    this._getOrders(() => {
      wx.stopPullDownRefresh();
      order.execSetStorageSync(false); //更新标志位
    });
  },

  //页面上拉触底时触发的函数
  onReachBottom: function () {
    if (!this.data.isLoadedAll) {
      this.data.pageIndex++;
      this._getOrders();
    }
  },

  /*
 * 提示窗口
 * params:
 * title - {string}标题
 * content - {string}内容
 */
  showTips: function (title, content) {
    wx.showModal({
      title: title,
      content: content,
      showCancel: false,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var newOrderFlag = order.hasNewOrder();
    if (this.data.loadingHidden && newOrderFlag) {
      this.onPullDownRefresh();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
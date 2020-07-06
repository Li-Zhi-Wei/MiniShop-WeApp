import {Cart} from 'cart-model.js'
var cart = new Cart();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var cartData = cart.getCartDataFromLocal();
    var cal = this._calcTotalAccountAndCounts(cartData);

    this.setData({
      selectedCounts: cal.selectedCounts,//选中商品总数量
      cartData:cartData,
      selectedTypeCounts: cal.selectedTypeCounts,//选中商品种类总和
      account: cal.account//选中的商品的总价
    });
  },

  //计算选中商品的价格和数量
  _calcTotalAccountAndCounts:function(data){
    var len = data.length,
        account = 0,//选中的商品的总价
        selectedCounts = 0,//选中商品总数量
        selectedTypeCounts = 0;//选中商品种类总和
    let multiple = 100;
    for(let i=0;i<len;i++){
      if(data[i].selectStatus){//*100是为了避免浮点数精度问题
        account += data[i].counts*multiple*Number(data[i].price)*multiple;
        selectedCounts += data[i].counts;
        selectedTypeCounts++;
      }
    }
    return {
      selectedCounts:selectedCounts,
      selectedTypeCounts:selectedTypeCounts,
      account:account / (multiple*multiple)
    };
  },

  //商品选择按钮
  toggleSelect:function(event){
    var id = cart.getDataSet(event, 'id'),
      status = cart.getDataSet(event, 'status'),
      index = this._getProductIndexById(id);
    this.data.cartData[index].selectStatus = !status;
    this._resetCartData();
  },

  //全选按钮
  toggleSelectAll: function (event) {
    var status = cart.getDataSet(event, 'status') == 'true';
    var data = this.data.cartData,
      len = data.length;
    for (let i = 0; i < len; i++) {
      data[i].selectStatus = !status;
    }
    this._resetCartData();
  },

  /*根据商品id得到 商品所在下标*/
  _getProductIndexById: function (id) {
    var data = this.data.cartData,
      len = data.length;
    for (let i = 0; i < len; i++) {
      if (data[i].id == id) {
        return i;
      }
    }
  },

  /*更新购物车商品数据*/
  _resetCartData: function () {
    var newData = this._calcTotalAccountAndCounts(this.data.cartData); /*重新计算总金额和商品总数*/
    this.setData({
      account: newData.account,
      selectedCounts: newData.selectedCounts,
      selectedTypeCounts: newData.selectedTypeCounts,
      cartData: this.data.cartData
    });
  },

  /*调整商品数目*/
  changeCounts: function (event) {
    var id = cart.getDataSet(event, 'id'),
      type = cart.getDataSet(event, 'type'),
      index = this._getProductIndexById(id),
      counts = 1;
    if (type == 'add') {
      cart.addCounts(id);
    } else {
      counts = -1;
      cart.cutCounts(id);
    }
    //更新商品页面
    this.data.cartData[index].counts += counts;
    this._resetCartData();
  },

  /*删除商品*/
  delete: function (event) {
    var id = cart.getDataSet(event, 'id'),
      index = this._getProductIndexById(id);
    this.data.cartData.splice(index, 1);//删除某一项商品
    this._resetCartData();
    cart.delete(id);  //内存中删除该商品
  },

  //下单
  submitOrder:function(event){
    wx.navigateTo({
      url: '../order/order?account='+this.data.account+'&from=cart',
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    cart.execSetStorageSync(this.data.cartData);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
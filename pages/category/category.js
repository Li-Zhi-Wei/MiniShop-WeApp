import {Category} from 'category-model.js';
var category = new Category();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    transClassArr: ['tanslate0', 'tanslate1', 'tanslate2', 'tanslate3', 'tanslate4', 'tanslate5', 'tanslate6', 'tanslate7', 'tanslate8', 'tanslate9', 'tanslate10', 'tanslate11', 'tanslate12', 'tanslate13', 'tanslate14', 'tanslate15'],
    currentMenuIndex: 0,
    loadingHidden: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadData();
  },

  // 加载所有数据
  _loadData:function(){
    var that = this
    category.getCategoryType((categoryData)=>{
      that.setData({
        categoryTypeArr:categoryData,
        loadingHidden: true
      });
      //要在回调里再进行获取分类详情的方法调用
      that.getProductsByCategory(categoryData[0].id, (data) => {
        var dataObj = {
          procucts:data,
          topImgUrl:categoryData[0].img.url,
          title:categoryData[0].name
        };
        that.setData({
          loadingHidden: true,
          categoryInfo0:dataObj
        });
      });
    });
  },

  /*切换分类*/
  changeCategory: function (event) {
    var index = category.getDataSet(event, 'index'),
      id = category.getDataSet(event, 'id')//获取data-set
    this.setData({
      currentMenuIndex: index
    });

    //如果数据是第一次请求
    if (!this.isLoadedData(index)) {
      var that = this;
      this.getProductsByCategory(id, (data) => {
        that.setData(that.getDataObjForBind(index, data));
      });
    }
  },

  isLoadedData: function (index) {
    if (this.data['categoryInfo' + index]) {
      return true;
    }
    return false;
  },

  //获得分类的内容
  getDataObjForBind: function (index, data) {
    var obj = {},
    baseData = this.data.categoryTypeArr[index];
    obj['categoryInfo' + index] = {
      procucts: data,
      topImgUrl: baseData.img.url,
      title: baseData.name
    };
    return obj;
  },

  getProductsByCategory: function (id, callback) {
    category.getProductsByCategory(id, (data) => {
      callback && callback(data);
    });
  },

  /*跳转到商品详情*/
  onProductsItemTap: function (event) {
    var id = category.getDataSet(event, 'id');
    wx.navigateTo({
      url: '../product/product?id=' + id
    })
  },

  /*下拉刷新页面*/
  onPullDownRefresh: function () {
    this._loadData(() => {
      wx.stopPullDownRefresh()
    });
  },

  //分享效果
  onShareAppMessage: function () {

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})
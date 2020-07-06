// pages/home/home.js

import {Home} from 'home-model.js'
import { Config } from '../../utils/config.js'
var home = new Home()
var config = new Config()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1, //初始订单页数
    isLoadedAll: false,
    loadingHidden: false,
    shopStatus: true,
    productsArr:[],
  },
  /**
   * 页面初始化
   */
  onLoad:function(){
    this._loadData(()=>{
      this.setData({
        loadingHidden: true
      })
    });
  },

  _loadData:function(callback){
    config.getShopStatus((res)=>{
      this.setData({
        shopStatus: Boolean(res.detail)
      })
      if (!this.data.shopStatus) {
        wx.hideTabBar()
      } else {
        wx.showTabBar()
      }
    })

    var id = 1;
    home.getBannerData(id,(res) => {
      this.setData({
        bannerArr : res
      });
    });

    home.getThemeData((res) => {
      this.setData({
        themeArr : res
      });
    });

    this._getProductsData(callback);

  },

  onBannerTap: function(event) {
    var id = home.getDataSet(event, 'id');
    var type = home.getDataSet(event, 'type');
    if (type == 1) {
      wx.navigateTo({
        url: '../product/product?id=' + id,
      })
    } else if(type == 2) {
      wx.navigateTo({
        url: '../theme/theme?id=' + id,
      })
    }
  },

  /*跳转到商品详情*/
  onProductsItemTap:function(event){
    var id = home.getDataSet(event,'id');
    wx.navigateTo({
      url: '../product/product?id='+id,
    })
  },

  /*跳转到主题列表*/
  onThemesItemTap: function (event) {
    var id = home.getDataSet(event, 'id',);
    wx.navigateTo({
      url: '../theme/theme?id=' + id,
    })
  },

  //页面上拉触底时触发的函数
  onReachBottom: function () {
    if (!this.data.isLoadedAll) {
      this.data.pageIndex++;
      this._getProductsData();
    }
  },

  //获取商品列表
  _getProductsData:function(callback){
    var that = this;
    home.getProductsData(this.data.pageIndex,(res) => {
      var data = res.data;
      if (data.length > 0) {
        that.data.productsArr.push.apply(that.data.productsArr, res.data); //数组合并
        that.setData({
          productsArr: that.data.productsArr,
        });
      } else {
        that.data.isLoadedAll = true; //已经全部加载完毕
        that.data.pageIndex = 1;
      }
      callback && callback();
    });
  },

  /*下拉刷新页面*/
  onPullDownRefresh: function () {
    this.data.pageIndex = 1;
    this.data.isLoadedAll = false;
    this.data.productsArr = [];
    this._loadData(() => {
      wx.stopPullDownRefresh()
    });
  },

  //分享效果
  onShareAppMessage: function () {
    return {
      title: '厚德云创美妆商城',
      path: 'pages/home/home'
    }
  }

})
// var productObj = require('product-model.js');

import {
  Product
} from 'product-model.js';
import {
  Cart
} from '../cart/cart-model.js';

var product = new Product(); //实例化 商品详情 对象
var cart = new Cart();
Page({
  data: {
    loadingHidden: false,
    // hiddenSmallImg: true,
    // countsArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    productCounts: 1,
    currentTabsIndex: 0,
    cartTotalCounts: 0,
    specHideFlag: true,//(规格模态框) true-隐藏  false-显示
    animationData: {}, //(规格模态框) 动画数据
  },
  onLoad: function(option) {
    if (option.id) {
      this.data.id = option.id
    }
    if (option.scene) {
      this.data.id = decodeURIComponent(option.scene)
    }
    this._loadData();
  },

  /*加载所有数据*/
  _loadData: function(callback) {
    var that = this;
    product.getDetailInfo(this.data.id, (data) => {
      that.setData({
        cartTotalCounts: cart.getCartTotalCounts(),
        product: data,
        sku:{
          id: 0,
          img: data.main_img_url,
          price: data.price,
          stock: 99,
        },
        loadingHidden: true
      });
      callback && callback();
    });
  },

  //切换详情面板
  onTabsItemTap: function(event) {
    var index = product.getDataSet(event, 'index');
    this.setData({
      currentTabsIndex: index
    });
  },

  /*添加到购物车*/
  onAddingToCartTap: function(events) {
    if(!this.isChoose()){ return }//判断是否选择了规格
    this.addToCart();
    this.setData({
      cartTotalCounts: this.data.cartTotalCounts + this.data.productCounts
    });
    this.hideModal();
  },

  /**判断是否选择规格了 */
  isChoose: function(){
    if (this.data.sku.id == 0) {
      wx.showToast({
        title: '请选择规格',//提示文字
        duration: 2000,//显示时长
        mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
        icon: 'none', //图标，支持"success"、"loading"   
      })
      return false;
    }
    return true;
  },

  /*将商品数据添加到内存中*/
  addToCart: function() {
    var tempObj = {},
      keys = ['id', 'name', 'img','price','postage'];
    for (var key in this.data.sku) {
      if (keys.indexOf(key) >= 0) {
        tempObj[key] = this.data.sku[key];
      }
    }
    tempObj.product_name = this.data.product.name
    cart.add(tempObj, this.data.productCounts);
  },

  /*跳转到购物车*/
  onCartTap: function() {
    wx.switchTab({
      url: '/pages/cart/cart'
    });
  },

  /*下拉刷新页面*/
  onPullDownRefresh: function() {
    this._loadData(() => {
      wx.stopPullDownRefresh()
    });
  },

  //分享效果
  onShareAppMessage: function() {
    return {
      title: this.data.product.name,
      path: 'pages/product/product?id=' + this.data.id,
      imageUrl:this.data.product.main_img_url,
    }
  },

  // ---(规格)弹出动画---
  // 显示遮罩层
  showModal: function () {
    if (this.data.product.stock && this.data.product.status) {
      var that = this;
      that.setData({
        specHideFlag: false
      })
      // 创建动画实例
      var animation = wx.createAnimation({
        duration: 400,//动画的持续时间
        timingFunction: 'ease',//动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
      })
      this.animation = animation; //将animation变量赋值给当前动画
      var time1 = setTimeout(function () {
        that.slideIn();//调用动画--滑入
        clearTimeout(time1);
        time1 = null;
      }, 100)
    } else {
      wx.showToast({
        title: '当前商品缺货，请稍后再试',//提示文字
        duration: 2000,//显示时长
        mask: false,//是否显示透明蒙层，防止触摸穿透，默认：false  
        icon: 'none', //图标，支持"success"、"loading"   
      })
    }
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400,//动画的持续时间 默认400ms
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown();//调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        specHideFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)//先执行下滑动画，再隐藏模块

  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(450).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
  // ---(规格)弹出动画---

  /**选择规格 */
  onSpecTap: function(event){
    var id = product.getDataSet(event,'id');
    for(let i in this.data.product.sku){
      if(this.data.product.sku[i].id==id){
        this.setData({
          sku:{
            id: id,
            img: this.data.product.sku[i].img_url.url,
            price: this.data.product.sku[i].price,
            name: this.data.product.sku[i].name,
            stock: this.data.product.sku[i].stock,
            postage: this.data.product.sku[i].postage,
            status: this.data.product.sku[i].status,
          }
        })
        if (this.data.productCounts > this.data.sku.stock){
          this.setData({
            productCounts: this.data.sku.stock
          })
        }
        break
      }
    }
  },

  /*调整商品数目*/
  changeCounts: function (event) {
    var type = cart.getDataSet(event, 'type'),
      counts = this.data.productCounts;
    if (type == 'add') {
      counts += 1;
    } else {
      counts -= 1;
    }
    this.setData({
      productCounts: counts
    })
  },

  /**跳转 */
  onHomeTap:function(event){
    wx.switchTab({
      url: '../home/home'
    })
  },

  //下单
  submitOrder: function (event) {
    if (!this.isChoose()) { return }//判断是否选择了规格
    var sku = JSON.stringify(this.data.sku);
    wx.navigateTo({
      url: '../order/order?sku=' + sku + '&counts=' + this.data.productCounts + '&from=product',
    });
  },

})
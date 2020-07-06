import { My } from '../my/my-model.js';
var my = new My();

Page({
  data: {
    showAuth: true, // 是否显示获取用户信息按钮
    userInfo: {
      avatarUrl: '../../imgs/icon/user@default.png',
      nickName: '点击显示微信头像'
    },
  },

  onLoad: function() {
    wx.hideShareMenu();
    this._loadData()
  },

  _loadData: function() {
    var that = this
    my.getUserInfo((data) => {
      that.setData({
        showAuth: !data.auth,
        userInfo: data.userInfo
      })
    })
  },

  /**
    * 获取用户信息按钮回调事件
    */
  getUserInfo(event) {
    my.updateUserInfo(event.detail.userInfo)
    const { nickName, avatarUrl } = event.detail.userInfo
    this.setData({
      showAuth: false,
      userInfo: { nickName, avatarUrl }
    })
  },

  onMyAddressTap:function(){
    wx.navigateTo({
      url: '../address/address',
    })
  },

  onMyOrderTap:function(){
    wx.navigateTo({
      url: '../myOrder/myOrder',
    })
  }

})
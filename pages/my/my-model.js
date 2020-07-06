import {
  Base
} from '../../utils/base.js'

class My extends Base {
  constructor() {
    super();
  }

  // 得到用户信息
  getUserInfo(cb) {
    var that = this;
    wx.login({
      success: function() {
        wx.getUserInfo({
          success: function(res) {
            const data = {
              auth: true,
              userInfo: res.userInfo
            }
            typeof cb == "function" && cb(data);
            //将用户昵称 提交到服务器
            that.updateUserInfo(res.userInfo);
          },
          fail: function(res) {
            const data = {
              auth: false,
              userInfo: {
                avatarUrl: '../../imgs/icon/user@default.png',
                nickName: '点击显示微信头像'
              }
            }
            typeof cb == "function" && cb(data);
          }
        });
      },

    })
  }

  /*更新用户信息到服务器*/
  updateUserInfo(res) {
    const extend = {
      gender: res.gender,
      country: res.country,
      province: res.province,
      city: res.city,
    }
    var allParams = {
      url: 'user',
      data: {
        nickname: res.nickName,
        avatarUrl: res.avatarUrl,
        extend: JSON.stringify(extend)
      },
      type: 'post',
      sCallback: function(data) {}
    };
    this.request(allParams);
  }
}



export {
  My
}
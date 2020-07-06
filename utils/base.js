
import {Config} from '../utils/config.js';
import {Token} from 'token.js';

class Base{
  constructor(){
    this.baseRequestUrl = Config.restUrl;
  }

  /**
   * 自己封装的request方法
   * 当noRefetch为true时，不做未授权重试机制
   */
  request(params,noRefetch){
    var that = this;
    var url = this.baseRequestUrl + params.url;
    if(!params.type){
      params.type = 'GET';
    }
    wx.request({
      url: url,
      data: params.data,
      method: params.type,
      header: {
        'content-type':'application/json',
        'token':wx.getStorageSync('token')
      },
      success:function(res){
        var code = res.statusCode.toString();
        var startChar = code.charAt(0);//获取返回的状态码的第一个字符
        if(startChar == '2'){
          params.sCallback && params.sCallback(res.data);//如果回调函数存在，则调用回调函数
        }
        else{
          if(code == '401'){
            if(!noRefetch){
              that._refetch(params);
            }
          }
          else{
            params.eCallback && params.eCallback(res.data);
          }
        }
      },
      fail:function(err){
        console.log(err);
      }
    })
  }

  //如果返回401则先获得令牌，后再次发送原来的请求
  _refetch(params){
    var token = new Token();
    token.getTokenFromServer((token)=>{
      this.request(params,true);//箭头函数定义的回调函数不会改变环境变量，可以直接用this
    })

  }

  //获得元素上的绑定的值
  getDataSet(event,key){
    return event.currentTarget.dataset[key];
  }

}

export {Base};
// pages/home/home.js
Page({

  data: {

  },
  onLoad: function (options) {

  },
  onShow: function () {

  },
  // 签到
  onSignInClick: function () {
    wx.navigateTo({
      url: '/pages/home/signIn/signIn',
    }) 
  },
  // 我的任务
  onMyTaskClick: function () {
    wx.navigateTo({
      url: '/pages/home/myTask/myTask',
    }) 
  },
  // R豆兑换
  onRDouClick: function () {
    wx.navigateTo({
      url: '/pages/home/exchange/exchange',
    }) 
  },
  // 点击头像
  onMyIconClick: function () {
    console.log("onMyIconClick")
  },
  // 点击我的信息
  onMyInformationClick: function () {
    wx.navigateTo({
      url: '/pages/home/myInfor/myInfor',
    })
  },
  // 点击正在服务
  onServerceClick: function () {
    console.log("onServerceClick")
  },

})
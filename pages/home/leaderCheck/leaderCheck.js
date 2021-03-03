// pages/home/leaderCheck/leaderCheck.js
Page({
  data: {
    type: 0,
    hh: 0,
    content: [
      "提交后考核内容无法修改，三次未通过后自动取消负责人资格。",// type : 0
      "是否希望公开您的微信号，让同样优秀的志愿者伙伴找到您。"   // type : 1
    ],
  },
  onLoad: function (options) {
    let type = options.type
    this.setData({
      type: type
    })
    if (type == "0") {
      wx.setNavigationBarTitle({
        title: '负责人考核'
      })
    } else if (type == "1") {
      wx.setNavigationBarTitle({
        title: '确认提交'
      })
    }
  },
  onConfirmClick: function () {
    console.log("onConfirmClick")
  },
  onCancleClick: function () {
    console.log("onCancleClick")
  },

})
// pages/home/rollCall/rollCall.js
Page({
  data: {
    names: ["张三三", "李四", "王武", "刘六七", "陈八九", "刘9", "赵10"],
    trn: 3,
    thn: 1
  },
  onLoad: function (options) {
    let a = this.data.names.length / 3 
    let b = this.data.names.length % 3 
    let thn = 1
    thn = (b >= 1) ? a : (a - 1) 
    this.setData({
      thn: thn
    })
  },
  onShow: function (options) {

  },

})
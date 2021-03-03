// pages/signUp/signUp.js
Page({

  data: {
    list: [{
        "img": "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3432936553,706692562&fm=26&gp=0.jpg",
        "title": "第二十届Robotex世界机器人大会长三角选拔赛",
        "status": "1",
        "statusText": "可报名"
      },
      {
        "img": "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2659736568,2684110751&fm=26&gp=0.jpg",
        "title": "第二十届Robotex世界机器人大会上海选拔赛",
        "status": "2",
        "statusText": "取消报名"
      },
      {
        "img": "https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3262646514,3011510644&fm=26&gp=0.jpg",
        "title": "第二十届Robotex世界机器人大会北京选拔赛",
        "status": "3",
        "statusText": "未开始"
      },
      {
        "img": "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=360614843,2017605197&fm=26&gp=0.jpg",
        "title": "第二十届Robotex世界机器人大会总决赛",
        "status": "4",
        "statusText": "已结束"
      }
    ]
  },

  onLoad: function (options) {

  },
  sinUpButtonClick: function (e) {
    console.log(e.detail.value)
    let tag = e.currentTarget.dataset.btindex
    let status = this.data.list[tag].status
    if (status == "1") {
      wx.showToast({
        title: '可报名',
        duration: 2000,
        icon: false,
        mask: true
      })
      wx.navigateTo({
        url: '/pages/signUp/signUpDetail/signUpDetail',
      })
    } else if (status == "2") {
      wx.showToast({
        title: '取消报名',
        duration: 2000,
        icon: false,
        mask: true
      })
    } else if (status == "3") {
      wx.showToast({
        title: '报名还未开始',
        duration: 2000,
        icon: false,
        mask: true
      })
    } else if (status == "4") {
      wx.showToast({
        title: '报名已经结束',
        duration: 2000,
        icon: false,
        mask: true
      })
    }
  },

})
// pages/assessment/assessment.js
Page({

  data: {
    list: [{
        "img": "https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3432936553,706692562&fm=26&gp=0.jpg",
        "title": "第二十届Robotex世界机器人大会长三角选拔赛",
        "status": "1",
        "statusText": "已通过"
      },
      {
        "img": "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2659736568,2684110751&fm=26&gp=0.jpg",
        "title": "第二十届Robotex世界机器人大会上海选拔赛",
        "status": "2",
        "statusText": "开始测评"
      } 
    ]
  },

  onLoad: function (options) {

  },
  assessmentButtonClick: function (e) {
    console.log(e.detail.value)
    let tag = e.currentTarget.dataset.btindex
    let status = this.data.list[tag].status
    if (status == "1") {
      wx.showToast({
        title: '已通过',
        duration: 2000,
        icon: false,
        mask: true
      })
    } else if (status == "2") {
      wx.navigateTo({
        url: '/pages/assessment/confirm/confirm',
      })
    }  

  },

})
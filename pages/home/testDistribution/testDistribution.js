// pages/home/testDistribution/testDistribution.js
Page({
  data: {
    task:[
      { text:'任务一',value:0 },
      { text: '任务二', value: 1 },
      { text: '任务三', value: 2 },
      { text: '任务四', value: 3 },
    ],
    grade:[
      { text:'优秀志愿者',value:0 },
      { text: '良好', value: 1 },
      { text: '中等', value: 2 }, 
      { text: '较差', value: 3 }, 
    ],
    type: 0, // 0. 分配任务 1. 组员考评  
    heads: ["成员", "任务类型"],
    names: [{
        name: "张三",
        type: "舞台组",
        status: "已签到",
        task: "任务二",
        grade: "较差",
        tel: "15821781519"
      },
      {
        name: "李四",
        type: "裁判组",
        status: "已签到",
        task: "任务三",
        grade: "优秀志愿者",
        tel: "15831781618"
      },
      {
        name: "王五",
        type: "机动组",
        status: "已签到",
        task: "任务一",
        grade: "优秀志愿者",
        tel: "15821741618"
      },
      {
        name: "赵七",
        type: "评分组",
        status: "未签到",
        task: "任务一",
        grade: "良好",
        tel: "15821781648"
      }
    ]
  },
  onLoad: function (options) {
    let type = options.type
    if (type == 1) {
      this.setData({
        heads: ["成员", "任务考评"],
        type: type
      })
      wx.setNavigationBarTitle({
        title: '组员考评',
      })
    }
  },
  onShow: function (options) {

  },
  // 任务和考评下拉框选择结果
  valChange: function (e) { 
    let detail = e.detail 
    let type = this.data.type
    this.setData({
      result: detail
    })
    console.log("-- e --",e,detail,this.data.result) 
  },
  // 确认提交
  onConfirmClick: function () {
    console.log("onConfirmClick")
  },
})
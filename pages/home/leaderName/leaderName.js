// pages/home/leaderName/leaderName.js
Page({
  data: {
    type: 0, //0.负责人名单 1.考勤情况
    heads: ["组别", "负责人", "电话"],
    names: [{
      name: "张三",
      type: "舞台组",
      status: "已签到",
      tel: "15821781519"
    },
    {
      name: "李四",
      type: "裁判组",
      status: "已签到",
      tel: "15831781618"
    },
    {
      name: "王五",
      type: "机动组",
      status: "已签到",
      tel: "15821741618"
    }, 
    {
      name: "赵七",
      type: "评分组",
      status: "未签到",
      tel: "15821781648"
    }] 
  },
  onLoad: function (options) { 
    let type = options.type  
    if (type == 1) { 
      this.setData({
        heads: ["成员", "状态", "电话"],
        type: type
      })
      wx.setNavigationBarTitle({
        title: '考勤情况',
      })
    }
  },
  onShow: function (options) {

  },

})
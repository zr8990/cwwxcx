// pages/home/myTask/myTask.js
Page({
  data: {
    grade: "1", // 0.普通， 1.负责人
  },
  onLoad: function (options) {

  },
  onShow: function () {

  },
  // 1.1 点名
  onRollCallClick: function () {
    console.log("onRollCallClick")
    wx.navigateTo({
      url: '/pages/home/rollCall/rollCall',
    })
  },
  // 2.1 负责人考核
  onLeaderClick: function () {
    console.log("onLeaderClick")
    wx.navigateTo({ 
      url: `/pages/home/leaderCheck/leaderCheck?type=${"0"}`
    })
  },
  // 2.2 成员考核情况
  onMemberClick: function () {
    console.log("onMemberClick")
    wx.navigateTo({
      url: '/pages/home/memberCheck/memberCheck',
    })
  },
  // 2.3 分配任务
  onTaskClick: function () {
    wx.navigateTo({
      url: '/pages/home/testDistribution/testDistribution?type=0',
    })
    console.log("onTaskClick")
  },
  // 2.4 组员考评
  onTeamNoClick: function () {
    wx.navigateTo({
      url: '/pages/home/testDistribution/testDistribution?type=1',
    })
    console.log("onTeamNoClick")
  },

  // 3.1 负责人名录
  onDirectoriesClick: function () {
    console.log("onDirectoriesClick")
    wx.navigateTo({
      url: '/pages/home/leaderName/leaderName?type=0',
    })
  },
  // 3.2 考勤情况
  onCheckWorkClick: function () {
    console.log("onCheckWorkClick")
    wx.navigateTo({
      url: '/pages/home/leaderName/leaderName?type=1',
    })
  },
  // 3.3 特殊情况报备
  onReportClick: function () {
    console.log("onReportClick")
    wx.navigateTo({
      url: '/pages/home/report/report',
    })
  },

})
// pages/signUp/signUp.js
Page({

  data: {
    list: [{ 
        "title": "申请成为Robotex区域负责人",
        "selects": ["申请，我想成为负责人","不申请，我想做好本职工作"],
        "selected": "0",
        "type": "1"
      }, 
      { 
        "title": "是否参加过Robotex往届活动",
        "selects": ["是","否","保密"],
        "selected": "0",
        "type": "1"
      }, 
      { 
        "title": "往届活动场次 + 对应分组",
        "selects": null,
        "selected": "0",
        "type": "2"
      }, 

    ],
    option1:[
      { text:'裁判组',value:0 },
      { text: '物料组', value: 1 },
      { text: '机动组', value: 2 },
      { text: '舞台组', value: 3 },
    ],
    result: 0,
  },

  onLoad: function (options) {

  },
  valChange: function (e) { 
    let detail = e.detail 
    this.setData({
      result: detail
    })
    console.log("-- e --",e,detail,this.data.result) 
  },
  onSelctClick: function (e) {
    let index = e.currentTarget.dataset.index
    let selectTag = e.currentTarget.dataset.idx
    console.log("--- onSelctClick --- ", index,selectTag)
    let lastList = this.data.list
    let dict = lastList[index]
    dict.selected = selectTag
    lastList[index] = dict

    this.setData({
      list: lastList
    })
  },

})
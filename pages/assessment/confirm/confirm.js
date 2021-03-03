 
Page({

  data: {
    list: [{ 
        "title": "1.巡线机器人尺寸？",
        "selects": ["15*15","20*20","30*30"],
        "selected": "0",
        "type": "1"
      }, 
      { 
        "title": "2.巡线机器人入场检测开始时间？",
        "selects": ["9:00","9:40","10:00"],
        "selected": "0",
        "type": "1"
      }, 
      { 
        "title": "3.现场如何安排评分裁判和辅助裁判？",
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
    // debugger 
    let detail = e.detail 
    this.setData({
      result: detail
    })
    console.log("-- e --",e,detail,this.data.result)
    // let tag = e.currentTarget.dataset.btindex
    // let dict = this.data.option1[tag]
    // let value = dict.value 
    // console.log("-- value --",value)
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
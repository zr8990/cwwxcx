 const app = getApp()

 Component({
   properties: {
     isShow: {
       type: Boolean,
       value: true
     },
     title: {
       type: String,
       value: "标记意向"
     },
     list: {
       type: Array,
       value: ["高意向", "低意向", "无意向"]
     }
   },
   data: {
     tag: 0,
     result: 0,
     dialogShow: true,
     buttons: [{
       text: '取消'
     }, {
       text: '确定'
     }],
   },
   methods: {
     onSureClick: function () {
       let tags = this.data.tag;
       this.setData({
         result: tags
       })
       console.log("--- onSureClick ---", this.data.result, this.data.tag)
     },
     onClose: function () {
       console.log("--- onClose ---")
     },
     onSelctClick: function (e) {
       let selectTag = e.currentTarget.dataset.index
       console.log("--- onSelctClick --- ", selectTag)
       this.setData({
         tag: selectTag
       })
     },
     tapDialogButton(e) {
       let detail = e.detail
       console.log("detail----- ", detail.index, detail.item.text)
       if (detail.index == "1") {
         console.log("点击了确认按钮。。。")
       }
       this.setData({
         dialogShow: false
       })
     },
   }
 })
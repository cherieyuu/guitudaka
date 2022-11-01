// pages/modification/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        date: '1999-08-19',
        remind:'提前7天',
        inputdata:"",
        id:""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.setData({
        id:options.id,
        date:options.memorialDayTime=="undefined"?"请选择":options.memorialDayTime,
        remind:options.memorialDayNoticeTime=="undefined"?"请选择":options.memorialDayNoticeTime,
        inputdata:options.memorialDayName=="undefined"?"":options.memorialDayName
      })
    },
    bindDateChange: function (e) {
        this.setData({
          date: e.detail.value
        })
        
    },
    remind(){
      const that = this;
      const reminddata = ['提前7天', '提前15天', '提前一个月']
      wx.showActionSheet({
          itemList: ['提前7天', '提前15天', '提前一个月'],
          success (res) {
            that.setData({
                remind:reminddata[res.tapIndex]
            })
          },
          fail (res) {
            console.log(res.errMsg)
          }
      })
    },
    async preservation() {
      const that = this;
      await app.call({
        // 云函数名称
        name: 'wishes-520',
        // 传给云函数的参数
        data: {
            type: 'setMemorialDay',
            _id: this.data.id,
            memorialDayTime:that.data.date, // 纪念日
            memorialDayName:that.data.inputdata, // 纪念日名称
            memorialDayNoticeTime:that.data.remind, // 纪念日提醒
        },
      })
      wx.reLaunch({
        url: '/pages/minedata/index',
      })
    },
    inputvalue(e) {
      this.setData({
        inputdata:e.detail.value
      })
    },


    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
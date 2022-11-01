// pages/mtydream/index.js
const app = getApp()
const utils = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showIndex: -1,
    drawstatus: false,
    animation: -1,
    msgList: [],
    recipientId: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getParnerNotFinishWishes();
  },
  router(e) {
    const id = e.currentTarget.dataset.id
    const data = e.currentTarget.dataset.item
    var queryBean = JSON.stringify(data)
    wx.navigateTo({
      url: `../adddream/index?content=false&modifyshow=false&buttonshow=false&id=${id}&data=` + queryBean,
    })
  },
  async getParnerNotFinishWishes() {
    let that = this;
    await utils.openidData()
    that.setData({
      recipientId: wx.getStorageSync('recipientId'),
    })
    const res = await app.call({
      // 云函数名称
      name: 'wishes-520',
      // 传给云函数的参数
      data: {
        type: 'getParnerNotFinishWishes',
        openid: that.data.recipientId,
      }
    })
    console.log(res)
    that.setData({
      msgList: res.data.data
    })
    wx.stopPullDownRefresh()
  },
  borshow() {
    this.setData({
      animation: -1
    })
    if (this.data.drawstatus == true) {
      return;
    } else {
      this.setData({
        drawstatus: true,
      })
      var mathdata = '';
      var show_load = setInterval(() => {
        this.setData({
          showIndex: Math.floor(Math.random() * this.data.msgList.length)
        })
        mathdata = this.data.showIndex
      }, 300)
      setTimeout(() => {
        clearInterval(show_load);
        this.setData({
          showIndex: mathdata,
          drawstatus: false,
          animation: mathdata
        })
        wx.showToast({
          title: '愿望在闪烁  快实现愿望吧',
          icon: 'success',
          duration: 3000
        })
        setTimeout(() => {
          this.setData({
            showIndex: -1,
            animation: -1
          })
        }, 8000)
      }, 3000)
    }

  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getParnerNotFinishWishes();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    let user = wx.getStorageSync('user');
    let openid = wx.getStorageSync('userOpenid')
    console.log(`pages/shareappmessage/index?openid=${openid}&name=${user.nickName}&img=${user.avatarUrl}`)
    return {
      title: `${user.nickName}邀请你来实现愿望清单`,
      path: `pages/shareappmessage/index?openid=${openid}&name=${user.nickName}&img=${user.avatarUrl}`,
      imageUrl: "../../image/398f0452-72bd-4928-a1f3-b64ce425f2a9.png"
    }
  },
})
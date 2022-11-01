// pages/Completed/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        implementedshow:true,
        listData:"",
        openid:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            openid:options.id
        })
        this.getMeAndParnerNotFinishWishes();
    },
    implementedshow(){
        this.setData({
            implementedshow:!this.data.implementedshow
        })
    },
    async getMeAndParnerNotFinishWishes() {
        const that = this;
        const res = await app.call({
            // 云函数名称
            name: 'wishes-520',
            // 传给云函数的参数
            data: {
                type: 'getMeAndParnerNotFinishWishes',
                openid:wx.getStorageSync('recipientId'),
                data: {}
            }
        })
        that.setData({
            listData: res.data
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
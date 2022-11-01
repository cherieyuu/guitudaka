// pages/shareappmessage/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        Refuseshow:true,
        inviteropenid:"",
        inviterName:"",
        inviterimg:"",
        myopenid:"",
        show:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        this.setData({
            inviteropenid:options.openid,
            inviterName:options.name,
            inviterimg:options.img,
            myopenid:wx.getStorageSync('userOpenid'),
            show:false
        })
        if (options.openid == this.data.myopenid) {
            wx.reLaunch({
                url: '../mydream/index',
            })  
            return;
        }
        const res = await app.call({
            name:"wishes-520",
            data:{
                type:"getMyInvite",
            }
        })
        if (res.data) {
            wx.reLaunch({
                url: '../mydream/index',
            })
        }else{
            this.setData({
                show:true
            })
        }
    },
    async Confirm() {
        const user = wx.getStorageSync('user');
        await app.call({
            // 云函数名称
            name: 'wishes-520',
            // 传给云函数的参数
            data: {
                type: 'addInvite',
                data: [{
                    inviterName:this.data.inviterName,
                    inviterimg:this.data.inviterimg,
                    recipientName:user.nickName,
                    recipientimg:user.avatarUrl,
                    inviter:this.data.inviteropenid
                }]
            }
        })
        wx.reLaunch({
            url: '../tadream/index',
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
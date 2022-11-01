// pages/adddream/index.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        textarea: '如果你更详细地告诉我，说不定我\n给你一个更大的惊喜哟！😘',
        maskshow: false,
        maskdata: false,
        value: '如果你更详细地告诉我，说不定我\n给你一个更大的惊喜哟！',
        contentshow: 'true',
        modifyshow: false,
        buttonshow: false,
        ontips: false,
        switchvalue: false,
        dataList: "",
        id: "",
        title: "",
        recipientId: "",
        userOpenid: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.data) {
            this.setData({
                dataList: JSON.parse(options.data),
            })
        }
        this.setData({
            contentshow: options.content || false,
            modifyshow: options.modifyshow || false,
            buttonshow: options.buttonshow || false,
            id: options.id || false,
            value: this.data.dataList.content || "",
            title: this.data.dataList.title || "",
            switchvalue: this.data.dataList.share || "",
            recipientId: wx.getStorageSync('recipientId'),
        })
    },
    switch1Change(e) {
        this.setData({
            switchvalue: e.detail.value
        })
    },
    // 修改愿望按钮
    async modifybutton() {
        try {
            const res = await app.call({
                // 云函数名称
                name: 'wishes-520',
                // 传给云函数的参数
                data: {
                    type: 'updateWish',
                    _id: this.data.id,
                    title: this.data.title,
                    content: this.data.value,
                    share: this.data.switchvalue,
                }
            })
            if (res.success == true) {
                wx.showToast({
                    title: '更新成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(() => {
                    wx.reLaunch({
                        url: '/pages/mydream/index',
                    })
                }, 500)
            }
        } catch (error) {
            wx.showToast({
                title: '修改失败，请重试',
                icon: 'success',
                duration: 2000
            })
        }
    },
    // 删除愿望按钮
    async configdelete() {
        try {
            let that = this;
            const res = await app.call({
                // 云函数名称
                name: 'wishes-520',
                // 传给云函数的参数
                data: {
                    type: 'deleteWish',
                    _id: this.data.id
                }
            })
            if (res.success == true) {
                that.offtips();
                setTimeout(() => {
                    wx.reLaunch({
                        url: '/pages/mydream/index',
                    })
                }, 500)
            }
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
            })
        } catch (error) {
            wx.showToast({
                title: '删除失败，请重试',
                icon: 'error',
                duration: 2000
            })
        }
    },
    // 添加愿望按钮
    async createWishes() {
        if (this.data.title && this.data.value) {
            try {
                let nickname = wx.getStorageSync('user').nickName;
                const res = await app.call({
                    // 云函数名称
                    name: 'wishes-520',
                    // 传给云函数的参数
                    data: {
                        type: 'createWishes',
                        data: [{
                            creatorName: wx.getStorageSync('user').nickName,
                            title: this.data.title,
                            content: this.data.value,
                            share: this.data.switchvalue,
                        }]
                    }
                })
                wx.reLaunch({
                    url: '/pages/mydream/index',
                })
            } catch (error) {
                wx.showToast({
                    title: '许愿失败，请重试',
                    icon: 'error',
                    duration: 2000
                })
            }
        } else {
            wx.showToast({
                title: '请输入标题和更多信息',
                icon: 'error',
            })
        }
    },
    inputTitle(e) {
        this.setData({
            title: e.detail.value
        })
    },
    ontips() {
        this.setData({
            ontips: true
        })
    },
    offtips() {
        this.setData({
            ontips: false
        })
    },
    onMask() {
        if (this.data.maskdata) {
            return;
        }

        this.setData({
            maskshow: true,
            maskdata: true
        })
        if (this.data.maskshow === true) {
            const mask = setTimeout(() => {
                this.setData({
                    maskshow: false
                })
            }, 2000)
            setTimeout(() => {
                this.setData({
                    maskdata: false
                })
                clearInterval(mask)
            }, 2000);
        }
    },
    offMask() {
        this.setData({
            maskshow: false
        })
    },
    bindinput(e) {
        this.setData({
            value: e.detail.value
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
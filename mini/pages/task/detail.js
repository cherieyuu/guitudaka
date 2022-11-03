const { getDay } = require("../../utils/util");

// pages/task/detail.js
const db = wx.cloud.database();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        taskPunchList: [],
        taskId: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({taskId: options.taskId});
        this.getTaskPunchList();
    },

    async getTaskPunchList() {
        const getTaskPunchListResp = await db.collection('task_punch').where({
            task_id: this.data.taskId
        }).get();
        const taskPunchList = getTaskPunchListResp.data.map((item) => {
            item.punch_time = getDay(new Date(item.punch_time));
            return item;
        })
        console.log(taskPunchList);
        this.setData({ taskPunchList });
    },

    deleteTask() {
        db.collection('task').doc(this.data.taskId).update({
            data: {
                is_deleted: true,
                delete_time: Date.now(),
            }
        }).then(() => wx.navigateBack());
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
import * as echarts from '../../ec-canvas/echarts';
const { getDay } = require("../../utils/util");

// pages/task/detail.js
const db = wx.cloud.database();
let chart;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        userCreateTime: null,

        taskPunchList: [],
        taskId: '',

        ec: {
            lazyLoad: true
        }
    },

    setChart: function(option) {
        this.chartComponent.init((canvas, width, height) => {
            chart = echarts.init(canvas, null, {
                width: width,
                height: height
            })
            console.log('chart22222', chart);
            chart.setOption(option);
            return chart;
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({taskId: options.taskId});
        this.getUserCreateTime();
        this.getTaskPunchList().then(() => { // 因为HTML中有if，会得到打卡列表后才渲染DOM
            this.getBarChartData();
            this.chartComponent = this.selectComponent('#mychart-dom-bar');
        });

    },

    getUserCreateTime() {
        db.collection('user')
            .where({
                _id: wx.getStorageSync('userId'),
            })
            .get()
            .then((res) => {
                const daySecond = 24 * 60 * 60 * 1000; // 一天的毫秒值
                const create_time = res.data[0].create_time - res.data[0].create_time % daySecond;
                this.setData({userCreateTime: create_time})
            })
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
        return this.setData({ taskPunchList });
    },

    async getBarChartData() {
        // 如果不加冗余字段，需要在groupby里写函数
        // select count(*) 
        //     from task_punch
        //     where (task_id = taskId and punch_time > start_time)
        //     group by (floor(punch_time - start_time) / interval)
        //     order by punch_time
        const dbBarChartData = await db.collection('task_punch')
        .aggregate()
        .match({
            task_id: this.data.taskId
        })
        .group({
            _id: '$punch_time',
            groupCount: db.command.aggregate.sum(1)
        })
        .end()
        console.log('dbBarChartData', dbBarChartData);

        // 数据补零
        // 获得天数
        const dayRange = parseInt((Date.now() - this.data.userCreateTime) / (1000 * 60 * 60 * 24)) + 1;
        const barChartDataXaxis = [];
        const barChartDataYaxis = [];
        for (let i = 0; i < dayRange; i++) {
            const date = new Date(this.data.userCreateTime + i * 86400000);
            const y = date.getFullYear();
            const m = date.getMonth() + 1;
            const d = date.getDate();
            const dayText = y + '-' + m + '-' + d;
            barChartDataXaxis.push(dayText);
            let hasPush = false;
            dbBarChartData.list.map((item) => {
                if (item._id > this.data.userCreateTime + i * 86400000 && item._id < this.data.userCreateTime + ( i + 1 ) * 86400000 ) {
                    barChartDataYaxis.push(item.groupCount);
                    hasPush = true;
                }
            })
            if (!hasPush) barChartDataYaxis.push(0);
            console.log(i, barChartDataXaxis, barChartDataYaxis);
        }

        // const barChartDataXaxis = dbBarChartData.list.map((item) => {
        //     const date = new Date(item._id);
        //     return `${date.getMonth() + 1}-${date.getDate()}`;
        // })
        // const barChartDataYaxis = dbBarChartData.list.map((item) => {
        //     return item.groupCount;
        // })

        const option = {
            xAxis: {
                data: barChartDataXaxis
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: barChartDataYaxis,
                    type: 'bar'
                }
            ]
        }
        console.log('chart1111', chart);
        this.setChart(option);
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
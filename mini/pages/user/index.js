// pages/user/index.js
import * as echarts from '../../ec-canvas/echarts';

const db = wx.cloud.database();
let chart;
let userId;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userinfo: null,

        ec: {
            lazyLoad: true
        },
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
        console.log('onLoad');
        userId = wx.getStorageSync('userId');
        this.setData({ userinfo: wx.getStorageSync('user') })
        this.chartComponent = this.selectComponent('#mychart-dom-heatmap');
        this.getUserHeatmap();
    },

     async getUserHeatmap() {
        wx.showLoading({
            title: 'loading...',
            mask: true,
        })
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const dbHeatmapChartData = await db.collection('task_punch')
            .aggregate()
            .match({
                user_id: userId,
                punch_year: year,
                punch_month: month,
            })
            .group({
                _id: '$punch_day',
                groupCount: db.command.aggregate.sum(1)
            })
            .end()
        console.log('dbHeatmapChartData', dbHeatmapChartData);
        const heatmapChartData = dbHeatmapChartData.list.map((item) => [`${year}-${month}-${item._id}`, item.groupCount]);
        console.log('heatmapChartData', heatmapChartData);

        const option = {
            visualMap: {
                min: 0,
                max: 10,
                type: 'continuous',
                orient: 'horizontal',
                left: 'center',
                top: 0,
                left: 10,
                itemWidth: 10,
                itemHeight: 50,
                text: [10, 0],
                inRange: {
                    color: ["#74add1", "#4575b4", "#313695"]
                  }
            },
            calendar: {
                top: 30,
                left: 30,
                right: 30,
                cellSize: [10, 12],
                range: `${year}-${month}`,
                borderWidth: 0.1,
                itemStyle: {
                    borderWidth: 0.2,
                    color: '#b8b8b8',
                    borderColor: '#00000033',
                },
                yearLabel: { show: false }
            },
            series: {
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: heatmapChartData
            },
            tooltip: {}
        }
        this.setChart(option);
        wx.hideLoading();
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
        this.getUserHeatmap();
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

    },

    toUserGuide() {
        wx.navigateTo({
          url: './guide',
        })
    }
})
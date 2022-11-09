import * as echarts from '../../ec-canvas/echarts';
const { getDay } = require("../../utils/util");

// pages/task/detail.js
const db = wx.cloud.database();

function initChart(canvas, width, height) {
    const chart = echarts.init(canvas, null, {
        width: width,
        height: height
    })
    canvas.setChart(chart);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            confine: true
            },
            legend: {
            data: ['热度', '正面', '负面']
            },
            grid: {
            left: 20,
            right: 20,
            bottom: 15,
            top: 40,
            containLabel: true
            },
            xAxis: [
            {
                type: 'value',
                axisLine: {
                lineStyle: {
                    color: '#999'
                }
                },
                axisLabel: {
                color: '#666'
                }
            }
            ],
            yAxis: [
            {
                type: 'category',
                axisTick: { show: false },
                data: ['汽车之家', '今日头条', '百度贴吧', '一点资讯', '微信', '微博', '知乎'],
                axisLine: {
                lineStyle: {
                    color: '#999'
                }
                },
                axisLabel: {
                color: '#666'
                }
            }
            ],
            series: [
            {
                name: '热度',
                type: 'bar',
                label: {
                normal: {
                    show: true,
                    position: 'inside'
                }
                },
                data: [300, 270, 340, 344, 300, 320, 310],
                itemStyle: {
                // emphasis: {
                //   color: '#37a2da'
                // }
                }
            },
            {
                name: '正面',
                type: 'bar',
                stack: '总量',
                label: {
                normal: {
                    show: true
                }
                },
                data: [120, 102, 141, 174, 190, 250, 220],
                itemStyle: {
                // emphasis: {
                //   color: '#32c5e9'
                // }
                }
            },
            {
                name: '负面',
                type: 'bar',
                stack: '总量',
                label: {
                normal: {
                    show: true,
                    position: 'left'
                }
                },
                data: [-20, -32, -21, -34, -90, -130, -110],
                itemStyle: {
                // emphasis: {
                //   color: '#67e0e3'
                // }
                }
            }
            ]
    }
    chart.setOption(option);
    return chart;
}

Page({
    /**
     * 页面的初始数据
     */
    data: {
        taskPunchList: [],
        taskId: '',

        ec: {
            onInit: initChart
        }
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
const { getDay, getCurrentDayStart, getCurrentDayEnd } = require("../../utils/util");

// pages/task/index.js
const app = getApp()
const db = wx.cloud.database();
let userId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: "",
    taskList: [],
    taskDonePercent: 0,

    currentDay: "",
    showToday: true,
    userStartDay: "",
    userEndDay: "",

    // 滑动的起始坐标
    startX: 0,
    startY: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // this.Listdata();
    // this.init();
    userId = wx.getStorageSync('userId');
    this.initUserDay();
    this.setCurrentDay(getDay(new Date()));
    this.getTaskList();
  },
  async initUserDay() {
    const userResp = await db.collection('user').doc(userId).get();
    const userStartDay = getDay(new Date(userResp.data.create_time));
    const userEndDay = getDay(new Date());
    this.setData({
      userStartDay,
      userEndDay,
    })
    console.log(this.data.userStartDay, this.data.userEndDay);
  },
  setCurrentDay(day) {
    this.setData({
      currentDay: day,
    })
  },
  async getTaskList() {
    let data, taskListResp;
    const currentDayStart = getCurrentDayStart(this.data.currentDay);
    const currentDayEnd = getCurrentDayEnd(this.data.currentDay);
    if (this.data.showToday) {
        taskListResp = await db.collection('task')
          .where({
            user_id: userId,
            is_deleted: false,
          })
          .get();
    } else {
        taskListResp = await db.collection('task')
            .where(
                db.command.or([
                    {
                        user_id: userId,
                        create_time: db.command.lt(currentDayEnd),
                        is_deleted: false,
                    },
                    {
                        user_id: userId,
                        create_time: db.command.lt(currentDayEnd),
                        is_deleted: true,
                        delete_time: db.command.gt(currentDayEnd),
                    }
                ])
            )
            .get();  
    }
    console.log('taskListResp', taskListResp);
    data = await Promise.all(taskListResp.data.map(async (taskItem) => {
      const getTaskPunchResp =  await db.collection('task_punch')
        .where({
          task_id: taskItem._id,
          punch_time: db.command.gt(currentDayStart).and(db.command.lt(currentDayEnd))
        })
        .get();
      console.log(getTaskPunchResp);
      if (getTaskPunchResp.data.length > 0) {
        taskItem.isDone = true;
      } else {
        taskItem.isDone = false;
      }
      return taskItem;
    }));
    this.setData({ taskList: data });
    this.updateTaskPercent();

    // await db.collection('task').where({
    //   user_id: userId
    // }).get().then(async (res) => {
    //   console.log(res);
    
      // data = await res.data.map(async (taskItem) => {
      //   await db.collection('task_punch').where({
      //     task_id: taskItem._id,
      //     // punch_time: 
      //   }).get().then(getTaskPunchRes => {
      //     console.log('getTaskPunchRes', getTaskPunchRes);
      //     if (getTaskPunchRes.data.length > 0) {
      //       taskItem.isDone = true;
      //     } else {
      //       taskItem.isDone = false;
      //     }
      //   })
      // })
      // this.setData({ taskList: data });
    //   console.log('getTaskList', this.data.taskList);
    // });
  },
  updateTaskPercent() {
    let doneTaskNum = 0;
    this.data.taskList.map((taskItem) => {
      if (taskItem.isDone) {
        doneTaskNum++;
      }
    })
    if (doneTaskNum === 0) return;
    const newPercent = doneTaskNum / this.data.taskList.length * 100;
    this.setData({ taskDonePercent: newPercent});
  },
  router(e) {
    const id = e.currentTarget.dataset.id
    const data = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `./detail?taskId=${id}`,
    })
    // var queryBean = JSON.stringify(data)
    // wx.navigateTo({
    //   url: `../adddream/index?content=true&modifyshow=false&buttonshow=true&id=${id}&data=` + queryBean,
    // })
  },
  async complete(e) {
    console.log(e);
    db.collection('task_punch').add({
      data: {
        task_id: e.currentTarget.dataset.id,
        punch_time: Date.now()
      }
    }).then(() => {
      this.getTaskList();
      wx.showToast({
        title: '恭喜实现愿望！',
        icon: 'success',
        duration: 2000
      })
    });
  },
  addrouter() {
    const that = this;
    wx.showModal({
      title: '创建新任务',
      cancelColor: 'cancelColor',
      editable: true,
      placeholderText: '请输入任务内容',
      confirmText: '提交',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定', res);
          db.collection('task').add({
            data: {
              user_id: userId,
              task_des: res.content,
              create_time: Date.now(),
              is_deleted: false,
            }
          }).then(() => that.getTaskList());
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    // wx.navigateTo({
    //   url: `../adddream/index?content=${true}&modifyshow=${true}&buttonshow=${false}`,
    // })
  },

  setShowToday(v) {
      this.setData({ showToday: v })
  },

  bindDatePickerChange(e) {
    this.setCurrentDay(e.detail.value);
    if (this.data.currentDay !== getDay(new Date())) {
        this.setShowToday(false);
    } else {
        this.setShowToday(true);
    }
    this.getTaskList();
  },

  init() {
    // 设置是否完成为false
    let {
      taskList
    } = this.data
    for (let i = 0; i < taskList.length; i++) {
      taskList[i].isMove = false;
    }
    this.setData({
      taskList
    })
  },

  // 开始触摸，记录起始点的坐标
  touchstart(e) {
    let {
      taskList
    } = this.data
    // 重置所有删除
    taskList.map(i => {
      i.isMove = false
    })

    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      taskList
    })
  },

  // 开始移动
  touchmove(e) {
    let {
      index
    } = e.currentTarget.dataset
    let {
      startX,
      startY,
      taskList
    } = this.data
    let {
      clientX,
      clientY
    } = e.changedTouches[0]
    //获取滑动角度
    let angle = this.angle({
      X: startX,
      Y: startY
    }, {
      X: clientX,
      Y: clientY
    });
    //滑动超过30度角 return
    if (Math.abs(angle) > 30) return;
    taskList.forEach((i, j) => {
      i.isMove = false
      if (j == index && clientX < startX) {
        // 左滑删除了
        i.isMove = true
      } else {
        // 右滑没有隐藏删除按钮
        i.isMove = false
      }
    })
    this.setData({
        taskList
    })
  },

  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle(start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
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
    this.getTaskList();
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
    this.Listdata();
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
})

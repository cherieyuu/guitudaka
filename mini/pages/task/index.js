const { getDay, getCurrentDayStart, getCurrentDayEnd } = require("../../utils/util");

// pages/task/index.js
const app = getApp()
const db = wx.cloud.database();
let userId;
let sharePicUrl;

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
    startY: 0,

    // 海报
    isShowPoster: false,
    width: 0,
    height: 0,
    ratio: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // this.Listdata();
    // this.init();
    console.log('onLoad', this.data);
    userId = wx.getStorageSync('userId');
    this.setData({ userInfo: wx.getStorageSync('user') });
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
    wx.showLoading({
      title: 'loading...',
      mask: true,
    })
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
    wx.hideLoading();

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
    if (doneTaskNum === 0) return this.setData({ taskDonePercent: 0 });
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
    const cTime = new Date();
    db.collection('task_punch').add({
      data: {
        task_id: e.currentTarget.dataset.id,
        punch_time: cTime.getTime(),
        punch_year: cTime.getFullYear(),
        punch_month: cTime.getMonth() + 1, // getMonth return [0, 11]
        punch_day: cTime.getDate(),
        user_id: userId,
      }
    }).then(() => {
      this.getTaskList();
      wx.showToast({
        title: '打卡完成！',
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
    console.log('onShow', this.data);
    userId = wx.getStorageSync('userId');
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

  generatePoster() {
    this.setData({
      isShowPoster: true,
    })

    wx.showLoading({
      title: '生成海报中～',
      mask: true,
    });
    this.setData({
      hidden: 'hidden'
    });

    wx.createSelectorQuery().select('#posterCanvas')
    .fields({
      node: true,
      size: true
    })
    .exec(async (res) => {
      const cvs = res[0].node;
      const width = res[0].width;
      const height = res[0].height;
      cvs.width = 800;
      cvs.height = 1200;
      const ctx = cvs.getContext('2d');

      // const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      // for (let i = 0; i < imageData.data.length; i += 4) {
      //   // 当该像素是透明的，则设置成白色
      //   if (imageData.data[i + 3] === 0) {
      //     imageData.data[i] = 255;
      //     imageData.data[i + 1] = 255;
      //     imageData.data[i + 2] = 255;
      //     imageData.data[i + 3] = 255;
      //   }
      // }
      // ctx.putImageData(imageData, 0, 0);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, cvs.width, cvs.height);

      const bg_img = cvs.createImage();
      await new Promise(resolve => {
        bg_img.onload = resolve;
        bg_img.src = "../../image/bg/poster_bg.jpg";
      })
      ctx.drawImage(bg_img, 0, 0, 800, 900);

      const guitu_code_img = cvs.createImage();
      await new Promise(resolve => {
        guitu_code_img.onload = resolve;
        guitu_code_img.src = '../../image/code/guitu_wxcode.jpg';
      })
      ctx.drawImage(guitu_code_img, 640, 1040, 150, 150);

      ctx.fillStyle = "#cccccc";
      ctx.font = '26px 楷体'
      ctx.fillText('龟兔打卡', 30, 1140);
      ctx.fillText('记录每一点滴成长', 30, 1180);

      ctx.fillStyle = "white";
      ctx.shadowColor = '#cccccc';
      ctx.shadowBlur = 20;
      ctx.fillRect(100, 650, 600, 400);

      ctx.lineWidth = 1;
      ctx.strokeStyle = '#cccccc';
      ctx.beginPath();
      ctx.moveTo(130, 800);
      ctx.lineTo(670, 800);
      ctx.closePath();
      ctx.stroke();

      ctx.save();
      const avatar_img = cvs.createImage();
      await new Promise(resolve => {
        wx.downloadFile({
          url: this.data.userInfo.avatarUrl,
          success: (downFileRes) => {
            avatar_img.onload = resolve;
            avatar_img.src = downFileRes.tempFilePath;
          }
        });
      })
      ctx.arc(180, 720, 60, 0, Math.PI * 2, false);
      ctx.clip();
      ctx.drawImage(avatar_img, 120, 660, 120, 120);
      ctx.restore();
      
      ctx.fillStyle = "#333333";
      ctx.font = '30px 楷体'
      ctx.fillText(this.data.userInfo.nickName, 260, 710);
      ctx.fillStyle = "#999999";
      ctx.font = '20px 楷体'
      ctx.fillText(this.data.currentDay, 260, 750);

      ctx.fillStyle = "#967bb7";
      ctx.font = '40px 楷体'
      ctx.fillText('今日已打卡:', 120, 850);
      ctx.fillStyle = "#333333";
      ctx.font = '30px 楷体'
      this.data.taskList.map((item, index) => {
        ctx.fillText('- ' + item.task_des, 140, 870 + 30 * ( index + 1 ));
      })

      wx.canvasToTempFilePath({
        canvas: cvs,
        success: (res) => {
          wx.hideLoading();
          sharePicUrl = res.tempFilePath;
        }
      })
    })
  },

  savePoster() {
    wx.saveImageToPhotosAlbum({
      filePath: sharePicUrl,
      success: (res) => {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
        })
      }
    })
  },

  setShowPosterFalse() {
    this.setData({
      isShowPoster: false,
    })
  }
})

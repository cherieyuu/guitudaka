const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const getDay = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${[year, month, day].map(formatNumber).join('/')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}
const openidData = async () => {
  const openid = wx.getStorageSync('userOpenid')
  const res = await getApp().call({
    // 云函数名称
    name: 'wishes-520',
    // 传给云函数的参数
    data: {
      type: 'getMyInvite',
    }
  })
  // that.setData({
  //     datalist:res.result.data,
  //     day:that.timesize(that.data.newtime,res.result.data.memorialDayTime)||0
  // })
  try {
    wx.setStorageSync('recipientId', res.data.inviter == openid ? res.data.recipient : res.data.inviter)
  } catch (error) {
    wx.removeStorageSync('recipientId');
  }
}

// day: 2022/11/1
const getCurrentDayStart = day => {
  return Date.parse(day);
}

const getCurrentDayEnd = day => {
  return Date.parse(day + ' 23:59:59');
}

module.exports = {
  formatTime,
  openidData,
  getDay,
  getCurrentDayStart,
  getCurrentDayEnd
}
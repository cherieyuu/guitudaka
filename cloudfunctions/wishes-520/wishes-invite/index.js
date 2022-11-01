const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 创建邀请
exports.addInvite = async (event, context) => {
  const { data } = event
  let { OPENID, APPID } = cloud.getWXContext() 
  try {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      await db.collection('wishes-invite').add({
        data: {
          inviter: item.inviter, // 邀请者 openid
          inviterName: item.inviterName, // 邀请者昵称
          recipient: OPENID, // 接受者
          inviterimg:item.inviterimg,
          recipientName: item.recipientName, // 接受者昵称
          recipientimg:item.recipientimg,
          isAccept: true, // 是否接受
          isReply: false, // 是否回复
          inviterTime: new Date(), // 创建时间
          updateTime: new Date(), // 修改时间
          memorialDayTime: 0, // 纪念日
          memorialDayName: '', // 纪念日名称
          memorialDayNoticeTime: 0, // 纪念日提醒
        }
      })
    }
    return {
      success: true,
      data: event.data
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};


// 获取自身邀请情况
// 可能是自己邀请的，也可能是别人邀请的
exports.getMyInvite = async (event, context) => {
  let { OPENID } = cloud.getWXContext() 
  try {
    const inviteFromMyself = await db.collection('wishes-invite').where({
      inviter: OPENID,
    }).get()
    const inviteFromParner = await db.collection('wishes-invite').where({
      recipient: OPENID,
    }).get()
    console.log(inviteFromMyself.data.length,inviteFromParner.data.length);
    return {
      success: true,
      data: inviteFromMyself.data[inviteFromMyself.data.length-1] || inviteFromParner.data[inviteFromParner.data.length-1],
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 处理邀请
exports.handleInvite = async (event, context) => {
  const { _id, isAccept, recipientName } = event
  let { OPENID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  try {
    await db.collection('wishes-invite').doc(_id).update({
      data: {
        isAccept,
        recipient: OPENID, // 接受者
        recipientName, // 接受者昵称
      },
    })
    return {
      success: true,
      data: event.data
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 设置纪念日
exports.setMemorialDay = async (event, context) => {
  const { memorialDayTime, memorialDayName, memorialDayNoticeTime } = event
  // 返回数据库查询结果
  try {
    // 遍历修改数据库信息
    await db.collection('wishes-invite').doc(event._id).update({
      // data 传入需要局部更新的数据
      data: {
        memorialDayTime, // 纪念日
        memorialDayName, // 纪念日名称
        memorialDayNoticeTime, // 纪念日提醒
      },
      success: function(res) {
        console.log(res.data)
      }
    })
    return {
      success: true,
      data: event.data
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 修改ta
exports.updateMyInvite = async (event, context) => {
  // 返回数据库查询结果
  try {
    // 遍历修改数据库信息
    await db.collection('wishes-invite').doc(event._id).remove();
    return {
      success: true,
      data: event.data
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};


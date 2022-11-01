const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
// 创建愿望
exports.createWishes = async (event, context) => {
  const {
    data
  } = event
  let {
    OPENID,
  } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  try {
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      await db.collection('wishes').add({
        data: {
          creatorOpenId: OPENID, // 创建用户 openid
          creatorName: item.creatorName, // 创建用户昵称
          createTime: new Date(), // 创建时间
          updateTime: new Date(), // 修改时间
          title: item.title, // 愿望 title
          content: item.content, // 愿望 content
          finish: false, // 是否完成，初始时 flase
          share: item.share, // 是否分享
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

// 获取我自己创建但没有完成的愿望
exports.getMyNotFinishWishes = async (event, context) => {
  let {
    OPENID,
  } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  try {
    const wishes = await db.collection('wishes').where({
      creatorOpenId: OPENID,
      finish: false,
    }).get() || [];
    return {
      success: true,
      data: wishes,
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 获取搭档创建但没有完成的愿望
exports.getParnerNotFinishWishes = async (event, context) => {
  try {
    const wishes = await db.collection('wishes').where({
      creatorOpenId: event.openid,
      finish: false,
      share:true
    }).get() || [];
    return {
      success: true,
      data: wishes,
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 获取和我自己和搭档且完成的愿望
exports.getMeAndParnerNotFinishWishes = async (event, context) => {
  let {
    OPENID,
  } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  // 返回数据库查询结果
  try {
    const myFinishWishes = await db.collection('wishes').where({
      creatorOpenId: OPENID,
      finish: true,
    }).get();
    const myParnerFinishWishes = await db.collection('wishes').where({
      creatorOpenId: event.openid,
      finish: true,
    }).get();
    console.log(myFinishWishes,myParnerFinishWishes);
    return {
      success: true,
      data: [...myFinishWishes.data, ...myParnerFinishWishes.data],
    }
  } catch (e) {
    return {
      success: false,
      errMsg: e
    };
  }
};

// 更新愿望
exports.updateWish = async (event, context) => {
  const { title, content, share } = event
  try {
    await db.collection('wishes').doc(event._id).update({
      data: {
        updateTime: new Date(), // 修改时间
        title:title, // 愿望 title
        content:content, // 愿望 content
        share:share, // 是否分享
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

// 完成愿望
exports.finishWish = async (event, context) => {
  try {
    await db.collection('wishes').doc(event._id).update({
      data: {
        updateTime: new Date(), // 修改时间
        finish: true,
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

// 删除愿望
exports.deleteWish = async (event, context) => {
  try {
    await db.collection('wishes').doc(event._id).remove()
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
// 获取当前OPENID
exports.userOpenid = async (event,context) => {
  try {
    let { OPENID } = cloud.getWXContext()
    return {
      success:true,
      data:OPENID
    }
  }catch{
    return {
      success: false,
      errMsg: e
    };
  }
}
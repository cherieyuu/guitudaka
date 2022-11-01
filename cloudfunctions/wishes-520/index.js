const wishesHandler = require('./wishes/index');
const wishesInviteHandler = require('./wishes-invite/index');

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'createWishes':
      return await wishesHandler.createWishes(event, context);
    case 'getMyNotFinishWishes':
      return await wishesHandler.getMyNotFinishWishes(event, context);
    case 'getParnerNotFinishWishes':
      return await wishesHandler.getParnerNotFinishWishes(event, context);
    case 'getMeAndParnerNotFinishWishes':
      return await wishesHandler.getMeAndParnerNotFinishWishes(event, context);
    case 'updateWish':
      return await wishesHandler.updateWish(event, context);
    case 'finishWish':
      return await wishesHandler.finishWish(event, context);
    case 'deleteWish':
      return await wishesHandler.deleteWish(event, context);
    case 'addInvite':
      return await wishesInviteHandler.addInvite(event, context);
    case 'getMyInvite':
      return await wishesInviteHandler.getMyInvite(event, context);
    case 'handleInvite':
      return await wishesInviteHandler.handleInvite(event, context);
    case 'setMemorialDay':
      return await wishesInviteHandler.setMemorialDay(event, context);
    case 'userOpenid':
      return await wishesHandler.userOpenid(event, context);
    case 'updateMyInvite':
      return await wishesInviteHandler.updateMyInvite(event, context);
  }
};
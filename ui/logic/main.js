import state, {actions, swarm} from './state';
import {currentId} from './identity';
import {AudioState} from './audio';
import {Reactions} from './reactions';
import {RoomState} from './room';
import {is, set} from 'use-minimal-state';
import {
  declare,
  declareStateRoot,
  merge,
  use,
  useAction,
} from '../lib/state-tree';
import {populateCache} from './GetRequest';
import {ConnectRoom} from './connect';
import ModeratorState from './room/ModeratorState';
import {useDidChange} from '../lib/state-utils';
import {staticConfig} from './config';

export {
  jamSetup,
  enterRoom,
  leaveRoom,
  leaveStage,
  sendReaction,
  dispatch as dispatchAppState,
};
export {addRole, removeRole} from './room';
export {addAdmin, removeAdmin, useIdentityAdminStatus} from './admin';

let {dispatch} = declareStateRoot(AppState, state, [
  'roomId',
  'userInteracted',
  'micMuted',
  'leftStage',
]);

function AppState() {
  let inRoom = null;
  let leftStage = false;

  return function AppState({roomId, userInteracted, micMuted}) {
    let myId = currentId();
    let {room, hasRoom, iAmSpeaker, iAmModerator} = use(RoomState, {
      roomId,
      myId,
    });
    let {closed, moderators} = room;

    // connect with signaling server
    declare(ConnectRoom, {roomId, shouldConnect: hasRoom});
    declare(ModeratorState, {moderators});

    let [isJoinRoom, joinedRoomId] = useAction(actions.JOIN);
    if (!roomId || (closed && !iAmModerator)) {
      inRoom = null;
    } else if (isJoinRoom) {
      inRoom = joinedRoomId;
    }

    let [isLeaveStage] = useAction(actions.LEAVE_STAGE);
    let iBecameSpeaker = useDidChange(iAmSpeaker) && iAmSpeaker;
    if (iBecameSpeaker) {
      leftStage = false;
    }
    if (isLeaveStage && iAmSpeaker) {
      leftStage = true;
    }

    is(swarm.myPeerState, {
      micMuted,
      inRoom: !!inRoom,
      leftStage,
    });

    declare(Reactions);

    userInteracted = userInteracted || !!inRoom;
    return merge(
      {userInteracted, inRoom, room, iAmSpeaker, iAmModerator, leftStage},
      declare(AudioState, {inRoom})
    );
  };
}

// TODO: these shouldn't have global access to `dispatch`
// could have a function that returns the Jam API, e.g.
// 1.) () => [state, {enterRoom, leaveRoom, ...}]
// 2.) () => [state, dispatch] and only state/dispatch are used to call into Jam
// I prefer 1., and to err on the side of passing around `state` to achieve most things (via set(state, ...), dispatch(state, ...))
function enterRoom(roomId) {
  dispatch(actions.JOIN, roomId);
  // is(state, {roomId, inRoom: roomId});
}

function leaveRoom() {
  dispatch(actions.JOIN, null);
  // is(state, 'inRoom', null);
}

function leaveStage() {
  dispatch(actions.LEAVE_STAGE);
}

function sendReaction(reaction) {
  dispatch(actions.REACTION, reaction);
}

function jamSetup({jamConfig, cachedRooms}) {
  if (jamConfig) set(staticConfig, jamConfig);
  if (cachedRooms) {
    for (let roomId in cachedRooms) {
      populateCache(`/rooms/${roomId}`, cachedRooms[roomId]);
    }
  }
}

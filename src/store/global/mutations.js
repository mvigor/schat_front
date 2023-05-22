import { encrypt, decrypt, sharedA, sharedB, decodeKey } from '../../encryption'


export function setKeyData (state, payload) {
  state.keyData = payload;
}

export function setNickname(state, payload) {
  state.nickname = payload;
}

export function setLoggedIn(state, payload) {
  state.logged_in = payload;
}

export function addRoom(state, payload) {
  state.messages['c_' + payload.uuid] = [];
  state.messagesRead['c_' + payload.uuid] = 0;
  state.rooms.push(payload);
}

export function setUserlist(state,payload)
{
  state.userlist['c_' + payload.channel_id] = payload.data;
}

export function addMessage(state,payload)
{
  if( !state.messages.hasOwnProperty('c_' + payload.channel_id ) )
  {
    state.messages['c_' + payload.channel_id] = [];
  }

  if ( payload.data.text !== undefined)
  {
     let users = state.userlist['c_' + payload.channel_id];
     let user = users.find((u) => u.nickname ===  payload.data.name)
     let room = state.rooms.find((room) => room.uuid === payload.channel_id);
     if( user )
     {
       let encrypted = payload.data.text[0];
       payload.data.text = decrypt( sharedB( decodeKey(user.public_key), decodeKey(room.private_key) ), encrypted );
     }
  }

  state.messages['c_' + payload.channel_id].push(  payload.data );
}

export function deleteRoom(state, payload) {
  let rooms = state.rooms;
  rooms.filter((room) => room.uuid !== payload.uuid)
  state.rooms = rooms;
}

export function windowText(state,payload){
  state.windowText = payload;
}

export function setMessagesRead(state,payload) {
  state.messagesRead['c_' + payload.uuid] = payload.count;
}

export function removeChannel(state, payload) {
  let rooms = state.rooms;

  state.rooms = rooms.filter((room) => room.uuid !== payload.uuid);

  state.userlist['c_' + payload.uuid] = undefined;
  state.messages['c_' + payload.uuid] = undefined;
}

export function reset(state){
  state.rooms = [];
  state.messages = {};
  state.messagesRead = {};
  state.userlist = {};
}

export function setRole(state, payload){
  state.role = payload;
}

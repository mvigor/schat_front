export function getNickname (state) {
  return state.nickname;
}

export function getIsLoggedIn (state) {
  return state.logged_in;
}

export function getKeyData (state) {
  return state.keyData;
}

export function getRooms (state) {
  return state.rooms;
}

export function getRole (state) {
  return state.role;
}

export function getChat(state)
{
   return state.messages;
}

export function getwindowText(state)
{
  return state.windowText;
}

export function getMessagesRead(state) {
  return state.messagesRead;
}

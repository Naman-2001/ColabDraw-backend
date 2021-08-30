const userInfo = new Map();
const roomInfo = new Map();

const addUser = ({ id, data }) => {
  var user = data;
  user.id = id;
  userInfo.set(id, user);
  roomInfo.set(id, data.roomID);

  return { user };
};

const removeUser = (id) => {
  const roomId = roomInfo.get(id);
  const userInf = userInfo.get(id);

  roomInfo.delete(id);
  userInfo.delete(id);

  return { roomId, userInf };

  //   const index = users.findIndex((user) => user.id === id);
  //   if (index !== -1) {
  //     return users.splice(index, 1)[0];
  //   }
};

const getUser = (id) => {
  return userInfo.get(id);
};

const getUsersInRoom = (room) => {
  var users = [];
  userInfo.forEach((value) => {
    if (value.roomID == room) {
      users.push(value);
    }
  });

  // console.log(users);

  return users;
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };

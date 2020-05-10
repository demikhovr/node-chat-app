const users = [];

const addUser = ({ id, room, username }) => {
  const cleanedRoom = room.trim().toLowerCase();
  const cleanedUsername = username.trim().toLowerCase();

  if (!cleanedRoom || !cleanedUsername) {
    return {
      error: 'Username and room are required!',
    };
  }

  const existingUser = users.find((user) => user.room === cleanedRoom
    && user.username === cleanedUsername);

  if (existingUser) {
    return {
      error: 'Username is in use!',
    };
  }

  const user = {
    id,
    room: cleanedRoom,
    username: cleanedUsername,
  };

  users.push(user);
  return { user };
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }

  return {
    error: 'User doesn\'t exist',
  };
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
};

const generateLocationMessage = (username, coords) => ({
  createdAt: new Date().getTime(),
  url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
  username,
});

const generateMessage = (username, text) => ({
  createdAt: new Date().getTime(),
  text,
  username,
});

module.exports = {
  generateLocationMessage,
  generateMessage,
};

const inputUsername = document.querySelector('input[name="username"]');
const inputRoom = document.querySelector('input[name="room"]');
const { room } = Qs.parse(document.location.search, { ignoreQueryPrefix: true });

inputUsername.focus();

if (room) {
  inputRoom.readOnly = true;
  inputRoom.value = room;
}

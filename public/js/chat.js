const socket = io();

const messageFormRef = document.querySelector('.message-form');
const messageFormInputRef = messageFormRef.querySelector('.input-message');
const messageFormButtonRef = messageFormRef.querySelector('.btn-submit');
const sendLocationButtonRef = document.querySelector('.btn-location');
const messagesRef = document.querySelector('.messages');
const sidebarRef = document.querySelector('.chat__sidebar');

const messageTemplateRef = document.querySelector('#message-template').innerHTML;
const locationMessageTemplateRef = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplateRef = document.querySelector('#sidebar-template').innerHTML;

const formatMessageDate = (date) => moment(date).format('h:mm a');

const autoScroll = () => {
  const newMessageRef = messagesRef.lastElementChild;
  const newMessageStyles = getComputedStyle(newMessageRef);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom, 10);
  const newMessageHeight = newMessageRef.offsetHeight + newMessageMargin;

  const visibleHeight = messagesRef.offsetHeight;
  const contentHeight = messagesRef.scrollHeight;
  const scrollOffset = messagesRef.scrollTop + visibleHeight;

  if (contentHeight - newMessageHeight <= scrollOffset) {
    messagesRef.scrollTop = contentHeight;
  }
};

if (document.location.protocol !== 'https') {
  sendLocationButtonRef.remove();
}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplateRef, {
    createdAt: formatMessageDate(message.createdAt),
    text: message.text,
    username: message.username,
  });

  messagesRef.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationMessageTemplateRef, {
    createdAt: formatMessageDate(message.createdAt),
    url: message.url,
    username: message.username,
  });

  messagesRef.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplateRef, {
    room,
    users,
  });

  sidebarRef.innerHTML = html;
});

messageFormRef.addEventListener('submit', (evt) => {
  evt.preventDefault();

  messageFormButtonRef.disabled = true;

  const message = evt.target.message.value;
  socket.emit('sendMessage', message, (error) => {
    messageFormButtonRef.disabled = false;
    messageFormInputRef.focus();

    if (error) {
      return console.log(error);
    }

    return messageFormRef.reset();
  });
});

sendLocationButtonRef.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  sendLocationButtonRef.disabled = true;

  return navigator.geolocation.getCurrentPosition(({ coords }) => {
    socket.emit('sendLocation', {
      latitude: coords.latitude,
      longitude: coords.longitude,
    }, () => {
      sendLocationButtonRef.disabled = false;
    });
  });
});

const { username, room } = Qs.parse(document.location.search, { ignoreQueryPrefix: true });

socket.emit('join', { room, username }, (error) => {
  if (error) {
    alert(error);
    document.location.href = '/';
  }
});

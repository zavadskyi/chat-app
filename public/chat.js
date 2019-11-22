const socket = io();

//elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('.chat__sidebar')

//Temletes

const messageTemplete = document.querySelector('#message-templete').innerHTML;
const locationMessageTemplete = document.querySelector('#location-message-templete').innerHTML;
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML;


//Options

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = ()=>{
  //new message element
    const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessagesStyles = getComputedStyle($newMessage)
  const newMessagesMargin = parseInt(newMessagesStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessagesMargin;

  //Visible height
  const visibleHeight = $messages.offsetHeight

  //Height of messages container
  const containerHeight = $messages.scrollHeight

  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
  }
  
}

socket.on('message', msg => {
  console.log(msg);
  const html = Mustache.render(messageTemplete, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('H:mm:ss')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
});

socket.on('roomData', ({room, users}) => {
  console.log(users);
  const html = Mustache.render(sidebarTemplete, {
    room,
    users
  })
  $sidebar.innerHTML= html
  autoscroll()
})

socket.on('locationMessage', msg => {
  const html = Mustache.render(locationMessageTemplete, {
    username: msg.username,
    url: msg.url,
    createdAt: moment(msg.createdAt).format('H:mm:ss')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  let message = document.querySelector('input').value;

  socket.emit('sendMessage', message, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute('disabled');
        console.log('Location shared');
      }
    );
  });
});

socket.emit('join', {username, room}, (error)=>{
  if(error){
    alert(error)
    location.href = '/'
  }
});
const onlineSocket = new WebSocket("ws://" + window.location.host + "/ws/online/");
onlineSocket.onopen = () => {changeOnline(document.querySelector(".chatName").innerText)};
onlineSocket.onmessage = function (e) {document.querySelector(".isOnline").id = (JSON.parse(e.data).is_online)? "Online" : "Offline";};
function changeOnline(newOnline) {onlineSocket.send(JSON.stringify({chat_name: newOnline}));}
onlineSocket.onclose = function (e) {console.error("Online socket closed unexpectedly");};

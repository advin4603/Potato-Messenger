const onlineSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/online/'
);
onlineSocket.onopen = () =>changeOnline(document.querySelector(".chatName").innerText);
onlineSocket.onmessage = function(e){
    const data = JSON.parse(e.data);
    let isOnline = data.is_online;
    if (isOnline){
        document.querySelector(".isOnline").id = "Online";
    } else{
        document.querySelector(".isOnline").id = "Offline";
    }
}
function changeOnline(newOnline){
    onlineSocket.send(JSON.stringify({
        'chat_name': newOnline
    }));
}
onlineSocket.onclose = function(e) {
    console.error('Online socket closed unexpectedly');
};
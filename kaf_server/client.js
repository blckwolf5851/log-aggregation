function webSocketInvoke() {
    var ws = new WebSocket("ws://localhost:8080/", "echo-protocol");

    ws.onopen = function () {
        console.log("Connection created");
    };

    ws.onmessage = function (evt) {
        var received_msg = evt.data;
        console.log("received_msg");
        console.log(received_msg);
    };

    ws.onclose = function () {
        console.log("Connection closed");
    };

}

webSocketInvoke();

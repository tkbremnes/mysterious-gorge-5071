/* global chrome, console */
chrome.runtime.onMessage.addListener(
    function(request/*,sender, sendResponse*/) {
        switch (request.action) {
        case 'screen-share-stream-inject':

            navigator.webkitGetUserMedia({
                audio:false,
                video: { 
                    mandatory: { 
                        chromeMediaSource: "desktop",
                        chromeMediaSourceId: request.argument
                    }
                }
            }, function (stream) {
                window.postMessage({
                    type: 'ChromeNotifierResponse',
                    callback: request.callback,
                    response: stream
                }, "*");

                console.log("Success setting up screen share");
            }, function () {
                console.log("Error setting up screen share");
            });
            break;
        case 'relay-to-tab':
            console.log("Relaying: " + request.callback);
            window.postMessage({
                type: 'ChromeNotifierResponse',
                callback: request.callback,
                response: request.argument
            }, "*");
        }
    }
);

window.addEventListener('message', function(event) {
    if (event.source !== window ||
        event.data === undefined ||
        event.data.type !== "ChromeNotifierAction") {
        return;
    }
    if (event.data.callback !== undefined) {
        chrome.runtime.sendMessage(null, {
            action: event.data.action,
            argument: event.data.argument
        }, function(response) {

            window.postMessage({
                type: 'ChromeNotifierResponse',
                callback: event.data.callback,
                response: response
            }, "*");
        });
    } else {
        chrome.runtime.sendMessage(null, {
            action: event.data.action,
            argument: event.data.argument
        });
    }
});
console.log("ChromeNotifierInjected");
window.postMessage({ type: 'ChromeNotifierInjected' }, '*');

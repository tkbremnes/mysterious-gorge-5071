window.createPopup = function (chrome) {
    return {
        setWarningIcon: function () {
            chrome.browserAction.setBadgeText({'text': "!"});
        },

        setNormalIcon: function () {
            chrome.browserAction.setBadgeText({'text': ""});
        }
    };
};

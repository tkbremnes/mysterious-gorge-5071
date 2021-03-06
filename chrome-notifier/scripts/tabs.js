window.createTabs = function (config, utils, chrome) {
    function scoreTab(tab) {
        var score = 0;

        if (tab.windowId === chrome.windows.WINDOW_ID_CURRENT) {
            score += 100;
        }

        if(tab.active) {
            score += 10;
        }
        return score;
    }

    var selectTab = function (tabs) {
        return tabs.reduce(function (previousTab, currentTab) {
            if (scoreTab(previousTab) >= scoreTab(currentTab)) {
                return previousTab;
            }

            return currentTab;
        });
    };

    var activateTab = function (tab, callback) {
        chrome.tabs.update(tab.id, {active: true}, function () {
            chrome.windows.update(tab.windowId, {focused: true}, callback);
        });
    };

    var createNewTab = function (roomName, callback) {
        chrome.tabs.create({
            'url': config.host + roomName
        }, callback);
    };

    var sendToTabs = function (tabs, message, callback) {
        tabs.forEach(function (tab) {
            chrome.tabs.sendMessage(tab.id, message, callback);
        });
    };

    return {
        createOrActivate: function (roomName, callback) {
            chrome.tabs.query({url: '*://' + config.hostname + roomName}, function (tabs) {
                if (tabs.length > 0) {
                    activateTab(selectTab(tabs), callback);
                } else {
                    createNewTab(roomName, callback);
                }
            });
        },

        forAppearInTabs: function (callback) {
            chrome.tabs.query({
                status: 'complete',
                url: '*://' + config.hostname + '/*'
            }, callback);
        },

        /* Send messages to handler in inject.js */
        sendToRoomTabs: function (roomName, message, callback) {
            //We do not use the room name in the query since there is no good way
            //to match only path part of the url. For example, using room name without star will not match
            //urls with a search path (feature flags) and room name with star can potentially match too many.
            this.forAppearInTabs(function (tabs) {
                var tabsWithRoomName;

                if (roomName === null || roomName === undefined) {
                    tabsWithRoomName = tabs;
                } else {
                    tabsWithRoomName = tabs.filter(function (tab) {
                        return utils.extractRoomName(tab.url) === roomName;
                    });
                }

                sendToTabs(tabsWithRoomName, message, callback);
            });
        },

        sendToAppearInTabs: function (message, callback) {
            this.forAppearInTabs(function (tabs) {
                sendToTabs(tabs, message, callback);
            });
        }
    };
};

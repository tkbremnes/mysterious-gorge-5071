/* global chrome, createTabs, createUtils, config */
angular.module('appearin-notifier-popup', []);
angular.module('appearin-notifier-popup')
    .value('config', config)
    .factory('utils', function (config) {
        return createUtils(config);
    })
    .factory('tabsService', function (utils, config) {
        return createTabs(config, utils, chrome);
    })
    .factory('googleAnalytics', function () {
        return chrome.extension.getBackgroundPage().GoogleAnalytics;
    })
    .factory('kissmetrics', function () {
        return chrome.extension.getBackgroundPage().Kissmetrics;
    })
    .service('roomService', function () {
        return chrome.extension.getBackgroundPage().roomService;
    })
    .controller('popupController', ['$scope', 'roomService', 'tabsService', 'googleAnalytics', 'kissmetrics',
        function ($scope, roomService, tabsService, googleAnalytics, kissMetrics) {
            $scope.getErrorMessage = function (errorType) {
                if (!errorType) {
                    return '';
                }

                switch(errorType) {
                case 'invalid token':
                case 'missing password or token':
                case 'wrong password':
                    return 'This room has been claimed so you can\'t follow it anymore';
                default:
                    return 'Could not connect to the room for some reason';
                }
            };
            $scope.followedRooms = roomService.getFollowedRooms();

            $scope.isFollowingRooms = function () {
                return roomService.isFollowingRooms();
            };

            $scope.unfollowRoom = function (roomName) {
                kissMetrics.sendEvent('Extension popup: Unfollow Room', {roomName: roomName});
                googleAnalytics.sendEvent('Popup', 'Unfollow Room', roomName);
                return roomService.unfollowRoom(roomName);
            };

            $scope.goToRoom = function (roomName) {
                kissMetrics.sendEvent('Extension popup: Go to Room', {roomName: roomName});
                googleAnalytics.sendEvent('Popup', 'Go to Room', roomName);
                tabsService.createOrActivate(roomName);
            };
        }
    ])
    .run(['kissmetrics', 'googleAnalytics', 'roomService', function (kissmetrics, googleAnalytics, roomService) {
        var eventType = roomService.isFollowingRooms() ? 'Open with followed rooms' : 'Open with no followed rooms';
        googleAnalytics.sendEvent('Popup', eventType);
        kissmetrics.sendEvent('Extension popup: ' + eventType);
    }]);


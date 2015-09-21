'use strict';

(function (angular) {
  angular
    .module('eventsFeedPluginContent')
    .controller('ContentHomeCtrl', ['$scope', 'Buildfire', 'DataStore', 'TAG_NAMES', 'STATUS_CODE', 'LAYOUTS',
      function ($scope, Buildfire, DataStore, TAG_NAMES, STATUS_CODE, LAYOUTS) {
        var _data = {
          "content": {
            "feedUrl": ""
          },
          "design": {
            "itemDetailsLayout": LAYOUTS.itemDetailLayouts[0].name,
            "itemListBgImage": "",
            "itemDetailsBgImage": ""
          }
        };

        var ContentHome = this;
        ContentHome.masterData = null;
        ContentHome.data = angular.copy(_data);

        updateMasterItem(_data);

        function updateMasterItem(data) {
          ContentHome.masterData = angular.copy(data);
        }

        function isUnchanged(data) {
          return angular.equals(data, ContentHome.masterData);
        }

        /*
         * Go pull any previously saved data
         * */
        var init = function () {
          var success = function (result) {
              console.info('Init success result:', result);
              ContentHome.data = result.data;
              if (ContentHome.data) {
                if (!ContentHome.data.content)
                  ContentHome.data.content = {};
                if (ContentHome.data.content.feedUrl)
                  ContentHome.calUrl = ContentHome.data.content.feedUrl;
                updateMasterItem(ContentHome.data);
              }
              if (tmrDelay)clearTimeout(tmrDelay);
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
                if (tmrDelay)clearTimeout(tmrDelay);
              }
              else if (err && err.code === STATUS_CODE.NOT_FOUND) {
                saveData(JSON.parse(angular.toJson(ContentHome.data)), TAG_NAMES.EVENTS_FEED_INFO);
              }
            };
          DataStore.get(TAG_NAMES.EVENTS_FEED_INFO).then(success, error);
        };
        init();

        ContentHome.validateCalUrl = function () {

        };

        /*
         * Call the datastore to save the data object
         */
        var saveData = function (newObj, tag) {
          if (typeof newObj === 'undefined') {
            return;
          }
          var success = function (result) {
              console.info('Saved data result: ', result);
              updateMasterItem(newObj);
            }
            , error = function (err) {
              console.error('Error while saving data : ', err);
            };
          DataStore.save(newObj, tag).then(success, error);
        };


        /*
         * create an artificial delay so api isnt called on every character entered
         * */
        var tmrDelay = null;
        var saveDataWithDelay = function (newObj) {
          if (newObj) {
            if (isUnchanged(newObj)) {
              return;
            }
            if (tmrDelay) {
              clearTimeout(tmrDelay);
            }
            tmrDelay = setTimeout(function () {
              saveData(JSON.parse(angular.toJson(newObj)), TAG_NAMES.EVENTS_FEED_INFO);
            }, 500);
          }
        };
        /*
         * watch for changes in data and trigger the saveDataWithDelay function on change
         * */
        $scope.$watch(function () {
          return ContentHome.data;
        }, saveDataWithDelay, true);
      }]);
})(window.angular);

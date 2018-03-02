// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicHistory, $ionicLoading, $ionicPopup, CommandService, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    /*$rootScope.currentHome = 'Home';
    console.log('what?!');
    $rootScope.currentPlace = '';
    $rootScope.currentDevice = '';
    $rootScope.currentIp = '';*/
    console.log('pow');
    window.onerror = function (errorMsg, url, lineNumber) {
         alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
    }

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $rootScope.goBack = function() {
      $ionicHistory.goBack();
    };

    $rootScope.scanNewDevice = function() {
      if($rootScope.currentIp == undefined) {
        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Seu Kerk Control ainda não está configurado neste aparelho.',
          okText: 'Ok',
          okType: 'button-positive'
        });

        return;
      }


      $ionicLoading.show();
      var ip = $rootScope.currentIp;
      var newDevice = false;

      CommandService.list(ip).then(
        function(success) {
          angular.forEach(success.data, function(value, key) {
            var checkDeviceId = $rootScope.kerk.devicesIds.filter(function(device){
              return device === value;
            });

            if(checkDeviceId.length == 0) {
              console.log('new: ' + value);
              newDevice = true;
              $rootScope.newDeviceId = value;
            }
          });

          $ionicLoading.hide();

          if(!newDevice) {
            $ionicPopup.alert({
              title: 'Ops!',
              template: 'Nenhum dispositivo novo foi encontrado.',
              okText: 'Ok',
              okType: 'button-positive'
            });
          } else {
            $ionicPopup.alert({
              title: 'Sucesso!',
              template: 'Configure seu novo dispositivo!',
              okText: 'Ok',
              okType: 'button-positive'
            }).then(function(){
              $state.go('newDevice');
            });          
          }
        },
        function(error) {
          $ionicLoading.hide();

          $ionicPopup.alert({
            title: 'Ops!',
            template: 'Houve um erro, tente novamente.',
            okText: 'Ok',
            okType: 'button-positive'
          });
        }
      );
    };


  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider

  .state('initial', {
    url: '/initial',
    cache: false,
    templateUrl: 'templates/initial.html',
    controller: 'InitialCtrl'
  })

  .state('firstSetUp', {
    url: '/firstSetUp',
    cache: false,
    templateUrl: 'templates/firstSetUp.html',
    controller: 'FirstSetUpCtrl'
  })

  .state('firstSetUpWiFi', {
    url: '/firstSetUpWiFi/:ssidList',
    cache: false,
    templateUrl: 'templates/firstSetUpWiFi.html',
    controller: 'FirstSetUpWiFiCtrl'
  })

  .state('firstSetUpHome', {
    url: '/firstSetUpHome',
    cache: false,
    templateUrl: 'templates/firstSetUpHome.html',
    controller: 'FirstSetUpHomeCtrl'
  })

  .state('firstSetUpEnd', {
    url: '/firstSetUpEnd',
    cache: false,
    templateUrl: 'templates/firstSetUpEnd.html'
  })

  .state('secondSetUp', {
    url: '/secondSetUp',
    cache: false,
    templateUrl: 'templates/secondSetUp.html',
    controller: 'SecondSetUpCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.browse', {
    url: '/browse',
    views: {
      'menuContent': {
        templateUrl: 'templates/browse.html'
      }
    }
  })

  .state('app.playlists', {
    url: '/playlists',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  })

  .state('tabs', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('tabs.main', {
    url: '/main',
    views: {
      'main-tab': {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }
    }
  })

  .state('tabs.scenes', {
    url: '/scenes',
    views: {
      'scenes-tab': {
        templateUrl: 'templates/scenes.html',
        controller: 'ScenesCtrl'
      }
    }
  })

  .state('placeControl', {
    url: '/placeControl/',
    cache: false,
    templateUrl: 'templates/placeControl.html',
    controller: 'PlaceControlCtrl'
  })

  .state('deviceControl', {
    url: '/deviceControl/',
    cache: false,
    templateUrl: 'templates/deviceControl.html',
    controller: 'DeviceControlCtrl'
  })

  .state('tabs.config', {
    url: '/config',
    views: {
      'config-tab': {
        templateUrl: 'templates/config.html',
        controller: 'ConfigCtrl'
      }
    }
  })

  .state('newDevice', {
    url: '/newDevice/',
    cache: false,
    templateUrl: 'templates/newDevice.html',
    controller: 'NewDeviceCtrl'
  })

  .state('tabs.testes', {
    url: '/testes',
    views: {
      'config-tab': {
        templateUrl: 'templates/testes.html',
        controller: 'TestesCtrl'
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/initial');
  $urlRouterProvider.otherwise('/tab/main');
  //$urlRouterProvider.otherwise('/firstSetUpHome');
});

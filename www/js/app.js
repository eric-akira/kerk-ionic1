// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, $rootScope, $ionicHistory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
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
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
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

  .state('app.main', {
    url: '/main',
    views: {
      'menuContent': {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      }
    }
  })

  .state('app.placeControl', {
    url: '/placeControl/:parent/:place',
    views: {
      'menuContent': {
        templateUrl: 'templates/placeControl.html',
        controller: 'PlaceControlCtrl'
      }
    }
  })

  .state('app.deviceControl', {
    url: '/deviceControl/:parent/:device',
    views: {
      'menuContent': {
        templateUrl: 'templates/deviceControl.html',
        controller: 'DeviceControlCtrl'
      }
    }
  })

  .state('app.config', {
    url: '/config',
    views: {
      'menuContent': {
        templateUrl: 'templates/config.html',
        controller: 'ConfigCtrl'
      }
    }
  })

  .state('app.testes', {
    url: '/testes',
    views: {
      'menuContent': {
        templateUrl: 'templates/testes.html',
        controller: 'TestesCtrl'
      }
    }
  });


  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/initial');
  $urlRouterProvider.otherwise('/app/main');
  //$urlRouterProvider.otherwise('/firstSetUpHome');
});

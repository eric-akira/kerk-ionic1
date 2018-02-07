angular.module('starter.controllers', [])

.controller('InitialCtrl', function($scope, $ionicLoading, $state) {
  $scope.$on('$ionicView.enter', function(e) {
    $ionicLoading.show();

    $scope.firstTime = window.localStorage.getItem('kerk.initial');

    if (!$scope.firstTime) {
      $ionicLoading.hide();
      $state.go('firstSetUp');
    } else {
      if ($scope.firstTime == 'second') {
        $ionicLoading.hide();
        $state.go('firstSetUpEnd');
      } else {
        $ionicLoading.hide();
        $state.go('app.main');
      }
    }
  });
})

.controller('FirstSetUpCtrl', function($scope, $ionicLoading, $ionicPopup, $state, KerkCentralService) {
  document.addEventListener('deviceready', DeviceReady, false);
  $ionicLoading.show();
  $scope.tryCount = 0;
  $scope.retryLimit = 255;

  function DeviceReady() {
    networkinterface.getIPAddress(
      function (ip, subnet) { 
        $scope.myIp = KerkCentralService.formatIpForScan(ip);
      },
      function (error) {
        console.log('Erro: ' + error);
        $scope.myIp = false;
      }
    );

    $ionicLoading.hide();
  }

  $scope.getIp = function(ip) {
    KerkCentralService.scanIp($scope.myIp + $scope.tryCount + '/wifi').then(
      function(data) {
        $scope.kerkIp = $scope.myIp + $scope.tryCount;
        window.localStorage.setItem('kerk.mainIp', $scope.kerkIp);
        $scope.result = KerkCentralService.formatSSIDList(data.data);
        console.log($scope.result);
        $ionicLoading.hide();

        $state.go('firstSetUpWiFi', {
          ssidList: $scope.result
        });
      },
      function(error) {
        $scope.tryCount++;
        if($scope.tryCount <= $scope.retryLimit) {
          $scope.getIp($scope.myIp);
        } else {
          //tratar erro
          $ionicLoading.hide();
          $scope.tryCount = 0;
          $scope.retryLimit = 255;

          $ionicPopup.alert({
            title: 'Ops!',
            template: 'Tenha certeza que desligou o 3G/4G e que está conectado na rede Wireless Kerk',
            okText: 'Ok',
            okType: 'button-positive'
          });
          
        }
      }
    );
  };

  $scope.startScan = function() {
    if($scope.myIp) {
      $ionicLoading.show();
      $scope.getIp($scope.myIp);
    }
  };

})

.controller('FirstSetUpWiFiCtrl', function($scope, $state, $stateParams, $ionicLoading, $ionicPopup, KerkCentralService) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.kerkIp = window.localStorage.getItem('kerk.mainIp');
    $scope.wifi = {};
    $scope.wifi.ssidList = $stateParams.ssidList;
    $scope.wifi.ssidList = $scope.wifi.ssidList.split(',');
    $scope.wifi.ssid = $scope.wifi.ssidList[0];
  });

  $scope.setWiFi = function() {
    console.log('ssid: ' + $scope.wifi.ssid + '/senha: ' + $scope.wifi.senha);
    $ionicLoading.show();

    KerkCentralService.connectSSID($scope.kerkIp, $scope.wifi.ssid, $scope.wifi.senha).then(
      function(data) {
        $ionicLoading.hide();
        console.log(data);
        if(data.status == 200) {
          $state.go('firstSetUpHome');
        }
      },
      function(error) {
        $ionicLoading.hide();

        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Houve um erro inesperado, reinicie o aplicativo.',
          okText: 'Ok',
          okType: 'button-positive'
        });
      }
    );
  };
})

.controller('FirstSetUpHomeCtrl', function($scope, $state, $ionicPopup) {
  $scope.home = {};
  $scope.places = ['Sala', 'Quarto Casal', 'Quarto Solteiro', 'Cozinha', 'Banheiro'];
  $scope.home.devicePlace = $scope.places[0];
  $scope.home.name = '';
  $scope.home.deviceName = '';

  console.log($scope.home);

  $scope.setHome = function() {
    console.log($scope.home);
    var name = $scope.home.name;
    var devicePlace = $scope.home.devicePlace;
    var deviceName = $scope.home.deviceName;

    if(name == '' || devicePlace == '' || deviceName == '') {
      $ionicPopup.alert({
        title: 'Ops!',
        template: 'Preencha todos os dados antes de prosseguir',
        okText: 'Ok',
        okType: 'button-positive'
      });

      return;
    }

    var nameArray = [];
    var devicePlaceArray = [];
    var deviceNameArray = [];
    nameArray.push(name);
    devicePlaceArray.push(devicePlace);
    deviceNameArray.push(deviceName);

    var kerk = {
      homeList: nameArray,
      [name]: {
        placeList: devicePlaceArray,
        [devicePlace]: {
          deviceList: deviceNameArray,
          [deviceName]: {
            id: 1234,
            buttonList: ['b1','b2','b3'],
            b1: {
              id: 1,
              status: 'on',
              statusBtnClass: 'device-on',
              statusTxtClass: 'color-blue',
              statusText: 'Ligado'
            },
            b2: {
              id: 2,
              status: 'on',
              statusBtnClass: 'device-on',
              statusTxtClass: 'color-blue',
              statusText: 'Ligado'
            },
            b3: {
              id: 3,
              status: 'on',
              statusBtnClass: 'device-on',
              statusTxtClass: 'color-blue',
              statusText: 'Ligado'
            }
          }
        }
      }
    };

    kerk = angular.toJson(kerk);
    window.localStorage.setItem('kerk.save', kerk);
    window.localStorage.setItem('kerk.initial', 'second');

    $state.go('firstSetUpEnd');
  };
})

.controller('SecondSetUpCtrl', function($scope, $ionicLoading, KerkCentralService, $state) {
  $ionicLoading.show();
  document.addEventListener('deviceready', DeviceReady, false);
  
  $scope.tryCount = 120;
  $scope.retryLimit = 255;

  $scope.kerk = window.localStorage.getItem('kerk.save');
  $scope.kerk = angular.fromJson($scope.kerk);
  console.log($scope.kerk);

  var home = $scope.kerk.homeList[0];
  var place = $scope.kerk[home].placeList[0];
  var device = $scope.kerk[home][place].deviceList[0];

  function DeviceReady() {
    networkinterface.getIPAddress(
      function (ip, subnet) { 
        $scope.myIp = KerkCentralService.formatIpForScan(ip);
      },
      function (error) {
        console.log('Erro: ' + error);
        $scope.myIp = false;
      }
    );

    $scope.getIp = function(ip) {
      KerkCentralService.scanIp($scope.myIp + $scope.tryCount + '/comando?ID=1234&lamp=1&status=?').then(
        function(data) {
          console.log(data);

          if (data.status == 200 && (data.data == 'on' || data.data == 'off')) {
            $scope.kerkIp = $scope.myIp + $scope.tryCount;
            console.log($scope.kerk[home][place][device]);
            $scope.kerk[home][place][device].ip = $scope.kerkIp;
            $scope.kerk = angular.toJson($scope.kerk);
            window.localStorage.setItem('kerk.save', $scope.kerk);
            window.localStorage.setItem('kerk.initial', 'done');
            window.localStorage.setItem('kerk.currentHome', home);
            $ionicLoading.hide();
            $state.go('app.main');
          }
        },
        function(error) {
          $scope.tryCount++;
          if($scope.tryCount <= $scope.retryLimit) {
            $scope.getIp($scope.myIp);
          } else {
            $ionicLoading.hide();
            $scope.tryCount = 0;
            $scope.retryLimit = 255;

            $ionicPopup.alert({
              title: 'Ops!',
              template: 'Tenha certeza que você está na sua rede Local.',
              okText: 'Ok',
              okType: 'button-positive'
            }).then(function(res) {
              $state.go('firstSetUpEnd');
            });
          }
        }
      );
    };

    $scope.getIp($scope.myIp);
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('MainCtrl', function($scope, $state, $ionicPopup) {
  $scope.kerk = window.localStorage.getItem('kerk.save');
  $scope.kerk = angular.fromJson($scope.kerk);

  $scope.currentHome = window.localStorage.getItem('kerk.currentHome');

  if($scope.currentHome == '' || $scope.currentHome == undefined) {
    var home = $scope.kerk.homeList[0];
    window.localStorage.setItem('kerk.currentHome', home);
    $scope.currentHome = home;
  }

  $scope.placeList = $scope.kerk[$scope.currentHome].placeList;

  $scope.goPlaceControl = function(place) {
    var placeObj = $scope.kerk[$scope.currentHome][place];
    placeObj.ownName = place;

    $state.go('app.placeControl', {
      place: angular.toJson(placeObj),
      parent: $scope.currentHome
    });
  };

  $scope.resetar = function() {
    window.localStorage.clear();

    $ionicPopup.alert({
      title: 'Ok!',
      template: 'localStorage deletado, reinicie o app.',
      okText: 'Ok',
      okType: 'button-positive'
    });
  }
})

.controller('PlaceControlCtrl', function($scope, $stateParams, $state) {
  $scope.currentPlace = angular.fromJson($stateParams.place);
  $scope.parent = $stateParams.parent;

  $scope.goDeviceControl = function(device) {
    var deviceObj = $scope.currentPlace[device];
    deviceObj.ownName = device;

    $state.go('app.deviceControl', {
      device: angular.toJson(deviceObj),
      parent: $scope.currentPlace.ownName
    });
  };
})

.controller('DeviceControlCtrl', function($scope, $stateParams, CommandService, $ionicLoading, $ionicPopup, $interval) {
  $ionicLoading.show();
  var promiseGetStatus;

  $scope.currentDevice = angular.fromJson($stateParams.device);
  $scope.parent = $stateParams.parent;

  $scope.buttons = [];

  angular.forEach($scope.currentDevice.buttonList, function(value,key) {
    this.push($scope.currentDevice[value]);
  }, $scope.buttons);

  console.log($scope.buttons);

  $scope.changeStatus = function(object) {
    $ionicLoading.show();
    var newStatus = (object.status == 'on') ? 'off' : 'on';

    CommandService.changeStatus($scope.currentDevice.ip, $scope.currentDevice.id, object.id, newStatus).then(
      function(data) {
        $ionicLoading.hide();
        console.log(data);
        if(data.status == '200' && data.data == 'ok') {
          object.status = newStatus;
          object.statusBtnClass = (object.statusBtnClass == 'device-on') ? 'device-off' : 'device-on';
          object.statusTxtClass = (object.statusTxtClass == 'color-blue') ? 'color-grey' : 'color-blue';
          object.statusText = (object.statusText == 'Ligado') ? 'Desligado' : 'Ligado';
        } 
      },
      function(error) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Tenha certeza que você está na sua rede Local e tente novamente.',
          okText: 'Ok',
          okType: 'button-positive'
        });
      }
    );  
  };

  function getStatus() {
    angular.forEach($scope.buttons, function(value,key) {
      console.log(value);
      CommandService.getStatus($scope.currentDevice.ip, $scope.currentDevice.id, value.id).then(
        function(data) {
          value.status = data.data;
          value.statusBtnClass = (value.status == 'off') ? 'device-off' : 'device-on';
          value.statusTxtClass = (value.status == 'off') ? 'color-grey' : 'color-blue';
          value.statusText = (value.status == 'off') ? 'Desligado' : 'Ligado';
        },
        function(error) {
          //erro...
        }
      );
    });
    $ionicLoading.hide();
  }

  getStatus();

  promiseGetStatus = $interval(getStatus, 1000);

  $scope.$on('$destroy', function() {
    console.log('destoyed');
    $interval.cancel(promiseGetStatus);
  });
})

.controller('TestesCtrl', function($scope, $ionicLoading){
  document.addEventListener('deviceready', DeviceReady, false);

  function DeviceReady() {
    //device ready, podemos executar plugins
    networkinterface.getIPAddress(
      function (ip, subnet) { 
        alert(ip + ':' + subnet); 
      },
      function (error) {
        alert('Erro: ' + error);
      }
    );
  }
});

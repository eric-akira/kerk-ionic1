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

.controller('FirstSetUpCtrl', function($scope, $ionicLoading, $ionicPopup, $state, $rootScope) {
  $ionicLoading.show();
  document.addEventListener('deviceready', DeviceReady, false);

  function DeviceReady() {
    WifiWizard2.getCurrentSSID(connectedSSIDWin, connectedSSIDFail);
  }

  function connectedSSIDWin(ssid) {
    $rootScope.currentSSID = ssid;
    $ionicLoading.hide();
  }

  function connectedSSIDFail(error) {
    $rootScope.currentSSID = '';
    $ionicLoading.hide();
  }


  /*document.addEventListener('deviceready', DeviceReady, false);
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
  };*/

})

.controller('FirstSetUpWiFiCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $rootScope, $http, $ionicHistory, $timeout) {
  $ionicLoading.show();
  document.addEventListener('deviceready', deviceReady, false);

  $scope.wifi = {
    ssid: '',
    senha: ''
  };

  $scope.hideBack = function() {
    $ionicLoading.hide();

    $ionicPopup.alert({
      title: 'Erro',
      template: 'Tenha certeza de que o Kerk Control está no modo configuração, que você está conectado a sua Rede Local e que está com o 3G/4G desligado, e tente novamente.',
      okText: 'Ok',
      okType: 'button-positive'
    }).then(function(){
      $ionicHistory.goBack();
    });
  }

  function connectWifiWin(win) {
    $ionicLoading.hide();
    console.log('win!');
  }

  function connectWifiFail(error) {
    console.log(error);
    $scope.hideBack();
  }

  function deviceReady() {
    if($rootScope.currentSSID != 'Kerk_control' && $rootScope.currentSSID != 'kerk_control') {
      WifiWizard2.scan({}, scanWin, scanFail);
    }
  }

  $scope.setWiFi = function() {
    console.log($scope.wifi);

    $ionicLoading.show();

    ssid = window.encodeURIComponent($scope.wifi.ssid);
    password = window.encodeURIComponent($scope.wifi.senha);

    //$http({method: 'GET', cache: false, url: 'http://192.168.4.1/wifisave?=' + ssid + '&p=' + password}).then(
    $http({method: 'GET', cache: false, url: 'http://192.168.4.1/wifi?SSID="'+ssid+'"&PASSWORD="'+password+'"'}).then(
      function(data){
        console.log(data);
        $scope.checkConfig();
      },
      function(error) {
        console.log(error);
        $scope.hideBack();
      }
    );
  }


  function scanWin(networks) {
    $rootScope.avaiableNetworks = networks;
    console.log($rootScope.avaiableNetworks);

    var targetKerk = $rootScope.avaiableNetworks.filter(function(avaiableNetworks){
      return avaiableNetworks.SSID === 'Kerk_control';
    });

    var targetKerkControl = $rootScope.avaiableNetworks.filter(function(avaiableNetworks){
      return avaiableNetworks.SSID === 'kerk_control';
    });

    var target = '';

    if (targetKerkControl.length > 0) {
      target = 'kerk_control';
    } else if(targetKerk.length > 0) {
      target = 'Kerk_control';
    } else {
      target = false;
    }

    if (target != false) {
      if(ionic.Platform.isIOS()) {
        WifiWizard2.iOSConnectNetworkAsync(target, '').then(
          function(success) {
            console.log(success);
            connectWifiWin(success);
          },
          function(error) {
            console.log(error);
            connectWifiFail(error);
          }
        );
      } else {
        //WifiWizard2.androidConnectNetwork('kerk_control', connectWifiWin, connectWifiFail);
        //WifiWizard2.androidConnectNetwork('Kerk', connectWifiWin, connectWifiFail);
        var androidWifi = WifiWizard2.formatWifiConfig(target, '');
        
        WifiWizard2.addNetworkAsync(androidWifi).then(
          function(success) {
            console.log(success);
            $scope.androidConnect(target);
          },
          function(error) {
            console.log(error);
            $scope.hideBack();
          }
        );
      }
    } else {
      $scope.hideBack();
    }
  }

  function scanFail(error) {
    console.log(error);
    $scope.hideBack();
  }

  $scope.androidConnect = function(target) {
    WifiWizard2.androidConnectNetworkAsync(target).then(
      function(success) {
        console.log(success);
        connectWifiWin(success);
      },
      function(error) {
        console.log(error);
        connectWifiFail(error);
      }
    );
  }

  $scope.checkConfig = function() {
    $timeout(function() {
      WifiWizard2.scan({}, 
        function(success){
          $rootScope.avaiableNetworks = success;
          console.log($rootScope.avaiableNetworks);

          var targetKerk = $rootScope.avaiableNetworks.filter(function(avaiableNetworks){
            return avaiableNetworks.SSID === 'Kerk_control';
          });

          var targetKerkControl = $rootScope.avaiableNetworks.filter(function(avaiableNetworks){
            return avaiableNetworks.SSID === 'kerk_control';
          });

          var target = '';

          if (targetKerkControl.length > 0) {
            target = 'kerk_control';
          } else if(targetKerk.length > 0) {
            target = 'Kerk_control';
          } else {
            target = false;
          }

          if(!target) {
            $scope.done();
          } else {
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: 'Erro',
              template: 'O SSID ou a Senha da sua rede estão errados, corrija e tente novamente',
              okText: 'Ok',
              okType: 'button-positive'
            });
          }
        },
        function(error){
          $scope.hideBack();
        }
      );
    }, 20000);
  }

  $scope.done = function() {
    if(ionic.Platform.isIOS()) {
      WifiWizard2.iOSConnectNetworkAsync($scope.wifi.ssid, $scope.wifi.senha).then(
        function(success) {
          $ionicLoading.hide();
          $state.go('firstSetUpHome');
        },
        function(error) {
          console.log(error);
        }
      );
    } else {
      WifiWizard2.androidConnectNetworkAsync($scope.wifi.ssid).then(
        function(success) {
          $ionicLoading.hide();
          window.localStorage.setItem('kerk.configStatus', 'FirstSetUpHome');
          $state.go('firstSetUpHome');
        },
        function(error) {
          console.log(error);
        }
      );
    }
  }

  $scope.teste = function() {
    $http({method: 'GET', cache: false, url: 'http://192.168.4.1/'}).then(
      function(data){
        console.log(data);
      },
      function(error) {
        console.log(error);
      }
    );
  };

  $scope.teste2 = function() {
    $.ajax({
      url: 'http://192.168.4.1/',
      method: 'GET',
      cache: false
    })
    .done(function(data) {
      console.log(data);
    })
    .fail(function(error){
      console.log(error);
    });
  };

  //$http({method: 'GET', cache: false, url: 'http://' + ip + '/wifisave?=' + ssid + '&p=' + password});


  /*$scope.$on('$ionicView.enter', function(e) {
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
  };*/
})

.controller('FirstSetUpHomeCtrl', function($scope, $state, $ionicPopup, $ionicLoading, KerkCentralService, CommandService) {
  $ionicLoading.show();
  //window.localStorage.setItem('kerk.configStatus', 'FirstSetUpHome');

  $scope.home = {};
  $scope.places = ['Sala', 'Quarto Casal', 'Quarto Solteiro', 'Cozinha', 'Banheiro'];
  $scope.home.devicePlace = 'Sala';
  $scope.home.name = '';
  $scope.home.deviceName = '';

  $scope.tryCount = 1;
  $scope.retryLimit = 254;
  
  $scope.myIp = '';
  $scope.kerk = {
    ip: '',
    id: '',
    type: ''
  };

  $scope.getIp = function(ip) {
    KerkCentralService.scanIp($scope.myIp + $scope.tryCount + '/').then(
      function(data) {
        if (data.status == 200 && (data.data == 'Kerk')) {
          $scope.kerk.ip = $scope.myIp + $scope.tryCount;
          window.localStorage.setItem('kerk.kerk.ip', $scope.kerk.ip);
          $scope.listDevice();
        }
        else {
          $scope.tryCount++;
          if($scope.tryCount <= $scope.retryLimit) {
            $scope.getIp($scope.myIp);
          } else {
            $ionicLoading.hide();
            $scope.tryCount = 0;
            $scope.retryLimit = 254;

            $ionicPopup.alert({
              title: 'Ops!',
              template: 'Tenha certeza que você está na sua rede Local.',
              okText: 'Ok',
              okType: 'button-positive'
            }).then(function(res) {
              $state.go('app.main');
            });
          }
        }
      },
      function(error) {
        $scope.tryCount++;
        if($scope.tryCount <= $scope.retryLimit) {
          $scope.getIp($scope.myIp);
        } else {
          $ionicLoading.hide();
          $scope.tryCount = 0;
          $scope.retryLimit = 254;

          $ionicPopup.alert({
            title: 'Ops!',
            template: 'Tenha certeza que você está na sua rede Local.',
            okText: 'Ok',
            okType: 'button-positive'
          }).then(function(res) {
            $state.go('app.main');
          });
        }
      }
    );
  };

  $scope.listDevice = function() {
    CommandService.list($scope.kerk.ip).then(
      function(success) {
        $scope.kerk.id = success.data.n0;
        $scope.infoDevice();
      },
      function(error) {
        $ionicLoading.hide();

        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Tenha certeza que você está na sua rede Local.',
          okText: 'Ok',
          okType: 'button-positive'
        }).then(function(res) {
          $state.go('app.main');
        });
      }
    );
  }

  $scope.infoDevice = function() {
    CommandService.info($scope.kerk.ip, $scope.kerk.id).then(
      function(success) {
        $scope.kerk.type = success.data.INFO;

        console.log($scope.kerk);
        $ionicLoading.hide();
      },
      function(error) {
        $ionicLoading.hide();

        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Tenha certeza que você está na sua rede Local.',
          okText: 'Ok',
          okType: 'button-positive'
        }).then(function(res) {
          $state.go('app.main');
        });
      }
    );
  };

  document.addEventListener('deviceready', DeviceReady, false);

  function DeviceReady() {
    networkinterface.getIPAddress(
      function (ip, subnet) { 
        $scope.myIp = KerkCentralService.formatIpForScan(ip);
        $scope.getIp($scope.myIp);
      },
      function (error) {
        console.log('Erro: ' + error);
        $scope.myIp = false;
      }
    );
  }
  
  $scope.setHome = function() {
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
    var devicesIdsArray = [];
    nameArray.push(name);
    devicePlaceArray.push(devicePlace);
    deviceNameArray.push(deviceName);
    devicesIdsArray.push($scope.kerk.id);

    var kerk = {
      homeList: nameArray,
      currentHome: name,
      devicesIds: devicesIdsArray,
      [name]: {
        homeIp: $scope.kerk.ip,
        placeList: devicePlaceArray,
        [devicePlace]: {
          deviceList: deviceNameArray,
          [deviceName]: {
            id: $scope.kerk.id
          }
        }
      }
    };

    if($scope.kerk.type == 'LUZ 1') {
      kerk[name][devicePlace][deviceName].buttonList = ['b1'];
    } else if ($scope.kerk.type == 'LUZ 2') {
      kerk[name][devicePlace][deviceName].buttonList = ['b1', 'b2'];
    } else if ($scope.kerk.type == 'LUZ 3') {
      kerk[name][devicePlace][deviceName].buttonList = ['b1', 'b2', 'b3'];
    }

    var count = 1;
    angular.forEach(kerk[name][devicePlace][deviceName].buttonList, function(value,key) {
      kerk[name][devicePlace][deviceName][value] = {
        id: count,
        status: 'on',
        statusBtnClass: 'device-on',
        statusTxtClass: 'color-blue',
        statusText: 'Ligado'
      };
      count++;
    });

    console.log(kerk);
    kerk = angular.toJson(kerk);
    window.localStorage.setItem('kerk.save', kerk);
    window.localStorage.setItem('kerk.configStatus', 'completo');

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

.controller('MainCtrl', function($scope, $state, $ionicPopup, $rootScope, CommandService) {
  $scope.scanNewDevice = function() {
    var ip = $rootScope.currentIp;
    CommandService.list(ip).then(
      function(success) {
        angular.forEach(success.data, function(value, key) {
          var checkDeviceId = $rootScope.kerk.devicesIds.filter(function(device){
            return device === value;
          });

          if(checkDeviceId.length == 0) {
            console.log('new: ' + value);
            $scope.newDevice = true;
            $rootScope.newDeviceId = value;
          }
        });
      },
      function(error) {
        console.log(error);
      }
    );
  };

  $scope.$on('$ionicView.enter', function(e) {
    $rootScope.kerk = window.localStorage.getItem('kerk.save');
    $scope.configStatus = window.localStorage.getItem('kerk.configStatus');

    if($rootScope.kerk) {
      $rootScope.kerk = angular.fromJson($rootScope.kerk);
      $rootScope.currentHome = $rootScope.kerk.currentHome;
      $rootScope.currentIp = $rootScope.kerk[$rootScope.currentHome].homeIp;
      $scope.inConfig = false;
      $scope.newDevice = false;

      $scope.placeList = $rootScope.kerk[$rootScope.currentHome].placeList;
      $scope.scanNewDevice();
    } else{
      $scope.inConfig = true;
      $scope.newDevice = false;
      $rootScope.currentHome = 'Home';
    }
  });

  $scope.goConfig = function() {
    if ($scope.configStatus == 'FirstSetUpHome') {
      $state.go('firstSetUpHome');
    } else {
      $state.go('firstSetUp');
    }
  };

  $scope.goDeviceConfig = function() {
    $state.go('newDevice');
  };

  $scope.goPlaceControl = function(place) {
    console.log($rootScope.currentHome);
    $rootScope.currentPlace = place;
    $state.go('placeControl');
  }

  /*$scope.kerk = angular.fromJson($scope.kerk);

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

  $scope.resetarDevice = function() {
    window.localStorage.clear();

    $ionicPopup.alert({
      title: 'Ok!',
      template: 'localStorage deletado, reinicie o app.',
      okText: 'Ok',
      okType: 'button-positive'
    });
  }*/
})

.controller('PlaceControlCtrl', function($scope, $stateParams, $state, $rootScope, $ionicLoading, CommandService) {
  $ionicLoading.show();

  $scope.getDeviceStatus = function(){
    var ip = $rootScope.currentIp;
    //var id = $rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][device].id;

    angular.forEach($scope.deviceList, function(value,key){
      console.log(value);
      console.log(key);

      var id = $rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][value.name].id;

      angular.forEach($rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][value.name].buttonList, function(valor,chave){
        var lid = $rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][value.name][valor].id;

        CommandService.getStatus(ip, id, lid).then(
          function(success){
            console.log(lid, success.data.STATUS);

            if(success.data.STATUS == 'ON') {
              $scope.deviceList[key].on = true;
            }
          },
          function(error){

          }
        );
      });
    });

    $ionicLoading.hide();
  };

  $scope.$on('$ionicView.enter', function(e) {

    $scope.deviceList = [];

    angular.forEach($rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace].deviceList, function(value,key){
      $scope.deviceList.push({
        name: value,
        on: false
      });
    });

    $scope.getDeviceStatus();
  });

  $scope.goDeviceControl = function(device) {
    $rootScope.currentDevice = device.name;
    $state.go('deviceControl');
  };

})

.controller('DeviceControlCtrl', function($scope, $stateParams, CommandService, $ionicLoading, $ionicPopup, $interval, $rootScope) {
  
  $ionicLoading.show();
  var promiseGetStatus;
  
  function getStatus(first) {
    //console.log(first);

    //console.log(typeof first);


    var ip = $rootScope.currentIp;
    var id = $rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][$rootScope.currentDevice].id;

    angular.forEach($scope.buttons, function(value,key) {
      CommandService.getStatus(ip, id, value.id).then(
        function(data) {
          //console.log('getting status...');
          //console.log(data);

          value.status = data.data.STATUS;
          value.statusBtnClass = (value.status == 'OFF') ? 'device-off' : 'device-on';
          value.statusTxtClass = (value.status == 'OFF') ? 'color-grey' : 'color-blue';
          value.statusText = (value.status == 'OFF') ? 'Desligado' : 'Ligado';
        },
        function(error) {
          //erro...
        }
      );
    });

    if(typeof first == 'boolean') {
      console.log('what?');
      $ionicLoading.hide();
    }
  }

  $scope.$on('$ionicView.enter', function(e) {
    console.log($rootScope.kerk);
    console.log($rootScope.currentDevice);
    console.log($rootScope.currentPlace);
    console.log($rootScope.currentHome);
    console.log($rootScope.currentIp);

    $scope.buttons = [];

    angular.forEach($rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][$rootScope.currentDevice].buttonList, function(value,key){
      $scope.buttons.push($rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][$rootScope.currentDevice][value]);
    });

    console.log($scope.buttons);

    getStatus(true);
  });

  promiseGetStatus = $interval(getStatus, 1000);

  $scope.$on('$destroy', function() {
    $interval.cancel(promiseGetStatus);
  });

  $scope.changeStatus = function(object) {
    $ionicLoading.show();

    var ip = $rootScope.currentIp;
    var id = $rootScope.kerk[$rootScope.currentHome][$rootScope.currentPlace][$rootScope.currentDevice].id;

    var newStatus = (object.status == 'ON') ? 'OFF' : 'ON';

    CommandService.changeStatus(ip, id, object.id, newStatus).then(
      function(data) {
        $ionicLoading.hide();
        //console.log('changing status...');
        //console.log(data);
        if(data.status == '200' && data.data.STATUS == newStatus) {
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
  
})

.controller('ConfigCtrl', function($scope, $ionicPopup, $ionicHistory) {
  $scope.resetarDevice = function() {
    window.localStorage.clear();

    $ionicPopup.alert({
      title: 'Dados Apagados',
      template: 'Todos os dados do aplicativo foram apagados.',
      okText: 'Ok',
      okType: 'button-positive'
    }).then(function(){
      $ionicHistory.goBack();
    });
  }
})

.controller('NewDeviceCtrl', function($scope, $state, $ionicPopup, $ionicLoading, KerkCentralService, CommandService, $rootScope) {
  $scope.home = {};
  $scope.places = ['Sala', 'Quarto Casal', 'Quarto Solteiro', 'Cozinha', 'Banheiro'];
  $scope.home.devicePlace = 'Sala';
  $scope.home.deviceName = '';

  $scope.infoDevice = function() {
    var ip = $rootScope.currentIp;
    var id = $rootScope.newDeviceId;

    CommandService.info(ip, id).then(
      function(success) {
        $scope.type = success.data.INFO;
        console.log($scope.type);
        $ionicLoading.hide();
      },
      function(error) {
        $ionicLoading.hide();

        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Tenha certeza que você está na sua rede Local.',
          okText: 'Ok',
          okType: 'button-positive'
        }).then(function(res) {
          $state.go('app.main');
        });
      }
    );
  };

  $scope.$on('$ionicView.enter', function(e) {
    $ionicLoading.show();
    $scope.infoDevice();
  });


  $scope.setNewDevice = function() {
    console.log($rootScope.kerk);
    //return false;

    var devicePlace = $scope.home.devicePlace;
    var deviceName = $scope.home.deviceName;

    if(devicePlace == '' || deviceName == '') {
      $ionicPopup.alert({
        title: 'Ops!',
        template: 'Preencha todos os dados antes de prosseguir',
        okText: 'Ok',
        okType: 'button-positive'
      });

      return;
    }

    if($rootScope.kerk[$rootScope.currentHome].placeList.indexOf(devicePlace) == -1) {
      $rootScope.kerk[$rootScope.currentHome].placeList.push(devicePlace);
      $rootScope.kerk[$rootScope.currentHome][devicePlace] = {};
      $rootScope.kerk[$rootScope.currentHome][devicePlace].deviceList = [];
      $rootScope.kerk[$rootScope.currentHome][devicePlace].deviceList.push(deviceName);
    } else {
      if($rootScope.kerk[$rootScope.currentHome][devicePlace].deviceList.indexOf(deviceName) > -1) {
        $ionicPopup.alert({
          title: 'Ops!',
          template: 'Já existe um Dispositivo com este nome no mesmo Local.',
          okText: 'Ok',
          okType: 'button-positive'
        });

        return;
      } else {
        $rootScope.kerk[$rootScope.currentHome][devicePlace].deviceList.push(deviceName);
      }
    }

    $rootScope.kerk.devicesIds.push($rootScope.newDeviceId);

    $rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName] = {};
    $rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName].id = $rootScope.newDeviceId;

    if($scope.type == 'LUZ 1') {
      $rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName].buttonList = ['b1'];
    } else if ($scope.type == 'LUZ 2') {
      $rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName].buttonList = ['b1', 'b2'];
    } else if ($scope.type == 'LUZ 3') {
      $rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName].buttonList = ['b1', 'b2', 'b3'];
    }

    var count = 1;
    angular.forEach($rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName].buttonList, function(value,key) {
      $rootScope.kerk[$rootScope.currentHome][devicePlace][deviceName][value] = {
        id: count,
        status: 'on',
        statusBtnClass: 'device-on',
        statusTxtClass: 'color-blue',
        statusText: 'Ligado'
      };
      count++;
    });

    console.log($rootScope.kerk);
    //return false;

    var kerk = angular.toJson($rootScope.kerk);
    window.localStorage.setItem('kerk.save', kerk);

    $ionicPopup.alert({
      title: 'Sucesso!',
      template: 'Novo Dispositivo Configurado!',
      okText: 'Ok',
      okType: 'button-positive'
    }).then(function(res) {
      $state.go('app.main');
    });
  };
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

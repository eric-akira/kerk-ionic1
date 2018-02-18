angular.module('starter.services', [])

.factory('BlankFactory', [function() {
	
}])

.service('KerkCentralService', ['$http', function($http) {
	this.formatIpForScan = function(ip) {
		ip = ip.split('.');
		return ip = ip[0] + '.' + ip[1] + '.' + ip[2] + '.';
	}

	this.scanIp = function(target) {
		return $http({method: 'GET', cache: false, url: 'http://' + target, timeout: 500});
	}

	this.formatSSIDList = function(string) {
		string = string.split("<a href='#p' onclick='c(this)'>");
		string.shift();
		result = [];

		angular.forEach(string, function(value, key) {
			this.push(value.substring(0,value.indexOf('<')));
		}, result);

		return result;
	}

	this.connectSSID = function(ip,ssid,password) {
		//var target = ;
		//target = window.encodeURIComponent(target);
		ssid = window.encodeURIComponent(ssid);
		password = window.encodeURIComponent(password);
		return $http({method: 'GET', cache: false, url: 'http://' + ip + '/wifisave?=' + ssid + '&p=' + password});
	}
}])

.service('CommandService', ['$http', function($http) {
	//http://192.168.1.42/comando?ID=1234&lamp=1&status=on

	this.list = function(ip) {
		return $http({method: 'GET', cache: false, url: 'http://' + ip + '/comando?LIST=1'});
	}

	this.info = function(ip, did) {
		return $http({method: 'GET', cache: false, url: 'http://' + ip + '/comando?ID=' + did + '&INFO=1'});
	}

	this.changeStatus = function(ip, did, lid, status) {
		return $http({method: 'GET', cache: false, url: 'http://' + ip + '/comando?ID=' + did + '&lamp=' + lid + '&status=' + status});
	}

	this.getStatus = function(ip, did, lid) {
		return $http({method: 'GET', cache: false, url: 'http://' + ip + '/comando?ID=' + did + '&lamp=' + lid + '&status=?'});
	}
}])

.service('BlankService', [function() {
	
}]);
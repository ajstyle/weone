'use strict';


// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['myApp.filters',  'myApp.directives']).
 	config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/home', controller: 'MyCtrl1'});
	    $routeProvider.when('/home', {templateUrl: 'partials/home', controller: 'MyCtrl1'});
	    $routeProvider.when('/blog', {templateUrl: 'partials/blog', controller: 'MyCtrl2'});
	    $routeProvider.otherwise({redirectTo: '/'});
	  //  $locationProvider.html5Mode(true);
  }]);
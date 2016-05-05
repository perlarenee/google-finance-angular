'use strict';

// Declare app level module which depends on views, and components
angular.module('googleApp', [
  'ngRoute',
  'googleApp.worldmarkets'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/worldmarkets'});
}]);

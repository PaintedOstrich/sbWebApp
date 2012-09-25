'use strict';

/* App Module */

var MYAPP = angular.module('sportsbet', ['phonecatFilters', 'phonecatServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'app/partials/loading.html',   controller: RouteCtrl}).
      otherwise({redirectTo: '/'});
}]);

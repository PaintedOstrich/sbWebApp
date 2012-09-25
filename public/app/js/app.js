'use strict';

/* App Module */

angular.module('sportsbet', ['phonecatFilters', 'facebookService']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'app/partials/loading.html',   controller: RouteCtrl}).
      when('/login', {templateUrl: 'app/partials/home.html',   controller: LandingCtrl}).
      when('/profile', {templateUrl: 'app/partials/profile.html',   controller: ProfileCtrl}).
      otherwise({redirectTo: '/'});
}]).constant('fbSdk', FB);



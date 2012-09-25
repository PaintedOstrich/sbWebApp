'use strict';

/* App Module */

angular.module('sportsbet', ['phonecatFilters', 'facebookService']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'app/partials/loading.html',   controller: RouteCtrl}).
      when('/login', {templateUrl: 'app/partials/landing.html',   controller: LandingCtrl}).
      when('/bettype', {templateUrl: 'app/partials/bettype.html',   controller: BetTypeCtrl}).
      when('/profile', {templateUrl: 'app/partials/profile.html',   controller: ProfileCtrl}).
      otherwise({redirectTo: '/'});
}]);



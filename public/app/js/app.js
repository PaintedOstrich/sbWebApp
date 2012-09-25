'use strict';

/* App Module */

angular.module('sportsbet', ['phonecatFilters', 'phonecatServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'app/partials/loading.html',   controller: RouteCtrl}).
      otherwise({redirectTo: '/'});
}]).value('loggedIn', true); // TODO(Di) Should replace with proper FB SDK injection.


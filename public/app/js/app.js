'use strict';

/* App Module */

angular.module('sportsbet', ['phonecatFilters', 'phonecatServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/home', {templateUrl: 'app/partials/home.html',   controller: PhoneListCtrl}).
      when('/profile', {templateUrl: 'app/partials/profile.html',   controller: PhoneListCtrl}).
      when('/bet', {templateUrl: 'app/partials/bet.html',   controller: PhoneListCtrl}).
      when('/community', {templateUrl: 'app/partials/community.html',   controller: PhoneListCtrl}).
      when('/faq', {templateUrl: 'app/partials/faq.html',   controller: PhoneListCtrl}).
      otherwise({redirectTo: '/home'});
}]);

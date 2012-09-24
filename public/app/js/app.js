'use strict';

/* App Module */

angular.module('sportsbet', ['phonecatFilters', 'phonecatServices']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/home', {templateUrl: 'app/partials/home.html',   controller: HomeCtrl}).
      when('/profile', {templateUrl: 'app/partials/profile.html',   controller: ProfileCtrl}).
      when('/bet', {templateUrl: 'app/partials/bet.html',   controller: BetCtrl}).
      when('/community', {templateUrl: 'app/partials/community.html',   controller: CommunityCtrl}).
      when('/faq', {templateUrl: 'app/partials/faq.html',   controller: FAQCtrl}).
      otherwise({redirectTo: '/home'});
}]);

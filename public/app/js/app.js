'use strict';

/* App Module */

angular.module('sportsbet', ['serverApi', 'services']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/', {templateUrl: 'app/partials/loading.html',   controller: RouteCtrl}).
      when('/login', {templateUrl: 'app/partials/landing.html',   controller: LandingCtrl}).
      when('/profile', {templateUrl: 'app/partials/profile.html',   controller: ProfileCtrl}).
      when('/faq', {templateUrl: 'app/partials/faq.html',   controller: FaqCtrl}).
      when('/contact', {templateUrl: 'app/partials/contact.html',   controller: ContactCtrl}).
      // Betting routes
      when('/bettype', {templateUrl: 'app/partials/bettype.html',   controller: BetTypeCtrl}).
      when('/socialbet', {templateUrl: 'app/partials/socialbet.html',   controller: SocialBetCtrl}).
      when('/vegasbet', {templateUrl: 'app/partials/community.html',   controller: BetTypeCtrl}).
      otherwise({redirectTo: '/'});
}]);



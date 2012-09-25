'use strict';

/* Controllers */

// The very first controller to be reached that routes traffic to
// landing page for visitors and profile page for returning user.
function RouteCtrl($scope, $location, fb) {
  var promise = fb.getLoginStatus($scope);
  promise.then(function(uid, accessToken) {
    $location.path('/profile');
  }, function(reason) {
    $location.path('/login');
  });
}
RouteCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for landing screen for visitor
function LandingCtrl($scope, $location, fb) {
  $scope.login = function() {
    var permissions = {scope: 'email,user_likes'};
    var promise = fb.login($scope, permissions);
    promise.then(function(response) {
      $location.path('/bettype');
    });
  }
}
LandingCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for user profile screen
function ProfileCtrl($scope, $location, fb) {
  $scope.newBet = function() {
    $location.path('bettype');
  }
}
ProfileCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for bet type screen
function BetTypeCtrl($scope, $location, fb) {
  $scope.socialBtnPressed = function() {
    $location.path('/socialbet');
  }

  $scope.vegasBtnPressed = function() {
    $location.path('vegasbet');
  }
}
BetTypeCtrl.$inject = ['$scope', '$location', 'fb']

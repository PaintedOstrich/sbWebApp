'use strict';

/* Controllers */

// The very first controller to be reached that routes traffic to
// landing page for visitors and profile page for returning user.
function RouteCtrl($scope, $location, fb) {
  var promise = fb.getLoginStatus($scope);
  promise.then(function(response) {
    if (response.status === 'connected') {
      $location.path('/profile');
    } else {
      // the user is not logged in to Facebook
      // or has not authenticated your app
      $location.path('/login');
    }
  });
}
RouteCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for landing screen for visitor
function LandingCtrl($scope, $location, fb) {
  $scope.login = function() {
    var permissions = {scope: 'email,user_likes'};
    var promise = fb.login($scope, permissions);
    promise.then(function(response) {
      if (response.authResponse) {
        $location.path('/bettype');
      }
    });
  }
}
LandingCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for user profile screen
function ProfileCtrl($scope, $location, fb) {
  $scope.user = {};
  $scope.newBet = function() {
    $location.path('bettype');
  }

  fb.api($scope, '/me').then(function(response) {
    if (response.username) {
      $scope.user = response;
    } else {
     console.error('Failed to load the current user!');
    }
  });
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


// Controller for social bet screen
function SocialBetCtrl($scope) {
  $scope.selectedFriends = [];

  $scope.addFriend = function() {
    $scope.selectedFriends.push({});
  }

  $scope.removeFriend = function(index) {
    // We only accept positive number here as
    // negative number will do rever splice which we don't want.
    if (index < 0) {
      index *= -1;
    }
    $scope.selectedFriends.splice(index, 1);
  }
}
SocialBetCtrl.$inject = ['$scope'];
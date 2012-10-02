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
  // TODO(Di) Make this laod dynamically.
  $scope.events = [
    {id: 'e1', name: 'League Final'},
    {id: 'e2', name: 'Pingpong Semi-Final'},
    {id: 'e3', name: 'Pingpong Qualifying'},
    {id: 'e4', name: 'Soccer Final'},
    {id: 'e5', name: 'Football Final'}
  ];

  $scope.currentPanel = 'friendsPanel';
  $scope.panels = [
    'friendsPanel',
    'eventsPanel',
    'configurePanel'
  ]

  $scope.betPlaced = false;
  // $scope.currentBet = {
  //   event: undefined,
  //   bet: {
  //     winner: {}
  //   }
  //
  //    [
  //     {friend: {}, amount: 12}
  //   ]
  // }

  // Validate the user input in friends panel.
  $scope.validateFriendsPanel = function() {
    var count = $scope.selectedFriends.length > 0;
    var allFilled = true;
    $scope.selectedFriends.forEach(function(friend) {
      allFilled = allFilled && (!!friend.name);
    });
    return count > 0 && allFilled;
  }

  $scope.prevPanel = function() {
    var index = $scope.panels.indexOf($scope.currentPanel);
    $scope.currentPanel = $scope.panels[index - 1];
    // In unit test, jquery is not present.
    if (typeof $ == 'function') {
      $('.carousel').carousel('prev');
    }
  }

  $scope.nextPanel = function() {
    var index = $scope.panels.indexOf($scope.currentPanel);
    $scope.currentPanel = $scope.panels[index + 1];
    // In unit test, jquery is not present.
    if (typeof $ == 'function') {
      $('.carousel').carousel('next');
    }
  }

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

  // Allow user to configure how much to bet on each friend
  // selected
  $scope.configureBet = function() {

  }

  $scope.eventSelected = function(event) {
    $scope.selectedEvent = event;
    $scope.nextPanel();
  }
}
SocialBetCtrl.$inject = ['$scope'];
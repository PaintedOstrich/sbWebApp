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

  fb.getMe($scope).then(function(me) {
      $scope.user = me;
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
    {
      id: 'e1', name: 'League Final',
      firstTeam: {name: 'teamA'}, secTeam: {name: 'teamB'}
    },
    {
      id: 'e2', name: 'Pingpong Semi-Final',
      firstTeam: {name: 'Titan'}, secTeam: {name: 'China'}
    },
    {
      id: 'e3', name: 'Pingpong Qualifying',
      firstTeam: {name: 'teamA'}, secTeam: {name: 'teamB'}
    },
    {
      id: 'e4', name: 'Soccer Final',
      firstTeam: {name: 'teamA'}, secTeam: {name: 'teamB'}
    },
  ];

  $scope.currentPanel = 'friendsPanel';
  $scope.panels = [
    'friendsPanel',
    'eventsPanel',
    'configurePanel'
  ]

  $scope.betPlaced = false;

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


  var betTemplate = {
    initialized: false,
    event: undefined,
    winner: undefined,
    bets: []
  };

  $scope.currentBet = angular.copy(betTemplate);
  // User betting on the victory of a particular team
  $scope.betOnTeam = function(team) {
    $scope.betPlaced = true;
    $scope.currentBet.winner = team;
    if (!$scope.currentBet.initialized) {
      initializeBets();
    }
  }

  // Initialize all bet amount to be zero.
  function initializeBets() {
    $scope.selectedFriends.forEach(function(friend) {
      var bet = {
        friend: friend,
        amount: 0
      }
      $scope.currentBet.bets.push(bet);
    });
    $scope.currentBet.initialized = true;
  }

  $scope.isPredictedWinner = function(team) {
    return team == $scope.currentBet.winner;
  }

  $scope.eventSelected = function(event) {
    $scope.selectedEvent = event;
    $scope.nextPanel();
  }

  // May be used when user navigate back to event page, so we want to clear
  // the current bets.
  $scope.clearCurrentBet = function() {
     $scope.prevPanel();
     $scope.currentBet = angular.copy(betTemplate);
     $scope.betPlaced = false;
  }

  // Finally place the bet after all confuguration is done.
  $scope.placeBet = function() {
    alert('bet is placed');
  }
}
SocialBetCtrl.$inject = ['$scope'];
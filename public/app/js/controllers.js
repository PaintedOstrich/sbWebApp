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
function ProfileCtrl($scope, $location, fb, loadMask, $q) {
  $scope.user = {};
  $scope.newBet = function() {
    $location.path('bettype');
  }

  $scope.init = function() {
    loadMask.show({text: 'Loading User Profile...'});
    var promise1 = fb.api($scope, '/me');
    var promise2 = fb.api($scope, '/me/picture?type=large');
    $q.all([promise1, promise2]).then(function(res) {
        if (res[0].error) {
          console.error('Failed to load user!');
        } else {
          $scope.user = res[0];
        }

        if (res[1].error) {
          console.error('Failed to load user image');
        } else {
          $scope.imgUrl = res[1].data.url;
        }
        loadMask.hide();
    });
  }
  $scope.init();
}
ProfileCtrl.$inject = ['$scope', '$location', 'fb', 'loadMask', '$q'];


// Controller for bet type screen
function BetTypeCtrl($scope, $location) {
  $scope.socialBtnPressed = function() {
    $location.path('/socialbet');
  }

  $scope.vegasBtnPressed = function() {
    $location.path('vegasbet');
  }
}
BetTypeCtrl.$inject = ['$scope', '$location']


// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask) {
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

  // Load friends of current user.
  // This function is run everytime we navigate to social bet page.
  $scope.loadFriends = function() {
    loadMask.show({text: 'Loading Friends...'});
    fb.api($scope, '/me/friends').then(function(allFriends) {
      $scope.parseFriends(allFriends.data);
      loadMask.hide();
    });
  }
  $scope.loadFriends();

  // Parse the friends array returned from fb.
  $scope.parseFriends = function(friendsArr) {
    // An id to friend obj map.
    $scope.allFriends = {};
    friendsArr.forEach(function(friend) {
      // This is just to let select2 lib know how to display.
      friend.text = friend.name;
      $scope.allFriends[friend.id] = friend;
    });

    // Used to format drop down menu item.
    function format(friend) {
      return "<img class='flag' src='http://graph.facebook.com/"
          + friend.id + "/picture/'>" + friend.name;
    }

    $scope.friendInput = $('.friendInput').select2({
      data: friendsArr,
      multiple: true,
      minimumInputLength:2,
      formatResult: format
    });

    $scope.friendInput.on('change', function(e) {
      $scope.$apply(function() {
        var tmp = [];
        e.val.forEach(function(friendId) {
          var friend = $scope.allFriends[friendId];
          if (friend) {
            tmp.push(friend);
          }
        });
        $scope.selectedFriends = tmp;
      });
    });
  }

  // Validate the user input in friends panel.
  $scope.validateFriendsPanel = function() {
    return $scope.selectedFriends.length > 0;
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
SocialBetCtrl.$inject = ['$scope',  'fb', 'loadMask'];
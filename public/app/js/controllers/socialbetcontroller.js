// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask) {
  // Friends selected to place bet on.
  $scope.selectedFriends = [];
  // An id to Friend obj mapping storing all user's fb friends.
  $scope.allFriends = {};
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
  $scope.gameTypes = [
    {name: 'NFL', value: 'nfl'}
  ]
  // Deafult to choose the first value
  $scope.gameType = $scope.gameTypes[0];

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
    fb.api($scope, '/me/friends').then(function(res) {
      if (res.error) {
        alert('Sorry, failed to load friends. Please try again.');
      } else {
        $scope.allFriends = {};
        res.data.forEach(function(friend) {
          $scope.allFriends[friend.id] = friend;
        });
        $scope.initSelectWidget(res.data);
      }
      loadMask.hide();
    });
  }
  $scope.loadFriends();

  // Used to format drop down menu item.
  function format(friend) {
    return "<img class='friendEntry' src='http://graph.facebook.com/"
        + friend.id + "/picture/'>" + friend.name;
  }
  // Initialize the select2 widget.
  $scope.initSelectWidget = function(friendsArr) {
     friendsArr.forEach(function(friend) {
       // This is just to let select2 lib know how to display.
       friend.text = friend.name;
     });

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

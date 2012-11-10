// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask, betAPI, $q) {
  // parent scope should be MainCtrl.
  $scope.$parent.setActiveTab('betpage');
  // ------------------- Controller variables ----------------
  // Friends selected to place bet on.
  $scope.selectedFriends = [];
  // An id to Friend obj mapping storing all user's fb friends.
  $scope.allFriends = {};

  // TODO these varaibles should be loaded dynamically.
  $scope.gameTypes = [
    {name: 'NFL', value: 'NFL'}
  ]
  // Deafult to choose the first value
  $scope.gameType = $scope.gameTypes[0];
  // A list of games to be displayed in the grid.
  $scope.games = [];

  // The bet to be placed.
  $scope.bet = undefined;
  // TODO This should be a singleton
  $scope.user = {
    balance: 100,
    currentBalance: 100
  }
  // ---------------------------------------------------------

  // ----------------- Initializing funciton ----------------
  // Initialize by loading friends from fb, games from bet server.
  $scope.loadData = function() {
    loadMask.show({text: 'Loading friends and games...'});
    var friendReq = fb.api($scope, '/me/friends');
    var gameReq = betAPI.loadGames($scope.gameType.value);
    $q.all([friendReq, gameReq]).then($scope.processData);
  }

  $scope.processData = function(combinedData) {
    var friendRes = combinedData[0];
    $scope.processFriendsData(friendRes);
    var gameRes = combinedData[1];
    $scope.processGameData(gameRes);
    loadMask.hide();
  }

  $scope.processGameData = function(res) {
    // TODO add error handling.
    $scope.games = res;
    $scope.games.forEach(function(game) {
      // date should still be a raw string.
      if (game.date) {
        game.date = new Date(game.date);
      }
    });
  }

  $scope.processFriendsData = function(res) {
    if (res.error) {
      alert('Sorry, failed to load friends. Please try again.');
    } else {
      $scope.allFriends = {};
      res.data.forEach(function(friend) {
        $scope.allFriends[friend.id] = friend;
      });
      $scope.initSelectWidget(res.data);
    }
  }

  // Caling loadData to initialize the page.
  $scope.loadData();

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

 $scope.recalcBalance = function() {
   if ($scope.bet) {
     var numFriendsBeted = $scope.selectedFriends.length;
     var betAmount = numFriendsBeted * ($scope.bet.betOnTeam1 + $scope.bet.betOnTeam2);
     $scope.user.currentBalance = $scope.user.balance - betAmount;
   }
 }

 $scope.$watch('selectedFriends', $scope.recalcBalance);
 $scope.$watch('bet.betOnTeam1', $scope.recalcBalance);
 $scope.$watch('bet.betOnTeam2', $scope.recalcBalance);

 // -------------------------------------------------------

 // Initialize a bet
 $scope.initBet = function(game) {
   // Should use a resource class. but it is fine for now!
   $scope.bet = {
     game: game,
     betOnTeam1: 0,
     betOnTeam2: 0
   };
 }
}
SocialBetCtrl.$inject = ['$scope',  'fb', 'loadMask', 'betAPI', '$q'];



/**

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

*/

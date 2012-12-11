// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask, betAPI, $q, $timeout, currentUser, videoAd) {
  $scope.$parent.showInfoBackground = true;
  // ------------------- Controller variables ----------------
  // Friends selected to place bet on.
  $scope.selectedFriends = [];
  // An id to Friend obj mapping storing all user's fb friends.
  $scope.allFriends = [];

  // The friends to display in friend panel
  $scope.friendsToDisplay = [];
  // This correspond to the select box: all/selected.
  $scope.friendFilter = "all";

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
  // Sample bet amount is 50;
  $scope.sampleBetAmount = 50;

  $scope.pages = ['gameSelection', 'friendSelection'];
  $scope.currentPage = 0;
  // ---------------------------------------------------------

  // ----------------- Initializing funciton ----------------
  $scope.$watch('currentPage', function(newVal, oldVal) {
    if (oldVal != newVal) {
      var oldPage = $scope.pages[oldVal];
      var newPage = $scope.pages[newVal];
      $('.socialBet .' + oldPage).fadeOut(300, function() {
        $('.socialBet .' + newPage).fadeIn(300);
      });
    }
  });

  // Initialize by loading friends from fb, games from bet server.
  $scope.loadData = function() {
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
      $scope.allFriends = res.data;
      $scope.friendsToDisplay = $scope.allFriends;
    }
  }

  $scope.initialize = function() {
    loadMask.show({text: 'Loading friends and games...'});
    if (currentUser.isLoaded()) {
      $scope.loadData();
    } else {
      // user info may not have been loaded if we
      // come from visitor screen directly.
      currentUser.loadUser($scope).then($scope.loadData);
    }
  }
  // Initialize the page.
  $scope.initialize();

 $scope.calcBetAmount = function() {
   if ($scope.bet) {
     var numFriendsBeted = $scope.selectedFriends.length;
     $scope.bet.amount = numFriendsBeted * 0.1; // Each friend worth 10 cents in bet!
   }
 }

 $scope.$watch('selectedFriends.length', $scope.calcBetAmount);
 $scope.$watch('friendFilter', function(newVal) {
   // Complicated timeouts to make dom manipulation a bit smoother!!
   $scope.friendsToDisplay = [];
   $timeout(function() {
     if (newVal == 'all') {
       $scope.friendsToDisplay = $scope.allFriends;
     } else if (newVal == 'selected') {
       $scope.queryFriend = '';
       $scope.friendsToDisplay = $scope.selectedFriends;
     }
   }, 50, true);
 });
 // -------------------------------------------------------

 // Initialize a bet
 $scope.initBet = function(game, winnerId) {
   var spread = winnerId == game.team1Id ? game.spreadTeam1 : game.spreadTeam2;
   var winnerName = winnerId == game.team1Id ? game.team1Name : game.team2Name;
   // Should use a resource class. but it is fine for now!
   $scope.bet = {
     game: game,
     winner: winnerId,
     winRatio: $scope.calcWinRatio(spread),
     amount:  0,
     winnerName: winnerName
   };
   $scope.calcBetAmount();
 }

 /* Calculate win ratio from odds
  * if spread is -105, then you bet $105 dollars to win $100
  * if spread is 120, then you bet $100 dollars to win $120
  */
 $scope.calcWinRatio = function(winSpread) {
  var odds = parseFloat(winSpread);
  var toR;
  if (odds < 0) {
    toR = 100.0/odds;
  } else {
    toR = odds/100.0;
  }
  return Math.abs(toR);
 }

 $scope.inSelectedFriends = function(friend) {
   return $scope.selectedFriends.indexOf(friend) >= 0;
 }

 $scope.toggleSelect = function(friend) {
   var index = $scope.selectedFriends.indexOf(friend);
   if (index >= 0) {
     $scope.selectedFriends.splice(index, 1);
   } else {
     $scope.selectedFriends.push(friend);
   }
 }

 // Show an advertisement for the user to watch.
 $scope.watchAd = function() {
   loadMask.show({hideSpinner: true});
   videoAd.showAd({delegate: $scope});
 }
 
 // Delegate method to be called by videoAd service
 $scope.adEnded = function() {
   loadMask.hide();
 }

 // Invoked when the place bet button is clicked by user.
 $scope.betBtnClicked = function() {
   if ($scope.bet.amount > currentUser.balance) {
     $scope.watchAd();
   } else {
     console.log('should post bet??');
   }
 }

 // Post bets to the server
 $scope.postBet = function() {
   var bet = {
     initFBId: currentUser.id,
     // Assuming even distribution
     betAmount: $scope.bet.amount / $scope.selectedFriends.length,
     type: 'spread',
     gameId: $scope.bet.game.gid,
     initTeamBet: $scope.bet.winner,
     spreadTeam1: $scope.bet.game.spreadTeam1,
     spreadTeam2: $scope.bet.game.spreadTeam2
   };
   for (var i=0; i < $scope.selectedFriends.length; i++)
   {
     bet.callFBId = $scope.selectedFriends[i].id;
     betAPI.placeBet(bet);
   }
 }
}
SocialBetCtrl.$inject = ['$scope',  'fb', 'loadMask', 'betAPI', '$q', '$timeout', 'currentUser', 'videoAd'];

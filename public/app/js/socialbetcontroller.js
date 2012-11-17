// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask, betAPI, $q, $timeout) {
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
      $scope.allFriends = res.data;
      $scope.friendsToDisplay = $scope.allFriends;
    }
  }

  // Caling loadData to initialize the page.
  $scope.loadData();

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
 $scope.initBet = function(game) {
   // Should use a resource class. but it is fine for now!
   $scope.bet = {
     game: game,
     betOnTeam1: 0,
     betOnTeam2: 0
   };
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
}
SocialBetCtrl.$inject = ['$scope',  'fb', 'loadMask', 'betAPI', '$q', '$timeout'];

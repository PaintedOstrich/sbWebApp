// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask, betAPI, $q) {
  // ------------------- Controller variables ----------------
  // Friends selected to place bet on.
  $scope.selectedFriends = [];
  // An id to Friend obj mapping storing all user's fb friends.
  $scope.allFriends = [];

  // The friends to display in friend panel
  $scope.friendsToDisplay = [];
  // The number of columns to display friends.
  $scope.friendColumn = 6;
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
      $scope.friendsToDisplay =
          $scope.formatFriendData($scope.allFriends, $scope.friendColumn);
    }
  }

  // Caling loadData to initialize the page.
  $scope.loadData();

  // Format the input flat array to become nested array with colNum of arrays.
  $scope.formatFriendData = function(sourceArr, colNum, filterTxt) {
    var answer = [];
    var tmpArr = [];
    var i = colNum;
    while (i > 0) {
      answer.push([]);
      i--;
    }

    if (filterTxt) {
      sourceArr.forEach(function(data) {
        // Only add if the friend's name contains the filter text
        if (data.name.toLowerCase().search(filterTxt.toLowerCase()) >= 0) {
          tmpArr.push(data);
        }
      });
    } else {
      tmpArr = sourceArr
    }

    var j = 0;
    while (j < tmpArr.length) {
      var data = tmpArr[j];
      var mod = j % colNum;
      answer[mod].push(data);
      j++;
    }
    return answer;
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
 $scope.$watch('friendFilter', function(newVal) {
   if (newVal == 'all') {
     $scope.friendsToDisplay =
        $scope.formatFriendData($scope.allFriends, $scope.friendColumn, $scope.queryFriend);
   } else if (newVal == 'selected') {
     $scope.friendsToDisplay =
         $scope.formatFriendData($scope.selectedFriends, $scope.friendColumn);
   }
 });
 // Filter the friends to display whenever friend filter text changed.
 $scope.$watch('queryFriend', function(newVal) {
   $scope.friendsToDisplay =
       $scope.formatFriendData($scope.allFriends, $scope.friendColumn, $scope.queryFriend);
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
SocialBetCtrl.$inject = ['$scope',  'fb', 'loadMask', 'betAPI', '$q'];

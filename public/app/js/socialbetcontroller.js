// Controller for social bet screen
function SocialBetCtrl($scope, fb, loadMask, betAPI, $q, $timeout, currentUser, videoAd) {
  $scope.$parent.showInfoBackground = true;
  // ------------------- Controller variables ----------------
  // Friends selected to place bet on.
  $scope.selectedFriends = [];
  // An id to Friend obj mapping storing all user's fb friends.
  $scope.allFriends = [];
  // An array of all friends of the user who are also using
  // our app.
  $scope.otherUsers = [];

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
    var friendReq = fb.api($scope, '/me/friends/?fields=name,installed');
    var gameReq = betAPI.loadGames($scope.gameType.value);
    $q.all([friendReq, gameReq]).then($scope.processData);
  }

  $scope.processData = function(combinedData) {
    var friendRes = combinedData[0];
    $scope.processFriendsData(friendRes);
    var gameRes = combinedData[1];
    $scope.processGameData(gameRes);
    loadMask.loadSuccess();
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
      $scope.allFriends.forEach(function(friend) {
        if (friend.installed) {
          $scope.otherUsers.push(friend);
        }
      });
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

  // We need this special conversion because
  // floating number arithmetic is weird.
  // 0.1 * 0.3 = 0.30000000004 ???!!!!
  // Read about it here: http://floating-point-gui.de/basic/
  function numConvert(num) {
    return Number(num.toFixed(2));
  }

 $scope.calcBetAmount = function() {
   if ($scope.bet) {
     var selectedFriendCount = $scope.selectedFriends.length;
     var betCount = selectedFriendCount;
     for (var i = 0; i < $scope.selectedFriends.length; i++) {
       if ($scope.otherUsers.indexOf($scope.selectedFriends[i]) >= 0) betCount--;
     }
     $scope.bet.realAmount = numConvert(betCount * 0.1); // Each friend worth 10 cents in bet!
     $scope.bet.displayAmount = numConvert(selectedFriendCount * 0.1);
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
     } else if (newVal == 'installed') {
       $scope.queryFriend = '';
       $scope.friendsToDisplay = $scope.otherUsers;
     }
   }, 1, true);
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
     displayAmount:  0,
     realAmount: 0,
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
   if ($scope.inSelectedFriends(friend)) {
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
   $scope.doPostBet();
 }

 // Invoked when the place bet button is clicked by user.
 $scope.betBtnClicked = function() {
     if ($scope.needsRequest()) {
       $scope.sendRequestToNoneUsers();
     } else {
       $scope.postBet();
     }
 }

 $scope.postBet = function() {
   // Just to make sure the bet amount is most up to date, since the 
   // watcher will only be called async.
   $scope.calcBetAmount();
   if ($scope.bet.realAmount > currentUser.balance) {
     // Should pop up a dialog box, give user ways to get more money.
     $scope.watchAd();
   } else {
     $scope.doPostBet();
   }
 }

 // Check if any selected friends are not in the list of friends that
 // have already installed our app.
 $scope.needsRequest = function() {
   for (var i = 0; i < $scope.selectedFriends.length; i++) {
     if ($scope.otherUsers.indexOf($scope.selectedFriends[i]) < 0) return true;
   }
   return false;
 }

 $scope.sendRequestToNoneUsers = function() {
   // Figure out who are the non-users
   var nonUserIds = [];
   for (var i = 0; i < $scope.selectedFriends.length; i++) {
     if ($scope.otherUsers.indexOf($scope.selectedFriends[i]) < 0) {
       nonUserIds.push($scope.selectedFriends[i].id);
     }
   }

   var opts = {
     method: 'apprequests',
     message: 'I challenge you to a Swagger bet!',
     to: nonUserIds.join(','),
     title: 'Follwing friends are not yet on Swagger:'
   }

   fb.ui($scope, opts).then(function(res) {
     if (res) {
       // If res is defined, user has accepted the request to send to friends.
       $scope.postBet();
     } else {
       // User does not want to send requests to new friends(remove these friends and
       // post bet request for the rest of the friends)
       var newSelectedFriends = [];
       for (var i = 0; i < $scope.selectedFriends.length; i++) {
         var tmp =$scope.selectedFriends[i];
         if ($scope.otherUsers.indexOf(tmp) >= 0) {
           newSelectedFriends.push(tmp);
         }
       }
       if (newSelectedFriends.length > 0) {
         $scope.selectedFriends = newSelectedFriends;
         $scope.postBet();
       }
     }
   });
 }


 // Actually posting bet to the server, after making sure the requests are sent
 // to none-users.
 $scope.doPostBet = function() {
   var friendIds = [];
   for (var i=0; i < $scope.selectedFriends.length; i++)
   {
     friendIds.push($scope.selectedFriends[i].id);
   }
   var bet = {
     initFBId: currentUser.id,
     callFBIds: friendIds,
     // Assuming even distribution
     betAmount: $scope.bet.amount,
     type: 'spread',
     gameId: $scope.bet.game.gid,
     initTeamBetId: $scope.bet.winner,
     spreadTeam1: $scope.bet.game.spreadTeam1,
     spreadTeam2: $scope.bet.game.spreadTeam2
   };
   loadMask.show({text: 'Placing bets....'});
   betAPI.placeBet(bet).then($scope.networkSuccess, $scope.networkFailed);
 }

 $scope.networkSuccess = function(res) {
   if (res.err) {
     $scope.betFailed(res);
   } else {
     $scope.betSuccess(res);
   }
 }

 $scope.networkFailed = function(err) {
   loadMask.loadFailed({text: 'Failed, please check your connections'});
 }

 $scope.betFailed = function(err) {
   loadMask.loadFailed({text: 'Failed to place bet. Please try again.'});
 }

 $scope.betSuccess = function(res) {
   loadMask.loadSuccess({text: 'Bet posted, redirecting...'});
   $timeout(angular.bind($scope.$parent, $scope.$parent.showProfile), 500);
 }

}
SocialBetCtrl.$inject = ['$scope',  'fb', 'loadMask', 'betAPI', '$q', '$timeout', 'currentUser', 'videoAd'];

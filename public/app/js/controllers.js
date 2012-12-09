'use strict';

/* Controllers */

// The top most controller, mainly in charge of navigations.
function MainCtrl($scope, currentUser, $location) {
  $scope.user = currentUser;

  $scope.$on('betInviteCliked', function(e, bet) {
    $scope.$broadcast('showBetInvite', bet);
  });

  $scope.$on('showMultipleBets', function(e, betArr) {
    $scope.$broadcast('showBetInvite', betArr);
  });

  // Show profile page after the user name on nav bar is clicked
  $scope.showProfile = function() {
    $location.path('/profile');
  }

  $scope.newBet = function() {
    $location.path('socialbet');
  }
}
MainCtrl.$inject = ['$scope', 'currentUser', '$location'];

// A sort of widget controllers for bet info widget popup
function BetInviteCtrl($scope) {
  $scope.$on('showBetInvite', function(e, bet) {
    if (bet instanceof Array) {
      $scope.showMultipleBets(bet);
    } else {
      $scope.showBet(bet);
    }
  });

  // show a single bet
  $scope.showBet = function(bet) {
    $scope.modalShown = true;
    $scope.betInvite = bet;
  }

  // Show multiple bets, one after another
  $scope.showMultipleBets = function(betArr) {

  }

  $scope.acceptBet = function() {
    $scope.modalShown = false;
    console.log("TODO! implement accept bet logic!!");
  }

  $scope.declineBet = function() {
    $scope.modalShown = false;
    console.log("TODO! implement decline bet logic!!");
  }
}
BetInviteCtrl.$inject = ['$scope'];
// ---------- End of widget controllers ------------------------

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
        $location.path('/socialbet');
      }
    });
  }
}
LandingCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for user profile screen
function ProfileCtrl($scope, $location, fb, loadMask, currentUser, $q) {
  $scope.$parent.showInfoBackground = true;
  $scope.currentTab = 'active';
  $scope.betTemplateUrl = 'app/partials/profile/bet.html';

  $scope.user = {};

  $scope.loadUser = function() {
    var deferred = $q.defer();
    if (currentUser.isLoaded()) {
      currentUser.queryBackend($scope).then(function() {
        $scope.user = currentUser;
        deferred.resolve();
      });
    } else {
      currentUser.loadUser($scope).then(function() {
        $scope.user = currentUser;
        deferred.resolve();
      }, function() {
        loadMask.hide();
        deferred.reject();
      });
    }
    return deferred.promise;
  }

  // We need to load user name for each user that initiates the bet from facebook.
  $scope.loadBetInfo = function() {
    var promises = [];
    if ($scope.user.activeBets) {
      $scope.user.activeBets.forEach(function(bet) {
        var promise = fb.api($scope, bet.initFBId + '?fields=name').
            then(function(res) {bet.initFBName = res.name});
        promises.push(promise);
      });
    }
    if ($scope.user.betInvites) {
      $scope.user.betInvites.forEach(function(bet) {
        var promise = fb.api($scope, bet.initFBId + '?fields=name').
            then(function(res) {bet.initFBName = res.name});
        promises.push(promise);
      });
    }
    return $q.all(promises);
  }

  // Invoked when loadBetInfo failed in some way
  $scope.loadBetFailed = function() {
    loadMask.hide();
  }

  // After bets are loaded, we check to see if there is any initial
  // bet invites we need to show up for the user to confirm (this
  // happens when user arrives to our app by clicking on an invite)
  $scope.checkInitActions = function() {
    loadMask.hide();
    var data = $('#initialData').attr('data');
    if (data) {
      var betsToShow = $scope.parseInitData(data);
      if (betsToShow.length > 0) {
        var bets = [];
        betsToShow.forEach(function(betId) {
          for (var i = 0; i <  $scope.user.betInvites.length; i++) {
            var betInvite = $scope.user.betInvites[i];
            if (betId == betInvite.betId) {
              bets.push(betInvite);
              break;
            }
          }
        });
        if (bets.length > 0) {
          $scope.$emit('showMultipleBets', bets);
        }
      }
    }
  }

  // Helper method to parse initial data passed in from url
  $scope.parseInitData = function(dataStr) {
    var toR = [];
    var chunks = dataStr.split('?');
    if (chunks.length < 2) return toR;

    chunks = chunks[1].split('=');
    if (chunks.length < 2) return toR;

    var fieldName = chunks[0];
    if (fieldName != 'showBet') return toR;

    var betIds = chunks[1].split(',');
    return betIds;
  }

  loadMask.show({text: 'Loading User Profile...'});
  $scope.loadUser().
      then($scope.loadBetInfo).
      then($scope.checkInitActions, $scope.loadBetFailed);

  // fire bet invite clicked event to parent
  $scope.betInviteClicked = function(bet) {
    $scope.$emit('betInviteCliked', bet);
  }
}
ProfileCtrl.$inject = ['$scope', '$location', 'fb', 'loadMask', 'currentUser', '$q'];



// For the faq.html page
function FaqCtrl($scope) {

}
FaqCtrl.$inject = ['$scope'];


// For the contact.html page
function ContactCtrl($scope) {

}
ContactCtrl.$inject = ['$scope'];
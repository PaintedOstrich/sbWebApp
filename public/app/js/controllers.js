'use strict';

/* Controllers */

// The top most controller, mainly in charge of navigations.
function MainCtrl($scope, currentUser, $location) {
  $scope.user = currentUser;

  $scope.$on('betInviteCliked', function(e, bet) {
    $scope.$broadcast('showBetInvite', bet);
  });
  
  // Show profile page after the user name on nav bar is clicked
  $scope.showProfile = function() {
    $location.path('/profile');
  }
}
MainCtrl.$inject = ['$scope', 'currentUser', '$location'];

// A sort of widget controllers for bet info widget popup
function BetInviteCtrl($scope) {
  $scope.$on('showBetInvite', function(e, bet) {
    $scope.modalShown = true;
    $scope.betInvite = bet;
  });

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
function ProfileCtrl($scope, $location, fb, loadMask, currentUser) {
  $('.infoBackground').show();

  $scope.templates =
     [ { name: 'template1.html', url: 'app/partials/profile/activebets.html'}
     , { name: 'template2.html', url: 'app/partials/profile/betinvites.html'} ];
   $scope.template = $scope.templates[0];

  $scope.user = {};
  // // The bet to be shown in bet info modal.
  // $scope.focusedBet = undefined;

  $scope.init = function() {
    loadMask.show({text: 'Loading User Profile...'});
    if (currentUser.isLoaded()) {
      currentUser.queryBackend($scope).then(function() {
        $scope.user = currentUser;
        loadMask.hide();
      });
    } else {
      currentUser.loadUser($scope).then(function() {
        $scope.user = currentUser;
        loadMask.hide();
      }, function() {
        loadMask.hide();
      });
    }
  }
  $scope.init();

  $scope.newBet = function() {
    $location.path('socialbet');
  }

  // note: this set/is ActiveTab methods override the methods on its parent scope.
  $scope.setActiveTab = function(index) {
    $scope.template = $scope.templates[index];
  }
  $scope.isActiveTab = function(index) {
    return $scope.template == $scope.templates[index];
  }

  // fire bet invite clicked event to parent
  $scope.betInviteClicked = function(bet) {
    $scope.$emit('betInviteCliked', bet);
  }
}
ProfileCtrl.$inject = ['$scope', '$location', 'fb', 'loadMask', 'currentUser'];



// For the faq.html page
function FaqCtrl($scope) {

}
FaqCtrl.$inject = ['$scope'];


// For the contact.html page
function ContactCtrl($scope) {

}
ContactCtrl.$inject = ['$scope'];
'use strict';

/* Controllers */

// The top most controller, mainly in charge of navigations.
function MainCtrl($scope, $location) {
  $scope.hideNavBar = true;
  // Keep track of which tab is active.
  $scope.activeTab = -1;
  $scope.tabNames = ['profile', 'betpage', 'faq', 'contact'];
  // Private variable to this parent controller.
  var pathMap = {
    profile: 'profile',
    betpage: 'bettype',
    faq: 'faq',
    contact: 'contact'
  }

  $scope.isActiveTab = function(index) {
    return $scope.activeTab == index;
  }

  // This setter can take either a string or a number.
  $scope.setActiveTab = function(index) {
    if (typeof index == 'string') {
      var tabIndex = $scope.tabNames.indexOf(index);
      if (tabIndex < 0) {
        console.error('The tab name passed in is not found!');
      }
      $scope.activeTab = tabIndex;
    } else {
     $scope.activeTab = index;
    }
    // Route the app to the right partial.
    var tabName = $scope.tabNames[$scope.activeTab];
    $location.path(pathMap[tabName]);
  }
}
MainCtrl.$inject = ['$scope', '$location'];


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
  // Hide the nav bar on landing screen.
  $scope.$parent.hideNavBar = true;

  $scope.login = function() {
    var permissions = {scope: 'email,user_likes'};
    var promise = fb.login($scope, permissions);
    promise.then(function(response) {
      if (response.authResponse) {
        $location.path('/bettype');
      }
    });
  }

  // show nav bar again
  $scope.$on('$destroy', function(){
    $scope.$parent.hideNavBar = false;
  });
}
LandingCtrl.$inject = ['$scope', '$location', 'fb'];


// Controller for user profile screen
function ProfileCtrl($scope, $location, fb, loadMask) {
  // show the nav bar on landing screen.
  $scope.$parent.hideNavBar = false;
  // parent scope should be MainCtrl.
  $scope.$parent.setActiveTab('profile');

  $scope.templates =
     [ { name: 'template1.html', url: 'app/partials/profile/activebets.html'}
     , { name: 'template2.html', url: 'app/partials/profile/betinvites.html'} ];
   $scope.template = $scope.templates[0];

  $scope.user = {};
  $scope.newBet = function() {
    $location.path('bettype');
  }

  $scope.init = function() {
    loadMask.show({text: 'Loading User Profile...'});
    fb.api($scope, '/me').then(function(res) {
      if (res.error) {
        console.error('Failed to load user!');
      } else {
        $scope.user = res;
        $scope.imgUrl = "http://graph.facebook.com/"
            + $scope.user.id + "/picture?type=large";
      }
      console.log($scope.user.id )
      loadMask.hide();
    });
  }
  $scope.init();

  // note: this set/is ActiveTab methods override the methods on its parent scope.
  $scope.setActiveTab = function(index) {
    $scope.template = $scope.templates[index];
  }
  $scope.isActiveTab = function(index) {
    return $scope.template == $scope.templates[index];
  }
}
ProfileCtrl.$inject = ['$scope', '$location', 'fb', 'loadMask'];


// Controller for bet type screen
function BetTypeCtrl($scope, $location) {
  // parent scope should be MainCtrl.
  $scope.$parent.setActiveTab('betpage');

  $scope.socialBtnPressed = function() {
    $location.path('/socialbet');
  }

  $scope.vegasBtnPressed = function() {
    $location.path('vegasbet');
  }
}
BetTypeCtrl.$inject = ['$scope', '$location']


// For the faq.html page
function FaqCtrl($scope) {

}
FaqCtrl.$inject = ['$scope'];


// For the contact.html page
function ContactCtrl($scope) {

}
ContactCtrl.$inject = ['$scope'];
'use strict';

/* Controllers */

// Temporarily leave here as an example
// function PhoneDetailCtrl($scope, $routeParams, Phone) {
//   $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
//     $scope.mainImageUrl = 'app/' + phone.images[0];
//   });
// 
//   $scope.setImage = function(imageUrl) {
//     $scope.mainImageUrl = imageUrl;
//   }
// }

//PhoneDetailCtrl.$inject = ['$scope', '$routeParams', 'Phone'];


// The very first controller to be reached that routes traffic to 
// landing page for visitors and profile page for returning user.
function RouteCtrl($scope, $location, loggedIn) {
  // TODO(Di) We need to figure out how to incorporate FB sdk into this flow.
  if (loggedIn) {
    $location.path('/profile');
  } else {
    $location.path('/login');
  }
}
RouteCtrl.$inject = ['$scope', '$location', 'loggedIn'];


function LandingCtrl() {
  console.log('landing');
}

function ProfileCtrl() {
  console.log('profile');
}


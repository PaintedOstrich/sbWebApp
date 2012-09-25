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
function RouteCtrl($scope, $location, fb) {
  var promise = fb.getLoginStatus($scope);
  promise.then(function(uid, accessToken) {
    console.log('user logged in');
    $location.path('/profile');
  }, function(reason) {
    console.log(reason);
  });
}
RouteCtrl.$inject = ['$scope', '$location', 'fb'];


function LandingCtrl() {
  console.log('landing');
}

function ProfileCtrl() {
  console.log('profile');
}


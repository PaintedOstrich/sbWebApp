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
    $location.path('/profile');
  }, function(reason) {
    $location.path('/login');
  });
}
RouteCtrl.$inject = ['$scope', '$location', 'fb'];


function LandingCtrl($scope, $location, fb) {
  $scope.login = function() {
    var permissions = {scope: 'email,user_likes'};
    var promise = fb.login($scope, permissions);
    promise.then(function(response) {
      $location.path('/bettype');
    });
  }
}
LandingCtrl.$inject = ['$scope', '$location', 'fb'];

function ProfileCtrl() {
  console.log('profile');
}


function BetTypeCtrl($scope, $location, fb) {
  console.log('choose social or vegas');
}
BetTypeCtrl.$inject = ['$scope', '$location', 'fb']

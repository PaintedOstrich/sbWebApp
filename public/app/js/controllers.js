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

function ProfileCtrl($scope) {
  console.log('Profile Ctrl created!');
}
ProfileCtrl.$inject = ['$scope'];

function HomeCtrl($scope) {
  console.log('Home Ctrl created!');
}

function BetCtrl($scope) {
  debugger;
}

function CommunityCtrl($scope) {
  console.log('Community Ctrl created!');
}

function FAQCtrl($scope) {
  console.log('FAQ Ctrl created!');
}


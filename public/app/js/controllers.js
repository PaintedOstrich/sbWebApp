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


/**
 * Highlight the focused tab.
 * @param {String} className The class name of the li dom node to highlight.
 */
function highLight(className) {
  var navBar = $('#mainNav');
  navBar.find('li.active').removeClass('active');
  navBar.find('li.' + className).addClass('active');
}

function ProfileCtrl($scope) {
  highLight('profile');
}
ProfileCtrl.$inject = ['$scope'];

function HomeCtrl($scope) {
  highLight('home');
}

function BetCtrl($scope) {
  highLight('bet');
}

function CommunityCtrl($scope) {
  highLight('community');
}

function FAQCtrl($scope) {
  highLight('faq');
}


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

/**
 * Fetch global variables (user id and etc.) into current scope.
 */
function fetchGlobals(scope) {
  scope.userId = $('#userid').attr('data');
}

function ProfileCtrl($scope) {
  highLight('profile');
  fetchGlobals($scope);
}
ProfileCtrl.$inject = ['$scope'];

function HomeCtrl($scope) {
  highLight('home');
  fetchGlobals($scope);
}

function BetCtrl($scope) {
  highLight('bet');
  fetchGlobals($scope);
}

function CommunityCtrl($scope) {
  highLight('community');
  fetchGlobals($scope);
}

function FAQCtrl($scope) {
  highLight('faq');
  fetchGlobals($scope);
}


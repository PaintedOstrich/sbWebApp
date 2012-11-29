'use strict';

/* Services */

angular.module('services', ['ng', 'ngResource'])
    .service('fb', FBSdk)
    .service('loadMask', LoadMask)
    .service('betAPI', BetAPI);


/**
 * A service to talk to bet API server.
 */
function BetAPI($resource, $q) {
  // The API server url.
  this.url = 'http://sportsbetsservice.herokuapp.com/api/games'

  var Game = $resource(this.url + '/:gameType', {gameType: '@gameType'}, {});
  this.loadGames = function(gameType) {
    var deferred = $q.defer();
    var games = Game.query({gameType: gameType}, function() {
      deferred.resolve(games);
    }, function() {
      console.error('Failed to load games');
    });
    return deferred.promise;
  }
}



/**
 * A load mask singleton class that is used to show and hide a loading mask
 * Note: This service has implicit dependency on jQuery, Spin.js and jQuery.spin.js.
 * TODO (Di) We probably can have different sizes.
 */
function LoadMask($timeout) {
  // The mask jquery element.
  var maskEl;
  var spinnerConfig = {
    color: 'white',
    top: '40%'
  };

  // Creating a spinner component with default configurations.
  this.createMaskEl = function() {
    var dom = '<div class="loadMask">' +
                '<div class="backDrop"></div>' +
                '<div class="spinnerBg"></div>' +
                '<div class="innerMask">' +
                  '<div class="text">Loading...</div>' +
                '</div>' +
              '</div>';

   var el = $(dom);
   var innerMask = el.children('.innerMask');

    $(document.body).append(el);
    $timeout(function() {
      el.addClass('fade');
      innerMask.spin(spinnerConfig);
    }, 1);
    return el;
  }

  this.show = function(opt) {
    maskEl = this.createMaskEl();
    if (opt) {
      if (opt.text) {
        maskEl.find('.text').html(opt.text);
      }
    }
  }

  this.hide = function() {
    maskEl.removeClass('fade');
    // Wait for CSS3 transition to finish (not too long so older brwoser user
    // will not be affected much).
    $timeout(function() {
      maskEl.remove();
      maskEl = undefined;
    }, 200);
  }
}


/**
 * Facebook SDK service (the Angular way!)
 */
function FBSdk($q, $timeout) {
  if (!FB) {
    throw new Error('FB is not available!');
  }

  this.getLoginStatus = function(scope) {
    var deferred = $q.defer();
    // Force everythig to be async. Because FB calls callback syncrhonously
    // sometimes and this may break scope.$apply(or really does it?)
    $timeout(function() {
      FB.getLoginStatus(function(response) {
        scope.$apply(function() {
          deferred.resolve(response);
        });
      });
    }, 1);
    return deferred.promise;
  }


  this.login = function(scope, perms) {
    var permissions = perms || {};
    var deferred = $q.defer();

    $timeout(function() {
      FB.login(function(response) {
        scope.$apply(function() {
          deferred.resolve(response);
        });
      }, permissions);
    }, 1);
    return deferred.promise;
  }


  this.api = function(scope, a, b, c, d, e) {
    var deferred = $q.defer();
    var callback = function(response) {
      scope.$apply(function() {
        deferred.resolve(response);
      });
    }
    $timeout(function() {
      if (b == undefined) {
        FB.api(a, callback);
      } else if (c == undefined) {
        FB.api(a, b, callback);
      } else if (d == undefined) {
        FB.api(a, b, c, callback);
      } else if (e == undefined){
        FB.api(a, b, c, d, callback);
      } else {
        throw new Error('fb proxy cannot handle so many params!');
      }
    }, 1);
    return deferred.promise;
  }
}

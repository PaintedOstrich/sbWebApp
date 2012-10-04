'use strict';

/* Services */

angular.module('facebookService', ['ng'])
    .service('fb', FBSdk)
    .service('loadMask', LoadMask);

/**
 * A load mask singleton class that is used to show and hide a loading mask
 */
function LoadMask($timeout) {
  // The mask jquery element.
  this.maskEl;

  this.createMaskEl = function() {
    var el = $('<div class="loadMask"></div>');
    el.append('<div class="backDrop"></div>');
    el.append('<div class="spinnerBg"></div>');
    $(document.body).append(el);
    $timeout(function() {
      el.addClass('fade');
    }, 1);
    return el;
  }

  this.show = function() {
    this.maskEl = this.createMaskEl();
  }

  this.hide = function() {
    var tmp = this.maskEl;
    tmp.removeClass('fade');
    // Wait for CSS3 transition to finish (not too long so older brwoser user
    // will not be affected much).
    $timeout(function() {
      tmp.remove();
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

  /*--------- NOTE: following are custom apis  ---------- */

  // Return the current user.
  this.getMe = function(scope) {
    var deferred = $q.defer();
    var self = this;

    if (self.me) {
      $timeout(function() {
        scope.$apply(function() {
          deferred.resolve(self.me);
        });
      }, 1);
    } else {
      this.api(scope, '/me').then(function(response) {
        if (response.username) {
          self.me = response;
          deferred.resolve(response);
        } else {
         console.error('Failed to load the current user!');
        }
      });
    }
    return deferred.promise;
  }
}

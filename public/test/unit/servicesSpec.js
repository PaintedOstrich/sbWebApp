'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('services', function($provide) {
    // $provide.value('fb', {
    //   api: jasmine.createSpy()
    // })
  }));

  describe('User singleton', function() {
    var user
    beforeEach(inject(function(User) {
      user = User;
    }));

    it('should exist', function() {
      expect(user).toBeDefined();
    });

    it('should not be loaded at first', function() {
      expect(user.isLoaded()).toBe(false);
    });
  });
});

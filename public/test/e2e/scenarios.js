'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('PhoneCat App', function() {

  it('should redirect to index.html#/home', function() {
    browser().navigateTo('../../');
    expect(browser().location().url()).toBe('/home');
  });
});

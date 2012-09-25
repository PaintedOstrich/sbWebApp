'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Sports Bet App', function() {
  it('should render call for action button', function() {
    browser().navigateTo('../../#/login');
    expect(browser().location().url()).toBe('/login');
    expect(element('.callForActionPanel').count()).toEqual(1);
  });
});

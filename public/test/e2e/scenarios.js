'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('Sports Bet App', function() {

  it('should redirect to index.html#/home', function() {
    browser().navigateTo('../../');
    expect(browser().location().url()).toBe('/home');
  });
  
  it('should highlight appropriate nav bar tab', function() {
    browser().navigateTo('../../#/bet');
    expect(browser().location().url()).toBe('/bet');
    expect(element('#mainNav li.home.active').count()).toEqual(0);
    expect(element('#mainNav li.bet.active').count()).toEqual(1);
    
    expect(element('#mainNav li.profile.active').count()).toEqual(0);
    element('#mainNav li.profile a').click();
    expect(element('#mainNav li.profile.active').count()).toEqual(1);
  });
});

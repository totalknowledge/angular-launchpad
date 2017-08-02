import { Angular2LaunchpadCliPage } from './app.po';

describe('angular2-launchpad-cli App', () => {
  let page: Angular2LaunchpadCliPage;

  beforeEach(() => {
    page = new Angular2LaunchpadCliPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});

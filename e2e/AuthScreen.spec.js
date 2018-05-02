describe('Example', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });
  
  it('Should show a title for password to continue', async () => {
    await expect(element(by.id('passwordTitle'))).toBeVisible();
  });
})
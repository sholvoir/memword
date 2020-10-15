import * as mapi from './e-api';

const appId = '769214023446570';

export const opLoad = (login) => {
    window.fbAsyncInit = () => {
        FB.init({ appId, autoLogAppEvents: true, xfbml: true, version: 'v3.2' });
        FB.getLoginStatus(this.dealFacebookResponse);
    };
    mapi.loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-jssdk');
}

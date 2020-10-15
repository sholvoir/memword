import * as mapi from './e-api';

const client_id = '1073249298428-3mjsm512f3jcpg98fop3tobiiov2rapn.apps.googleusercontent.com';
let googleAuth;

export const opLoad = () => new Promise((resolve) => {
    window.googleAsyncInit = () => gapi.load('auth2', () => {
        googleAuth = gapi.auth2.init({ client_id, cookiepolicy: 'single_host_origin' });
        googleAuth.then(opAfterLogin).then(resolve);
    });
    mapi.loadScript('https://apis.google.com/js/platform.js?onload=googleAsyncInit', 'google-platform');
});

export const opLogin = () => googleAuth.signIn().then(opAfterLogin);

export const opAfterLogin = () => {
    if (googleAuth.isSignedIn.get()) {
        let userx = googleAuth.currentUser.get();
        let profile = userx.getBasicProfile();
        return {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            headsrc: profile.getImageUrl() + '?sz=50',
            id_token: userx.getAuthResponse().id_token,
        };
    }
}

export const opLogout = () => {
    googleAuth.signOut().then(() => {
        user = null;
        if (loginStateChanged) loginStateChanged(false);
    })
}
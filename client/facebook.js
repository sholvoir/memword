window.fbAsyncInit = function () {
    FB.init({
        appId: 'your-app-id',
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v3.2'
    });
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

(function (document, tag) {
    var scriptTag = document.createElement(tag), // create a script tag
        firstScriptTag = document.getElementsByTagName(tag)[0]; // find the first script tag in the document
    scriptTag.src = 'your-script.js'; // set the source of the script to your script
    firstScriptTag.parentNode.insertBefore(scriptTag, firstScriptTag); // append the script to the DOM
}(document, 'script'));

function getScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = function (_, isAbort) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if (!isAbort) { if (callback) callback(); }
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
}

function affixScriptToHead(url, onloadFunction) {
    var newScript = document.createElement("script");
    newScript.onerror = loadError;
    if (onloadFunction) { newScript.onload = onloadFunction; }
    document.head.appendChild(newScript);
    newScript.src = url;
}

var loadScriptAsync = function (uri) {
    return new Promise((resolve, reject) => {
        var tag = document.createElement('script');
        tag.src = uri;
        tag.async = true;
        tag.onload = () => {
            resolve();
        };
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
}
var scriptLoaded = loadScriptAsync('external-script.js');
scriptLoaded.then(function () {
    window.extvar.execute('test');
});

const loadScript = (source, beforeEl, async = true, defer = true) => {
    return new Promise((resolve, reject) => {
        let script = document.createElement('script');
        const prior = beforeEl || document.getElementsByTagName('script')[0];

        script.async = async;
        script.defer = defer;

        function onloadHander(_, isAbort) {
            if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
                script.onload = null;
                script.onreadystatechange = null;
                script = undefined;

                if (isAbort) { reject(); } else { resolve(); }
            }
        }

        script.onload = onloadHander;
        script.onreadystatechange = onloadHander;

        script.src = source;
        prior.parentNode.insertBefore(script, prior);
    });
}


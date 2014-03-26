/* global config */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-42631098-3']);
_gaq.push(['_trackPageview']);

(function () {
    function _kms(u){
        setTimeout(function(){
            var d = document, f = d.getElementsByTagName('script')[0],
            s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = u;
            f.parentNode.insertBefore(s, f);
        }, 1);
    }

    if (typeof _kmq === 'undefined') {
        window._kmq = [];
    }

    window._kmk = window._kmk || '31f2ad1b77e7396bdf1acde496925d611c0063c2';
    window.KM = window.KM || undefined;

    if (!config.hostname.match(/localhost/)) {
        _kms('https://i.kissmetrics.com/i.js');
        _kms('https://doug1izaerwt3.cloudfront.net/' + window._kmk + '.1.js');
    }
})();

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

window.GoogleAnalytics = {
    sendEvent: function (category, action, label, value) {
        window._gaq.push(['_trackEvent', category, action, label, value]);
    },
};

window.Kissmetrics = {
    identify: function (uniqueId) {
        if (uniqueId !== this.getId()) {
            window._kmq.push(['identify', uniqueId]);
        }
    },

    getId: function () {
        return window.KM && window.KM.i();
    },

    sendEvent: function (eventName, properties) {
        window.console.log("Sending %s: %o", eventName, properties);
        window._kmq.push(['record', eventName, properties]);
    }
};

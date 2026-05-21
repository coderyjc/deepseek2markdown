// GA4 Measurement Protocol — fire-and-forget event tracking
(function (global) {
    'use strict';

    var MEASUREMENT_ID = 'G-G9WCHLZWTZ';
    var API_SECRET = '1_sniSWyTT2g-Ed1CQTZEA';
    var ENDPOINT = 'https://www.google-analytics.com/mp/collect';
    var CLIENT_ID_KEY = 'ga4_client_id';

    var clientIdPromise = null;

    function getClientId() {
        if (clientIdPromise) return clientIdPromise;
        clientIdPromise = new Promise(function (resolve) {
            chrome.storage.local.get(CLIENT_ID_KEY, function (result) {
                if (result && result[CLIENT_ID_KEY]) {
                    resolve(result[CLIENT_ID_KEY]);
                } else {
                    var id = crypto.randomUUID();
                    var obj = {};
                    obj[CLIENT_ID_KEY] = id;
                    chrome.storage.local.set(obj);
                    resolve(id);
                }
            });
        });
        return clientIdPromise;
    }

    function track(eventName, params) {
        getClientId().then(function (clientId) {
            var payload = {
                client_id: clientId,
                events: [{
                    name: eventName,
                    params: Object.assign({ engagement_time_msec: '1' }, params || {})
                }]
            };
            fetch(ENDPOINT + '?measurement_id=' + MEASUREMENT_ID + '&api_secret=' + API_SECRET, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
        });
    }

    global.GA4 = { track: track };
})(typeof self !== 'undefined' ? self : this);

// ==UserScript==
// @name            Better Default
// @author          yufu
// @include         main
// @onlyonce
// ==/UserScript==

(function() {
    // disable auto update
    let startup = {
        "browser.shell.checkDefaultBrowser": false
    };

    let update = {
        "app.update.auto": false,
        "app.update.silent": true,
        "app.update.background.enabled": false,
        "app.update.service.enabled": false
    };

    let quiter = {
        "extensions.getAddons.showPane": false,
        "extensions.htmlaboutaddons.recommendations.enabled": false,
        "browser.discovery.enabled": false

    };

    let telemetry = {
        "datareporting.policy.dataSubmissionEnabled": false,
        "datareporting.healthreport.uploadEnabled": false
    };

    let passwords = {
        "signon.autofillForms": false,
        "signon.formlessCapture.enabled": false,
        "signon.rememberSignons": false, // use my own password manager


    };

    let downloads = {
        "browser.download.useDownloadDir": false,
        "browser.download.always_ask_before_handling_new_types": true,
    };

    let etp = {
        "browser.contentblocking.category": "strict",
        "privacy.partition.serviceWorkers": true,
        "privacy.partition.always_partition_third_party_non_cookie_storage": true,
        "privacy.partition.always_partition_third_party_non_cookie_storage.exempt_sessionstorage": false
    };

    let other = {
        "media.autoplay.default": 5,
        "media.autoplay.blocking_policy": 2,
    };
    // enabled pref
    let prefs = {
        ...startup,
        ...update,
        ...quiter,
        ...telemetry,
        ...passwords,
        ...downloads,
        ...etp,
        ...other
    };

    for (const k in prefs) {
        xPref.set(k, prefs[k]);
    }
})();

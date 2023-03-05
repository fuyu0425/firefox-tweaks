// ==UserScript==
// @name            URL Attribute
// @author          yufu
// @include         main
// @startup         UC.UrlAttribute.exec(win);
// @shutdown        UC.UrlAttribute.destroy();
// @onlyonce
// ==/UserScript==

// add current domain and url to browser attribute to help writing CSS based on domain name

const { XPCOMUtils } = ChromeUtils.import('resource://gre/modules/XPCOMUtils.jsm');

UC.UrlAttribute = {
    exec: function(win) {

        const { document, gBrowser } = win;
        gBrowser.addTabsProgressListener(this.progressListener);
        gBrowser.tabContainer.addEventListener("TabSelect", this.onTabSelect);

    },
    progressListener: {
        onLocationChange: function(aBrowser, aWebProgress, aRequest, aLocation, aFlags) {
            if (!aWebProgress.isTopLevel ||
                aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_RELOAD ||
                aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE)
                return;
            if (aBrowser.currentURI) {
                let url = aBrowser.currentURI.displaySpec;
                let domain = aBrowser.currentURI.asciiHost;
                let document = aBrowser.ownerDocument;
                let window = aBrowser.ownerGlobal;
                let {gBrowser} = window;
                aBrowser.setAttribute('domain', domain);
                aBrowser.setAttribute('url', url);
                if (gBrowser.selectedBrowser == aBrowser) {
                    document.documentElement.setAttribute('domain', domain);
                    document.documentElement.setAttribute('url', url);
                }
            }
        }
    },
    onTabSelect(ev) {
        let browser = ev.target.linkedBrowser;
        if (browser.currentURI) {
            let url = browser.currentURI.displaySpec;
            let domain = browser.currentURI.asciiHost;
            let document = browser.ownerDocument;
            let window = browser.ownerGlobal;
            browser.setAttribute('domain', domain);
            browser.setAttribute('url', url);
            document.documentElement.setAttribute('domain', domain);
            document.documentElement.setAttribute('url', url);
        }
    },
    init: function() {
    },
    destroy: function() {
        _uc.windows((doc, win) => {
            let gBrowser = win.gBrowser;
            gBrowser.removeTabsProgressListener(this.progressListener);
            gBrowser.tabContainer.removeEventListener('TabSelect', this.onTabSelect);
        });
        delete UC.UrlAttribute;
    },
    observers: []
};

UC.UrlAttribute.init();

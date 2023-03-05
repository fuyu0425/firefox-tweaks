// ==UserScript==
// @name            URL Download Dir
// @author          yufu
// @include         main
// @startup         UC.UrlDownloadDir.exec(win);
// @shutdown        UC.UrlDownloadDir.destroy();
// @onlyonce
// ==/UserScript==

// change download dir based on the current url
// idea from: https://www.reddit.com/r/FirefoxCSS/comments/11hwmc9/probably_not_the_place_to_ask_but_lets_try_is/

const { XPCOMUtils } = ChromeUtils.import('resource://gre/modules/XPCOMUtils.jsm');

UC.UrlDownloadDir = {
    sites: [
        {
            // you need to write regex
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            // /^https:\/\/arxiv\.org\//.test(document.URL) should return true in your console under arxiv
            rx: /^https:\/\/arxiv\.org\//,
            // download dir; syntax will be different based on OS.
            download_dir: '/Users/fuyu0425/Downloads/arxiv',
            // windows example; you need to escape backslash
            // download_dir: 'C:\\Users\\fuyu0425\\Downloads\\arxix',

        },
        // add next if needed
    ],
    // default download dir
    default_download_dir: '/Users/fuyu0425/Downloads',
    change_download_dir(url) {
        // default if not in rules
        let download_dir = this.default_download_dir;
        for (let site of this.sites){
            // Match the first
            if (site.rx.test(url)) {
                download_dir = site.download_dir;
                break;
            }
        }
        xPref.set("browser.download.lastDir", download_dir);
    },
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
                UC.UrlDownloadDir.change_download_dir(url);
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
            UC.UrlDownloadDir.change_download_dir(url);
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
        delete UC.UrlDownloadDir;
    },
    observers: []
};

UC.UrlDownloadDir.init();

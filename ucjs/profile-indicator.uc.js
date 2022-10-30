// ==UserScript==
// @name            Profile Indicator
// @author          yufu
// @include         main
// @startup         UC.ProfileIndicator.exec(win);
// @shutdown        UC.ProfileIndicator.destroy();
// @onlyonce
// ==/UserScript==

const { XPCOMUtils } = ChromeUtils.import('resource://gre/modules/XPCOMUtils.jsm');

XPCOMUtils.defineLazyServiceGetter(
    this,
    "ProfileService",
    "@mozilla.org/toolkit/profile-service;1",
    "nsIToolkitProfileService"
);

UC.ProfileIndicator = {
    exec: function(win) {
        let name = "default";
        let currentProfile = ProfileService.currentProfile;

        if (currentProfile) {
            name = currentProfile.name;
        }

        if (name === "default") {
            // Don't show indicator if we use default profile for daily use.
            return;
        }

        const dockSupport = Cc["@mozilla.org/widget/macdocksupport;1"].getService(
            Ci.nsIMacDockSupport
        );
        dockSupport.badgeText = name;

        const { customElements, document, gBrowser } = win;
        let userProfileIcon = _uc.createElement(document, 'hbox', {
            id: 'userProfile-icons',
            hidden: 'false'
        });
        let userProfileLabel = _uc.createElement(document, 'label', {
            id: 'userProfile-label',
            hidden: 'false',
            value: name
        });
        userProfileIcon.appendChild(userProfileLabel);
        let pageActionButton = document.getElementById('page-action-buttons');
        let toolbarstop = pageActionButton.getElementsByTagName("toolbartabstop")[0];
        toolbarstop.insertAdjacentElement('afterend', userProfileIcon);

        var sspi = document.createProcessingInstruction(
            'xml-stylesheet',
            'type="text/css" href="data:text/css,' + encodeURIComponent(UC.ProfileIndicator.style) + '"'
        );
        document.insertBefore(sspi, document.documentElement);
        UC.ProfileIndicator.styles.push(sspi);
    },
    init: function() {
    },
    destroy: function() {
        _uc.windows((doc, win) => {
            let icons = doc.getElementById('userProfile-icons');
            if (icons) { icons.remove(); }
        });
        UC.ProfileIndicator.styles.forEach(s => s.parentNode.removeChild(s));
        delete UC.ProfleIndicator;
    },
    style: `
    #userProfile-icons {
      -moz-box-align: center;
    }`,
    styles: []
};

UC.ProfileIndicator.init();

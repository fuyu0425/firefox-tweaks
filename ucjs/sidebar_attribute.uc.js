// ==UserScript==
// @name            Sidebar Attribute
// @author          yufu
// @include         main
// @startup         UC.SidebarAttribute.exec(win);
// @shutdown        UC.SidebarAttribute.destroy();
// @onlyonce
// ==/UserScript==

const { XPCOMUtils } = ChromeUtils.import('resource://gre/modules/XPCOMUtils.jsm');

UC.SidebarAttribute = {
    exec: function(win) {

        const { customElements, document, gBrowser, MutationObserver } = win;

        let sidebarBox = document.getElementById("sidebar-box");

        let config = {
            attributes: true,
            attributeFilter: [
                "hidden",
                "sidebarcommand",
            ]
        };

        // Callback function to execute when mutations are observed
        let callback = (mutationList) => {
            document.documentElement.setAttribute('sidebarCommand', document.getElementById("sidebar-box").getAttribute("sidebarcommand") || "");
            document.documentElement.setAttribute('sidebarHidden', document.getElementById("sidebar-box").getAttribute("hidden") || "");
        };

        // // Create an observer instance linked to the callback function
        let observer = new MutationObserver(callback);

        // // Start observing the target node for configured mutations
        observer.observe(sidebarBox, config);
        UC.SidebarAttribute.observers.push(observer);

    },
    init: function() {
    },
    destroy: function() {
        UC.SidebarAttribute.observers.forEach(o => o.disconnect());
        delete UC.SidebarAttribute;
    },
    observers: []
};

UC.SidebarAttribute.init();

// ==UserScript==
// @name            Window Indicator
// @author          yufu
// @include         main
// @startup         UC.WindowIndicator.exec(win);
// @shutdown        UC.WindowIndicator.destroy();
// @onlyonce
// ==/UserScript==

const { XPCOMUtils } = ChromeUtils.import('resource://gre/modules/XPCOMUtils.jsm');

UC.WindowIndicator = {
    exec: function(win) {

        const { customElements, document, gBrowser, MutationObserver } = win;

        let titlePref = document.documentElement.getAttribute('titlepreface') || "";

        let windowName = titlePref.slice(0,-2);

        let userWindowIcon = _uc.createElement(document, 'hbox', {
            id: 'userWindow-icons',
            hidden: 'false'
        });
        let userWindowLabel = _uc.createElement(document, 'label', {
            id: 'userWindow-label',
            hidden: 'false',
            value: windowName
        });


        userWindowIcon.appendChild(userWindowLabel);

        // undocumented method!
        // let preTabSpacer = document.getElementsByAttribute('type','pre-tabs')[0];
        // preTabSpacer.insertAdjacentElement('afterend', userWindowIcon);
        let preTabSpacer = document.getElementsByAttribute('type','post-tabs')[0];
        // preTabSpacer.insertAdjacentElement('beforebegin', userWindowIcon);
        preTabSpacer.insertAdjacentElement('afterend', userWindowIcon);

        var sspi = document.createProcessingInstruction(
            'xml-stylesheet',
            'type="text/css" href="data:text/css,' + encodeURIComponent(UC.WindowIndicator.style) + '"'
        );
        document.insertBefore(sspi, document.documentElement);
        UC.WindowIndicator.styles.push(sspi);


        let config = {
            attributes: true,
            attributeFilter: [
                'titlepreface'
            ]
        };

        // Callback function to execute when mutations are observed
        let callback = (mutationList) => {
            let _ = document.getElementById('userWindow-label');
            let _titlePref = document.documentElement.getAttribute('titlepreface');
            if (!_titlePref) return;
            let _windowName = _titlePref.slice(0,-2);
            _.value = _windowName;
        };

        // // Create an observer instance linked to the callback function
        let observer = new MutationObserver(callback);

        // // Start observing the target node for configured mutations
        observer.observe(document.documentElement, config);
        UC.WindowIndicator.observers.push(observer);

    },
    init: function() {
    },
    destroy: function() {
        _uc.windows((doc, win) => {
            let icons = doc.getElementById('userWindow-icons');
            if (icons) { icons.remove(); }
        });
        UC.WindowIndicator.styles.forEach(s => s.parentNode.removeChild(s));
        UC.WindowIndicator.observers.forEach(o => o.disconnect());
        delete UC.WindowIndicator;
    },
    style: `
    #userWindow-icons {
      -moz-box-align: center;
      font-size: 16px;
    }`,
    styles: [],
    observers: []
};

UC.WindowIndicator.init();

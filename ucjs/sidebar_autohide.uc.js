// ==UserScript==
// @name            Sidebar Autohide
// @author          yufu
// @include         main
// @startup         UC.SidebarAutohide.exec(win);
// @shutdown        UC.SidebarAutohide.destroy();
// @onlyonce
// ==/UserScript==

const { XPCOMUtils } = ChromeUtils.import('resource://gre/modules/XPCOMUtils.jsm');

UC.SidebarAutohide = {
    exec: function(win) {
      if (win.location.href !== _uc.BROWSERCHROME)
        return;

      const { AppConstants, CustomizableUI, document, Services } = win;
      document.documentElement.setAttribute('sidebarAutohide', 'false');
      if (AppConstants.MOZ_APP_NAME !== 'thunderbird') {
        if (!CustomizableUI.getPlacementOfWidget('sidebar-autohide-button')) {
          CustomizableUI.createWidget({
            id: 'sidebar-autohide-button',
            type: 'custom',
            defaultArea: CustomizableUI.AREA_NAVBAR,
            onBuild: (doc) => {
                return this.createButton(win, doc);
            }
          });
        }
      }
      this.handle(this.status);
    },
    createButton (win, doc) {
      let btn = _uc.createElement(doc, 'toolbarbutton', {
        id: 'sidebar-autohide-button',
        label: 'Sidebar Autohide',
        tooltiptext: 'Sidebar Autohide',
        type: 'menu',
        class: 'toolbarbutton-1 chromeclass-toolbar-additional',
        oncontextmenu: 'event.preventDefault(); return false;',
        onclick: 'event.preventDefault(); UC.SidebarAutohide.onClick(event); return false;',
      });
      return btn;

    },
    onClick: function(e) {
        if(e.which ==1 ) { // left click: normal
            if (this.status == 'close'){
                this.status = 'open';
            }else if (this.status == 'open'){
                this.status = 'hide';
            }else if (this.status == 'hide') {
                this.status = 'close';
            }
        } else if (e.which == 2 || e.which == 3){ // middile click
            if (this.status == 'close'){
                ; // ignore
            }else if (this.status == 'open'){
                this.status = 'hide';
            }else if (this.status == 'hide') {
                this.status = 'open';
            }
        }
        this.handle(this.status);
        xPref.set(this.PREF_LAST_STATUS, this.status);
    },
    handle: function(status) {
        _uc.windows((doc, win) => {
            if (this.status == 'close'){
                if (win.SidebarUI.isOpen){
                    win.SidebarUI.hide();
                }

                doc.documentElement.setAttribute('sidebarAutohide', 'false');

                doc.getElementById(this.BUTTON_ID).removeAttribute('checked');
            }else if (this.status == 'open'){
                if (!win.SidebarUI.isOpen){
                    if (win.SidebarUI.lastOpenedId) {
                        win.SidebarUI.show(win.SidebarUI.lastOpenedId);
                    } else {
                        win.SidebarUI.toggle();
                    }
                }
                doc.documentElement.setAttribute('sidebarAutohide', 'false');

                doc.getElementById(this.BUTTON_ID).setAttribute('checked', true);
            }else if (this.status == 'hide') {
                doc.documentElement.setAttribute('sidebarAutohide', 'true');

                doc.getElementById(this.BUTTON_ID).setAttribute('checked', true);
            }
        });
    },
    init: function() {
        _uc.sss.loadAndRegisterSheet(this.STYLE.url, this.STYLE.type);
        let last_status= xPref.get(this.PREF_LAST_STATUS);
        if (last_status){
            this.status = last_status;
        }
    },
    destroy: function() {
        if (Services.wm.getMostRecentWindow(null).AppConstants.MOZ_APP_NAME !== 'thunderbird')
            Services.wm.getMostRecentBrowserWindow().CustomizableUI.destroyWidget('sidebar-autohide-button');
        else
            this.tbButtons.forEach(b => b.remove());
        _uc.sss.unregisterSheet(this.STYLE.url, this.STYLE.type);
        UC.SidebarAutohide.styles.forEach(s => s.parentNode.removeChild(s));
        delete UC.SidebarAutohide;
    },
    PREF_LAST_STATUS: 'userChromeJS.sidebarAutohide.lastStatus',
    BUTTON_ID: 'sidebar-autohide-button',
    STYLE: {
        url: Services.io.newURI('data:text/css;charset=UTF-8,' + encodeURIComponent(`
        @-moz-document url('${_uc.BROWSERCHROME}'), url('chrome://messenger/content/customizeToolbar.xhtml') {
          #sidebar-autohide-button {
            list-style-image: url('chrome://browser/skin/sidebars.svg');
          }
        }
      `)),
        type: _uc.sss.AUTHOR_SHEET
    },
    status: 'close',
    style: `
    #userWindow-icons {
      -moz-box-align: center;
      font-size: 16px;
    }`,
    styles: [],
    tbButtons: [],
    observers: []
};

UC.SidebarAutohide.init();

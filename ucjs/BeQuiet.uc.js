// ==UserScript==
// @name            BeQuiet
// @author          xiaoxiaoflood, yufu
// @include         main
// @startup         UC.beQuiet.exec(win);
// @shutdown        UC.beQuiet.destroy();
// @onlyonce
// ==/UserScript==

// inspired by https://addons.mozilla.org/en-US/firefox/addon/be-quiet/
// modified from https://github.com/xiaoxiaoflood/firefox-scripts/blob/master/chrome/BeQuiet.uc.js

UC.beQuiet = {
    sites: [
        {
            rx: /^https:\/\/www\.deezer\.com\//,
            play: 'li > button.svg-icon-group-btn',
            previous: '.player-controls li button',
            next: '.player-controls li:nth-of-type(5) button'
        },
        {
            rx: /^https:\/\/songa\.nl\//,
            play: '#play_button',
            previous: '#previous_button',
            next: '#next_button'
        },
        {
            rx: /^https:\/\/open\.spotify\.com\//,
            play: '.Root__now-playing-bar .player-controls__buttons > button',
            previous: '.Root__now-playing-bar .player-controls__left button:nth-of-type(2)',
            next: '.Root__now-playing-bar .player-controls__right button'
        },
        {
            rx: /^https:\/\/www\.twitch\.tv\//,
            play: 'button[data-a-target="player-play-pause-button"]'
        },
        {
            rx: /^https:\/\/vk\.com\//,
            play: '.top_audio_player_play',
            previous: '.top_audio_player_prev',
            next: '.top_audio_player_next'
        },
        {
            rx: /^https:\/\/www\.youtube\.com\//,
            play: '.ytp-play-button'
        },
        {
            rx: /^https:\/\/music\.amazon\.co\.jp\//,
            // play: 'music-button[aria-label="Play"]',
            // pause: 'music-button[aria-label="Pause"]',
            // NOTE: this is more stable!! becaue above one need some js change in the site
            play: '#transport music-button:nth-child(3)',
            previous: '#transport music-button:nth-child(2)',
            next: '#transport music-button:nth-child(4)'
        },
        {
            rx: /^https:\/\/www\.nicovideo\.jp\//,
            play: 'button.PlayerPlayButton',
            pause: 'button.PlayerPauseButton',
        },
        {
            rx: /^https:\/\/www\.bilibili\.com\//,
            play: 'div.bpx-player-ctrl-play '
        }

    ],

    exec: function(win) {
        const { document, gBrowser } = win;
        gBrowser.addTabsProgressListener(this.progressListener);
        gBrowser.addEventListener('DOMAudioPlaybackStarted', this.audioStarted);
        gBrowser.addEventListener('DOMAudioPlaybackStopped', this.audioStopped);
        win.addEventListener('TabBrowserDiscarded', this.onTabClose);

        // NOTE: disable hotkey

        let keyset =  _uc.createElement(document, 'keyset', { id: 'beQuiet-keyset' });
        document.getElementById('mainKeyset').insertAdjacentElement('afterend', keyset);


        let modifiers = 'shift control';

        let playKey = _uc.createElement(document, 'key', {
          id: 'beQuiet-play-key',
          modifiers: modifiers,
          key: 'p',
          oncommand: 'UC.beQuiet.doAction("play")',
        });
        keyset.appendChild(playKey);

        let previousKey = _uc.createElement(document, 'key', {
          id: 'beQuiet-previous-key',
          modifiers: modifiers,
          key: 'b',
          oncommand: 'UC.beQuiet.doAction("previous")',
        });
        keyset.appendChild(previousKey);

        let nextKey = _uc.createElement(document, 'key', {
          id: 'beQuiet-next-key',
          modifiers: modifiers,
          key: 'n',
          oncommand: 'UC.beQuiet.doAction("next")',
        });
        keyset.appendChild(nextKey);

        gBrowser.tabContainer.addEventListener('TabClose', this.onTabClose);
    },

    onTabClose(ev) {
        let closedBrowser = ev.target.linkedBrowser;
        if (UC.beQuiet.playingStack.includes(closedBrowser)) {
            if (closedBrowser == UC.beQuiet.playingBrowser) {
                UC.beQuiet.doAction('play', UC.beQuiet.prevPlayingBrowser);
            }
            UC.beQuiet.remove(UC.beQuiet.playingStack, closedBrowser);
        }
        UC.beQuiet.remove(UC.beQuiet.stack, closedBrowser);
    },

    progressListener: {
        onLocationChange: function(aBrowser, aWebProgress, aRequest, aLocation, aFlags) {
            if (!aWebProgress.isTopLevel ||
                aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_RELOAD ||
                aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_ERROR_PAGE)
                return;

            if (UC.beQuiet.stack.includes(aBrowser)
                // && !UC.beQuiet.isURLCompatible(aLocation.spec)
               ) {
                UC.beQuiet.remove(UC.beQuiet.stack, aBrowser);
                if (UC.beQuiet.playingStack.includes(aBrowser)) {
                    UC.beQuiet.remove(UC.beQuiet.playingStack, aBrowser);
                    if (UC.beQuiet.playingBrowser)
                        UC.beQuiet.doAction('play', UC.beQuiet.playingBrowser);
                }
            }
        }
    },
    findSelector(site, action) {
        if (action == 'play' || action == 'pause') {
            if ('play' in site && 'pause' in site) {
                return site[action];
            } else if ('play' in site) {
                return site['play'];
            } else if ('pause' in site) {
                return site['pause'];
            } else {
                console.error('no play/pause in site config');
            }
        }
        return site[action];
    },
    doAction(action, browser) {
        if (!browser) {
            if (this.playingBrowser)
                browser = this.playingBrowser;
            else
                browser = this.topStack;
        }

        if (!browser)
            return;

        // console.log('do action', action, browser.currentURI.spec);
        this.sites.find(site => {
            if (site.rx.test(browser.currentURI.spec)) {
                let selector = this.findSelector(site, action);
                if (selector)
                    browser.messageManager.sendAsyncMessage('bequiet', selector);
                return true;
            }
            return false;
        });
    },

    audioStarted(ev) {
        let browser = ev.target;
        if (UC.beQuiet.isURLCompatible(browser.currentURI.spec)) {
            UC.beQuiet.addUnique(UC.beQuiet.stack, browser);
            UC.beQuiet.addUnique(UC.beQuiet.playingStack, browser);

            if (UC.beQuiet.prevPlayingBrowser) {
                UC.beQuiet.doAction('pause', UC.beQuiet.prevPlayingBrowser);
            }
        }
        // UC.beQuiet.debug('started', UC.beQuiet.stack);
        // UC.beQuiet.debug('started playing', UC.beQuiet.playingStack);
    },

    isURLCompatible(url) {
        return UC.beQuiet.sites.find(site => site.rx.test(url))
    },

    get playingBrowser() {
        return this.playingStack[this.playingStack.length - 1];
    },

    get prevPlayingBrowser() {
        return this.playingStack[this.playingStack.length - 2];
    },

    get topStack() {
        return this.stack[this.stack.length - 1];
    },

    audioStopped(ev) {
        let browser = ev.target;
        if (browser == UC.beQuiet.playingBrowser) {
            UC.beQuiet.remove(UC.beQuiet.playingStack, UC.beQuiet.playingBrowser);
            if (UC.beQuiet.playingBrowser)
                UC.beQuiet.doAction('play', UC.beQuiet.playingBrowser);
        }
        // UC.beQuiet.debug('stopped', UC.beQuiet.stack);
        // UC.beQuiet.debug('stopped playing', UC.beQuiet.playingStack);
    },

    frameScript: 'data:application/javascript;charset=UTF-8,' + encodeURIComponent('(' + (function() {
        let contentListener = (msg) => {
            if (msg.data == 'destroy') {
                removeMessageListener('bequiet', contentListener);
                delete this.contentListener;
            } else {
                content.document.querySelector(msg.data)?.click();
            }
        }
        addMessageListener('bequiet', contentListener);
    }).toString() + ')();'),

    stack: [],

    playingStack: [],

    addUnique(stack, item) {
        this.remove(stack, item);
        stack.push(item);
    },

    remove(stack, item) {
        let index = stack.indexOf(item);
        if (index != -1) {
            stack.splice(index, 1);
        }
    },

    init: function() {
        Services.mm.loadFrameScript(this.frameScript, true);
    },
    debug: function(msg,stack){
        console.log('==============');
        console.log(msg);
        console.log(stack);
        for (let i =0; i < stack.length; i++) {
            let browser = stack[i];
            console.log(browser.currentURI.spec);
        }
        console.log('==============');
    },
    destroy: function() {
        Services.mm.removeDelayedFrameScript(this.frameScript);
        Services.mm.broadcastAsyncMessage('bequiet', 'destroy');
        _uc.windows((doc, win) => {
            let gBrowser = win.gBrowser;
            gBrowser.removeTabsProgressListener(this.progressListener);
            gBrowser.removeEventListener('DOMAudioPlaybackStarted', this.audioStarted);
            gBrowser.removeEventListener('DOMAudioPlaybackStopped', this.audioStopped);
            doc.getElementById('beQuiet-keyset').remove();
            gBrowser.tabContainer.removeEventListener('TabClose', this.onTabClose);
            win.removeEventListener('TabBrowserDiscarded', this.onTabClose);
        });
        delete UC.beQuiet;
    }
}

UC.beQuiet.init();

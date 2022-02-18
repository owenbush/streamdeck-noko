/* global $CC, Utils, $SD */

/**
 * Here are a couple of wrappers we created to help you quickly setup
 * your plugin and subscribe to events sent by Stream Deck to your plugin.
 */

/**
 * The 'connected' event is sent to your plugin, after the plugin's instance
 * is registered with Stream Deck software. It carries the current websocket
 * and other information about the current environmet in a JSON object
 * You can use it to subscribe to events you want to use in your plugin.
 */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
  // Subscribe to the willAppear and other events
  $SD.on('com.owenbush.streamdeck.noko.start.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
  $SD.on('com.owenbush.streamdeck.noko.start.willDisappear', (jsonObj) => action.onWillDisappear(jsonObj));
  $SD.on('com.owenbush.streamdeck.noko.start.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
  $SD.on('com.owenbush.streamdeck.noko.start.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
  $SD.on('com.owenbush.streamdeck.noko.start.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
  $SD.on('com.owenbush.streamdeck.noko.start.propertyInspectorDidAppear', (jsonObj) => {
    console.log('%c%s', 'color: white; background: black; font-size: 13px;', '[app.js]propertyInspectorDidAppear:');
  });
  $SD.on('com.owenbush.streamdeck.noko.start.propertyInspectorDidDisappear', (jsonObj) => {
    console.log('%c%s', 'color: white; background: red; font-size: 13px;', '[app.js]propertyInspectorDidDisappear:');
  });
};

// ACTIONS

const action = {
  polling: false,
  buttonExists: false,

  /**
   * The 'onDidReceiveSettings' event is fired when changes are made in the
   * property inspector.
   */

  onDidReceiveSettings: function (jsn) {
    console.log('onDidReceiveSettings', jsn);

    let label = Utils.getLabel(jsn);
    $SD.api.setTitle(Utils.getContext(jsn), label);
    this.buttonExists = true;
    this.pollTimers(jsn);
  },

  /**
   * The 'willAppear' event is the first event a key will receive, right before it gets
   * shown on your Stream Deck and/or in Stream Deck software.
   * This event is a good place to setup your plugin and look at current settings (if any),
   * which are embedded in the events payload.
   */

  onWillAppear: function (jsn) {
    console.log('onWillAppear', jsn);
    this.buttonExists = true;
    this.pollTimers(jsn);
  },

  /**
   * The 'willDisappear' event is the first event a key will receive,
   * right before it gets hidden on your Stream Deck and/or in Stream Deck
   * software.
   */

  onWillDisappear: function (jsn) {
    console.log('onWillDisappear', jsn);
    this.buttonExists = false;
  },

  /**
   * The 'onKeyUp' event is fired when a button has been pressed on your Stream
   * Deck and/or in Stream Deck software.
   */

  onKeyUp: function (jsn) {
    this.getProjectTimer(jsn).then(timer => {
      if (!Utils.isObjectEmpty(timer)) {
        if (timer.state == 'running') {
          this.pauseTimer(jsn).then(timer => {
            this.setButtonInactive(jsn, timer);
          });
        }
        else {
          this.startTimer(jsn).then(timer => {
            this.setButtonActive(jsn, timer);
          });
        }
      }
      else {
        this.startTimer(jsn).then(timer => {
          this.setButtonActive(jsn, timer);
        });
      }
    });
  },

  onSendToPlugin: function (jsn) {
    console.log('onSendToPlugin', jsn);
    /**
     * This is a message sent directly from the Property Inspector
     * (e.g. some value, which is not saved to settings)
     * You can send this event from Property Inspector (see there for an example)
     */
  },

  /**
   * Set the button as active and display the current time.
   */

  setButtonActive: function (jsn, timer) {
    $SD.api.setState(Utils.getContext(jsn), 1);

    let label = 'Running\n' + Utils.formatSeconds(timer.seconds) + '\n' + Utils.getLabel(jsn);
    $SD.api.setTitle(Utils.getContext(jsn), label);
  },

  /**
   * Set the button as active and display the timer's time.
   */
  setButtonInactive: function (jsn, timer) {
    $SD.api.setState(Utils.getContext(jsn), 0);

    let label = 'Paused\n' + Utils.formatSeconds(timer.seconds) + '\n' + Utils.getLabel(jsn);
    $SD.api.setTitle(Utils.getContext(jsn), label);
  },

  /**
   * Reset the button back to it's initial state.
   */
  resetButton: function (jsn) {
    $SD.api.setState(Utils.getContext(jsn), 0);

    let label = Utils.getLabel(jsn);
    $SD.api.setTitle(Utils.getContext(jsn), label);
  },

  /**
   * Get the timer for a specific project.
   */
  getProjectTimer: async function (jsn) {
    console.log('getProjectTimer', Utils.getProject(jsn));
    if (Utils.getProject(jsn)) {
      const response = await fetch(
        `${nokoBaseUrl}/projects/${Utils.getProject(jsn)}/timer`, {
        method: 'GET',
        headers: {
          'X-NokoToken': Utils.getAccessToken(jsn)
        }
      });
      if (response.status == '200') {
        const data = await response.json();
        return data;
      }
    }
    return {};
  },

  /**
   * Get all the timers from Noko.
   */
  getTimers: async function () {
    const response = await fetch(
      `${nokoBaseUrl}/timers`, {
      method: 'GET',
      headers: {
        'X-NokoToken': Utils.getAccessToken(jsn)
      }
    });
    const data = await response.json();
    return data;
  },

  /**
   * Poll the API for changes.
   */
  pollTimers: async function (jsn) {
    if (this.polling) return;

    while (this.buttonExists) {
      this.refreshButton(jsn);
      await new Promise(r => setTimeout(r, 15000));
    }
    this.polling = false;
  },

  /**
   * Start timer.
   */
  startTimer: async function (jsn) {
    if (Utils.getProject(jsn)) {
      const response = await fetch(
        `${nokoBaseUrl}/projects/${Utils.getProject(jsn)}/timer/start`, {
        method: 'PUT',
        headers: {
          'X-NokoToken': Utils.getAccessToken(jsn)
        }
      });
      if (response.status == '200') {
        const data = await response.json();
        return data;
      }
    }
    return {};
  },

  /**
   * Pause timer.
   */
  pauseTimer: async function (jsn) {
    if (Utils.getProject(jsn)) {
      const response = await fetch(
        `${nokoBaseUrl}/projects/${Utils.getProject(jsn)}/timer/pause`, {
        method: 'PUT',
        headers: {
          'X-NokoToken': Utils.getAccessToken(jsn)
        }
      });
      if (response.status == '200') {
        const data = await response.json();
        return data;
      }
    }
    return {};
  },

  /**
   * Refresh the button with fresh data from the API.
   */
  refreshButton: async function (jsn) {
    if (Utils.getProject(jsn)) {
      this.getProjectTimer(jsn).then(timer => {
        if (!Utils.isObjectEmpty(timer)) {
          if (timer.state == 'running') {
            this.setButtonActive(jsn, timer);
          }
          else {
            this.setButtonInactive(jsn, timer);
          }
        }
        else {
          this.resetButton(jsn);
        }
      });
    }
  }
};


# Track your time using [Noko](https://nokotime.com/) and [Elgato Stream Deck](https://www.elgato.com/en/gaming/stream-deck)

## Setup

Find the Noko "Star/Pause Timer" action and add it to an empty key.

You will then be presented with the property inspector which contains the
following properties.

* **Title** is a default property provided to all Stream Deck actions. Leave
this blank.

* **Label** is the label you want to provide for your button. For example, the
name of the project that this button timer applies to. Note: The label is
modified dynamically by the action to display whether the timer is running or
paused, and how much time has elapsed on the timer.

* **Access Token** is the access token provided by Noko to connect to the API.
To generate a token login to Noko, and then navigate to:
Connected Apps > Noko API > Personal Access Tokens and then generate a new one.

* **Project** is the project you wish to track time for. This will only appear
once the access token has been entered and validated against the Noko API.

Just search for the Action "Toggl" within the Stream Deck app and install it. There is a button called "Toggl" available in section "Custom".

## Button Use

The button will continuously poll the Noko API to enture that it is in sync with
timers which may have been started or paused in other Noko apps, or on the Noko
website. This polling happens every 15 seconds because there are API rate limit
restrictions in place that can cause your button to stop working if too many
requests are sent in succession.

If a project does not have a timer running, or paused, it will appear black with
just the label of the project provided visible.

If a project does have a timer, but that timer is not running, it will also
appear black, but it will say "Paused" and show the amount of time on the timer
above the label.

If a project is running, it will show in red and display "Running" followed by
the current elapsed time, and the button label.

You can toggle between running and paused by pressing the button at any time.
If you toggle a different button, then it may appear briefly that two timers are
running, but that is just due to the polling time. Eventually the previously
running timer will turn black and say "Paused", and the new timer will be read
and say "Running"

You can only run one timer at a time. Starting a timer will pause all others.

## Known Issues

* The Noko API has been somewhat unstable and pressing buttons quickly in
succession has caused rate limiting issues and buttons appearing to freeze.
Usually waiting a few minutes, or restarting the Stream Deck will address this.

* Ocassionally it has been noticed that the timers in the OSX app appear
differently to the timer on the Stream Deck. During debugging it appeared that
this was an API issue, as all the timing data on the Stream Deck relies entirely
on the Noko API.

* We have noticed at times that switching between timers can result in losing
some time on a timer, and again this appears to be API related. No fix has been
found to resolve this edge case yet.

# Getting Started with Create React App

This repo contains a simple React app without any styling or dependency on blockchain/servers for I/O.

It contains two key files:

### /contracts/cointoss.ts

This contains the 'dummy' class which in production would be replaced with a blockchain contract wrapper with similar properties and methods.

This is capable of accepting the key requests and returning the key properties required for the game to function, without making any requests to a server or blockchain.

It also has a number of (time based) async methods and retuns event/messages by callback to simulate the flow that would be experienced if relying on a blockchain or server for the result of a game's simulation and the user's bets.

### /components/cointoss.tsx

This contains the components and subcomponents which should be used as your skeleton in delivering a game animation.

This include:

- BetForm - which should accept user inputs, validate that they are acceptable/valid, provide feedback to the user in a helpful way and restrict actions where the inputs are not valid.
- GameAnimation - the key visual element, where the user should experience a dynamic animation/visualization of the game in various states (see below)
- GameHistory - a record of the result of past games played by the user.
- BetHistory - a record of past bets placed by the user (in this game Bets have a 1:1 relationship with Games, but this is not always the case for other game types)


## To run the app

In the project directory, you can run:

### `npm start`


## The ask

We are looking for a talented developer to work with us to develop a suite of React based casino games that will ultimately be powered by blockchain I/O.

Examples of the style of game we are seeking to develop over time can be seen here:
- https://stake.com/casino/group/stake-originals
- https://rollbit.com/category/rollbit
- https://play.zkasino.io
- https://0xcocobets.com/

For this particular game, the best example is probably Rollbit's X-Flip (https://rollbit.com/x-flip) - [alterntivaly see ZKasino (https://play.zkasino.io/games/coin-flip) or 0xCoco (https://0xcocobets.com/games/heads-or-tails), but these are not as good]

We are asking you to allocate a short amount of time (6-8 hours) to take this skeleton and create an interactive, animated, appealing UX on top of it.



### Animation States

The animation should feature a number of states:

- IDLE: No simulation is currently underway, we are awaiting the user to place a bet or the game/simulation to begin. Where the user's choices in the form affect the game setup, this should be reflected in the IDLE state. For example, an attractive, subtle visualization which entices the user to interact but where it is clear that no simulation is currently underway. Where the user changes the number of coins to be flipped, that number of coins might be shown in the animation pane.
- AWAITING: A bet has been placed and/or the game simulation has been triggered. The period of time until a result is received from the 'blockchain' (here proxied by an async await for a random 1-3 seconds) is unknown, so this state is sort of a 'loading' state. For example, the coin(s) start 'flipping' inefinitely while a response is awaited.
- RESULTING: A result is received from the 'blockchain' (here a callbackFunction invoked by the class), meaning we know what the RESULT state should look like. However, we can't simply jump to that state, we need to have a sequence which can transition from the AWAITING state (in whatever form it is currently taking) to the RESULT state (implied by the result received). For example, this might involve solving for the change required to components to get from their interim state to the result state smoothly; or may have an element of a 'wind down' (e.g. slowing the speed of a toss gradually over some number of flips, rahter than an abrupt stop).
- RESULT: Displays the result of the game simulation to the user for a period of time, before returning to IDLE state.
- ERROR: A dynamic error state showing that there is an error of some sort preventing the game/app from running, and suggesting a course of action if one is available.
- LOADING: A lightweight, generic animation to act as a hold/buffering screen while information/assets are loading from elsewhere.

### Evaluation

Key to success here is 

- Responsive Components - the applications should work well on screens/devices of different sizes.
- Validation and User - a user should be able to clearly understand where issues have arisen and how to correct them. They should not be able to take actions which will lead to failure.
- Error Handling - Resolving, or failing that flagging the root cause of the problem to the user.
- Code Legibility - Ability for us / a third party to understand and maintain your code.
- Speed - How long it takes you to achieve high-quality results.
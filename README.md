# Background

An adaptation of a board game originally developed for the kindergarten classroom with an aim of educating about US geography

# Implementation in Vue.js

uses Vue, VueX for state management, Vue templates

## Installation
Use npm or yarn to install Vue's dependencies, e.g. `npm install`

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Build and deploy
using GitHub Pages during development.
build to `docs/` and select Github project option to use that for content of Pages
`npm run build` compiles and minifies

## Run development
set up with Vue cli:
- CSS preprocessing
- tests with mocha + chai
- error linting

`npm serve`

```
npm run test:unit
npm run test:e2e
npm run lint
```

# Equipment:
Deck. One card for each state? Two cards for each state? Wildcards?
Gameboard. A map of the United States. How to deal with Alaska and Hawaii?
Pawns for each player

# Setup:
Each player is dealt 5 cards, given a starting point, and given a state that will be their objective.

# Rules
During their turn a player may:
- drag cards to the discard area to swap for new ones from the deck
- play a card to move to that state if adjacent
moving and drawing cards
- take a card from the discard area?

Victory conditions:
First Player whose Location matches their Objective

# Fixes

unique key for cards
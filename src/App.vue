<template>
  <div>
    <h1>State Race, a game of U.S. geography</h1>

    <button id="help" @click="showInstructions = true">
      Instructions for Gameplay!
    </button>
    <div id="instructions" v-show="showInstructions">
      <p>
      Lorem Ipsum this is how to play.
      </p>
      <button id="done" @click="showInstructions = false">OK!</button>	
    </div>
    
    <div id="status">
      <p>Turn: {{turnNumber}} Round: {{gameRound}}</p>
      <p>Ranking: <span id='ranking'>rank</span></p>
      <p>Cards left in deck: {{cardsRemaining}}</p>
      <p>Number discarded: {{cardsDiscarded}}</p>
      <p>Players {{players}}</p>
    </div>
    <div id="players">
    <Player 
      v-for="player in players"
    >player</Player>
    </div>
    <Pawn v-for="player in players"
        :key="player.id"
        :name="player.name"
        :location="player.location"
        :color="player.color"
        :class="{ active: currentPlayer == player.id }"
    ></Pawn>
  </div>
</template>

<script>
import Pawn from './components/Pawn.vue'
import Player from './components/Player.vue'

export default {
  name: 'app',
  components: {
    Pawn,
    Player,
  },
	data: function() {
    return {
      showInstructions: false,
      turnNumber: 0,
      gameRound: 0, // game hasn't begun
      currentPlayer: 2,
      cardsDiscarded: 0,
      cardsRemaining: 0,
      distance: 300, // rename this, give more meaningful value
      players: [
        { id: 0, name: "Melvin", automated: true, token: "#token1", color: '#f88', location: "OH" },
        { id: 1, name: "You", automated: false, token: "#token2", color: '#8f8', location: "OH" },
        { id: 2, name: "Priscilla", automated: true, token: "#token3", color: '#88f', location: "OH" }
      ],
    }
	},
	computed: {
		player: function() {
			return this.players[this.currentPlayer]
		}
	},
	created: function() {
		for( player of this.players ) {
			player.location = randomState();
			// player.objective = this.setMission( this.distance );
			player.objective = randomState();
			// if(!players[p].automated) {
			// 	players[p].setDroppables();
			// }
		}
	},
	mounted: function() {
		this.startTurn()
	},
	methods: {
		removeCard: function(cardName) {
			console.log('removing card',cardName)
			console.log(this.player.cards)
			cardIndex = this.player.cards.indexOf(cardName)
			if( cardIndex >= 0 ) {
				this.player.cards.splice(cardIndex,1)
				this.nextPlayer()
			} else {
				console.log('card not found in hand')
			}
		},
		startTurn: function() {
			console.log('turn for', this.currentPlayer)
		},
		setLocation: function() {
			return 'AK'
		},
		setMission: function() {
			return 'MO'
		},
		nextPlayer: function() {
			this.currentPlayer += 1;
			this.turnNumber += 1;
			if (this.currentPlayer == this.players.length) {
				this.currentPlayer = 0;
				this.gameRound += 1;
			}
			this.startTurn();
		}
	}
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

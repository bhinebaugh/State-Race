<script>
// import GameLog from './components/GameLog.vue'
import Gameboard from './components/Gameboard.vue'
import Player from './components/Player.vue'

import { randomState } from './states.js'

export default {
  name: 'app',
  components: {
	Gameboard,
	Player,
  },
	data: function() {
		return {
		showInstructions: false,
		turnNumber: 0,
		gameRound: 0, // game hasn't begun
		currentPlayer: 0,
		cardsDiscarded: 0,
		cardsRemaining: 0,
		distance: 300, // rename this, give more meaningful value
		players: [
			{ id: 0, name: "Melvin", automated: true, token: "#token1", color: '#f88', location: "OH", objective: "AL" },
			{ id: 1, name: "You", automated: false, token: "#token2", color: '#8f8', location: "OH" },
			{ id: 2, name: "Priscilla", automated: true, token: "#token3", color: '#88f', location: "OH" }
		],
		log: ['initial message']
		}
	},
	computed: {
		cplayer: function() {
			return this.players[this.currentPlayer]
		}
	},
	created: function() {
		for( let player of this.players ) {
			player.location = randomState();
			// player.objective = this.setMission( this.distance );
			player.objective = randomState();
			this.log.push(`${player.name} starts in ${player.location}, heading to ${player.objective}`)
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
			this.log.push('removing card: '+cardName)
			this.log.push('remaining cards: '+this.player.cards)
			let cardIndex = this.player.cards.indexOf(cardName)
			if( cardIndex >= 0 ) {
				this.player.cards.splice(cardIndex,1)
				this.nextPlayer()
			} else {
				this.log.push('card not found in hand')
			}
		},
		startTurn: function() {
			var cp = this.currentPlayer;
			// var msg = 'turn for Player ' + cp + this.players[cp].name;
			var msg = `turn for Player ${cp} (${this.players[cp].name})`;
			this.log.push(msg);
			this.log.push(msg)
		},
		setLocation: function() {
			return 'AK'
		},
		setMission: function() {
			return 'MO'
		},
		movePlayer: function(destination) {
			this.cplayer.location = destination
			if (destination == this.cplayer.objective) {
				alert("victory for", this.cplayer.name)
			} else {
				this.nextPlayer()
			}
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

<style lang="scss">
body {
	background: beige url('../public/boardbg.png');
	margin: 0;
}
#app {
	background: #eeecc7;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
header.roadmap {
	background: url('../public/roadmap.jpg');
	background-size: cover;
}
footer#primary {
	background: #88766a;
	color: #eee3ba;
	padding: 1rem 2rem;
}
h1 {
	background: #ddd5b1b0;
	/* background: linear-gradient(#ddd5b1,#d9b99b); */
	color: #a47799;
	margin: 0;
	padding: 32px 10px 10px;
}
h2 {
	background: #88766ae8;
	margin: 0;
	padding: 10px;
	color: #eee3ba;
}
section h3 {
	background: #88766a;
	color: #eee3ba;
	margin: 0;
	padding: 0.5em;
}
p {
	font-family: 'Helvetica', sans-serif;
}
dt, dd { display: inline; }

.location {
	background: #ddeeff;
	border: 1px solid #9999bb;
	padding: 0 0.3em;
}
.cards {
	height: 2em;
}

#instructions { 
	border: 2px solid #F6B;
	background: #BCD;
	position: absolute;
	top: 200px;
	left: 200px;
	height: 150px;
	width: 300px;
}

#help {
	height:2.5em;
	position: absolute;
	right: 20px;
	top: 10px;
}

#status {
	border: solid 3px #bbb;
	background: #c5bbfb8c;
	color: #556;
	display: flex;
	font-family: sans;
	font-size: smaller;
	padding: 1rem;
}
#game-log {
	flex: 1 1 50%;
	height: 5rem;
	overflow-y: scroll;
	margin: 0;
}
#game-state {
	background: #9e8abb40;
	border: dotted 1px #948f9f;
	font-size: 80%;
	flex: 1 1 50%;
	margin: 0;
	padding: 1em;
}

main {
	display: flex;
}
#players {
	display: flex;
	flex-direction: column;
	margin: 1rem;
}
#gameboard {
	border: 2px solid #aaaaaa;
	height: 612px;
	margin: 1rem;
	overflow: hidden;
	position: relative;
	top: 0;
	width: 900px;
}
.pawn {
	/*background-color: #ff9000;*/
	border: 1px solid #888;
	height: 10px;
	overflow: hidden;
	position: absolute;
	width: 10px;
	z-index: 10;
}
#token1 {
	background-color: #aa8822;
}
#token2 {
	background-color: #2288aa;
}
#token3 {
	background-color: #88aa22;
}

</style>

<template>
  <div>
		<header class="roadmap">
			<h1>State Race</h1>
			<h2>a game of U.S. geography</h2>

			<button id="help" @click="showInstructions = true">
				Instructions for Gameplay!
			</button>
			<div id="instructions" v-show="showInstructions">
				<p>
				Unfortunately the game is a bit broken at the moment. Playing it is not advised until this is remedied.
				</p>
				<button id="done" @click="showInstructions = false">OK!</button>	
			</div>
		</header>

	<section id="status">
		<dl id="game-state">
			<dt>Turn:</dt> <dd>{{turnNumber}}</dd><br/>
			<dt>Round:</dt> <dd>{{gameRound}}</dd><br/>
			<dt>Ranking:</dt> <dd><span id='ranking'>rank</span></dd><br/>
			<dt>Cards left in deck:</dt> <dd>{{cardsRemaining}}</dd><br/>
			<dt>Number discarded:</dt> <dd>{{cardsDiscarded}}</dd><br/>
		</dl>
		<ol id="game-log">
			<li>will show: v-for="message in log" {{message}}</li>
		</ol>
	</section>

	<main>
		<section id="players">
			<h3>Players</h3>
			<Player 
				v-for="player in players"
				v-on:travel="movePlayer"
				v-on:end-turn="nextPlayer"
				:key="'p' + player.id"
				:player="player"
				:active="player.id == currentPlayer"
			/>
		</section>

		<Gameboard
			:players="players" :current="currentPlayer"
		/>

	</main>
	<footer id="primary">
		<p>License?</p>
		<p>Header image adapted from photo by <a href="https://unsplash.com/@stevep4?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge" target="_blank" rel="noopener noreferrer" title="Download free do whatever you want high-resolution photos from Stephen Monroe"><span style="display:inline-block;padding:2px 3px"><svg xmlns="http://www.w3.org/2000/svg" style="height:12px;width:auto;position:relative;vertical-align:middle;top:-2px;fill:white" viewBox="0 0 32 32"><title>unsplash-logo</title><path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path></svg></span><span style="display:inline-block;padding:2px 3px">Stephen Monroe</span></a></p>
	</footer>
		
  </div>
</template>
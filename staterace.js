/*******
April 2018
Objective:
Progress:
	implement basic game rules
	object-orient players and cards
	use Vue for display of players and cards
To-do:
	vue draggable for interacting with cards
	single file components
Questions:
	svg display
	jquery linking
	indexOf breaks on IE < 9
********/


var deck = {
	dealHand: function( cardsNeeded ) {
		var hand = []
		for (var i=0; i<cardsNeeded; i++) {
			hand.push(randomState())
		}
		return hand
	}
}

// component should contain a hyphen for use as custom tag in DOM...
Vue.component('player', {
	props: ['location','name','objective'],
	data: function() {
		return {
			cards: [],
			// location: this.initialLocation,
		}
	},
	created: function() {
		this.cards = deck.dealHand(6)
	},
	methods: {
		handleCardClick: function() { console.log('card clicked') },
		handleCardeDoubleClick: function() {},
		handleDrawCards: function() { 
			console.log('new cards for you!')
			this.cards = deck.dealHand(this.cards.length)
		}
	},
	template: `
		<div id="player-template" class="player-info">
			<p class="name">{{name}}</p>
			<p>Position: {{location}}</p>
			<p>Mission: {{objective}}</p>
			<p>Cards</p>
			<div class="cardsinhand">
				<card v-for="card in cards" 
					v-on:click="handleCardClick"
					v-bind:location="location"
					v-bind:abbrev="card"
					class="cardbtn"
				>
				</card>
			</div>
			<div class="discards"><p>Drag unwanted cards here</p></div>
			<p class='control'>
				<span class='or'>or </span>
				<span class='allcardsbtn' @click="handleDrawCards">Draw New Cards</span>
			</p>
		</div>
	`
})

Vue.component('pawn', {
	props: ['name','color','location'],
	data: function() {
		return {
			x: 50, 
			y: 30,
		}
	},
	computed: {
		coordinates: function() {
			// console.debug('location', this.location)
			// console.debug('states',stateObjects)
			return stateInfo[this.location].position
		},
		styleObject: function() {
			return {
				top: (this.coordinates[1] + 340) + 'px',
				left: this.coordinates[0] + 'px',
				backgroundColor: this.color
			}
		}
	},
	template: `<div class="pawn" :title="name" :style="styleObject">{{location}}</div>`
})

// TODO: use vue-draggable here
Vue.component('card', {
	props: ['location','abbrev','name'],
	data: function() {
		return {
			highlighted: false
		}
	},
	computed: {
		adjacent: function() {
			return stateInfo[this.location].neighbors.includes(this.abbrev)
		}
	},
	methods: {
		Drag: function(){}
	},
	template: `
		<span v-on:click="highlighted = !highlighted"
			  v-bind:class="{ adjacent: adjacent }"
		>
			{{abbrev}}
		</span>
	`
})

vueapp = new Vue({
	el: '#app',
	data: {
		showInstructions: false,
		turnNumber: 0,
		currentPlayer: 2,
		cardsDiscarded: 0,
		cardsRemaining: 0,
		distance: 300, // rename this, give more meaningful value
		players: [
			{ id: 0, name: "Melvin", automated: true, token: "#token1", color: '#f88', location: "OH" },
			{ id: 1, name: "You", automated: false, token: "#token2", color: '#8f8', location: "OH" },
			{ id: 2, name: "Priscilla", automated: true, token: "#token3", color: '#88f', location: "OH" }
		],
		round: 0, // game hasn't begun
		turn: 0
	},
	created: function() {
		for( player of this.players ) {
			player.location = randomState();
			// player.objective = this.setMission( this.distance );
			player.objective = randomState();
			player.cards = deck.dealHand(7);
			// if(!players[p].automated) {
			// 	players[p].setDroppables();
			// }
		}
	},
	mounted: function() {
		this.startTurn()
	},
	methods: {
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
			currentPlayer += 1;
			if (this.currentPlayer == this.players.length) {
				this.currentPlayer = 0
			}
			// this.currentPlayer = (this.currentPlayer.length == this.currentPlayer)? 0 : this.currentPlayer + 1
			// startTurn() ?
			// or
			// this.startTurn();
		}
	}
})

// $('#turn_number').html(turn);    //draw cards
// var distance = 300;


// vueapp.nextPlayer();

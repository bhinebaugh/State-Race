/*******
June 2011
Objective:
Progress:
	implement basic game rules
	object-orient players and cards
Questions:
	svg display
	jquery linking
	indexOf breaks on IE < 9
********/

//set up the game
var newCardsButton = "<p class='control'><span class='or'>or </span><span class='allcardsbtn'>Draw New Cards</span></p>";
var cardTmpl = "<span class='cardbtn'></span>";
var round = 1;   // How many rounds of the game have been played
var turn = -1;    // Index indicating which player's turn it is
var players = [];



function State(abbrev, name, borders, location){
   this.abbrev = abbrev;
   this.name = name;
   this.position = location;
   this.bordering = [];
   this.distances = {};

   this.setDist = function(othState,dist){
     this.distances[othState.name] = dist;
   };

	this.neighbors = function() {
		if (this.bordering.length < 1) {
			thisBordering = this.bordering;
			_.each(borders, function(abbrev){
				thisBordering.push(stateObjects[abbrev]);
			});
			return this.bordering;
		}
		else return this.bordering;
	};
	this.randomNeighbor = function() {
		var myNeighbors = this.neighbors();
		return myNeighbors[Math.floor(Math.random()*myNeighbors.length)];
	};
	this.movesTo = function(state){
		if (this.distances.hasOwnProperty(state.name)) {
			return this.distances[state.name];
		}
		else return 999;
	};

};

/* Intended player HTML:
	<div id="player-template" class="player-info">
		<p class="name">(player name)</p>
		<p>Mission: <span class="objective"></span></p>
		<p>Position: <span class="location"></span><span class="destination">Travel to...</span></p>
		<p>Cards</p>
		<div class="cardsinhand">
			<div class="cards"></div>
		</div>
		<div class="discards"><p>Drag unwanted cards here</p></div>
	</div>
*/

/*** the Player object ***/
function Player(name, nonhuman, pawnid) {
	this.name = name;
	this.automated = nonhuman;
	/*
	if( !this.automated ) {
		this.playerdiv.find('.discards').append(newCardsButton);
		$(this.playerdiv).addClass('human');
	}
	*/
	this.pulsing;
	
	this.icon = $(pawnid);
	this.location;
	this.objective;
	this.points = 0;
	this.hand = new Array(); // hand has been replaced by cards
	this.cards = new Array(); // contains cards as DOM elements
	
	var playerdiv;
	this.buildHTML =  function() {
		$('#players').append('<div id="' + name + '" class="player-info">'
			+ '<p class="name">(player name)</p>'
			+ '<p>Mission: <span class="objective"></span></p>'
			+ '<p>Position: <span class="location"></span><span class="destination">Travel to...</span></p>'
			+ '<p>Cards</p>'
			+ '<div class="cardsinhand">'
			+ '<div class="cards"></div>'
			+ '</div>'
			+ '<div class="discards"><p>Drag unwanted cards here</p></div>'
			+ '</div>');
		return $('#' + name);
	};
	this.playerdiv = this.buildHTML();
	
	this.nameDiv = this.playerdiv.find('.name')[0];
	$(this.nameDiv).html(name);
	this.playerdiv.append(newCardsButton);
	
	this.startTurn = function() {
		this.pulse();
		// Identify path options
		// Play a card
		// Discard
	}
	
	this.pulse = function() {
		thisObj = this;
		if (this.playerdiv.hasClass('start')) {
			this.playerdiv.removeClass('start');
			this.playerdiv.addClass('end');
		} else {
			this.playerdiv.addClass('start');
			this.playerdiv.removeClass('end');
		}
		this.pulsing = setTimeout(function() {thisObj.pulse();}, 750);
	}
	
	this.endTurn = function() {
		this.playerdiv.removeClass('end').removeClass('start');
		clearTimeout(this.pulsing);
		// Various other cleanup tasks;
	}
	
	this.setLocation = function(newLocation) {
		this.location = newLocation;
		this.playerdiv.find('.location')[0].innerHTML = this.location;
		this.icon.css({
			'left': states[this.location].location[0],
			'top': states[this.location].location[1],
			'position': 'absolute'
		});
	}
	this.calcDistance = function( state ) {
		var otherLoc = states[state].location;
		var myLoc = states[this.location].location;
		return Math.abs(myLoc[0]-otherLoc[0]) + Math.abs(myLoc[1]-otherLoc[1]);
	}

	this.setMission = function( distance ) {
		var minDiff = 10000;
		var currMin = randomState();
		for (var state in states) {
			diff = Math.abs(this.calcDistance(state) - distance);
			if(diff < minDiff) {
				minDiff = diff;
				currMin = state;
			}
		}
		this.objective = currMin;
		this.playerdiv.find('.objective')[0].innerHTML = "Visit "+stateObjects[currMin].name + " ("+currMin+")";
	}
	this.setDroppables = function() {
		console.log("set droppables for "+this.name);
		var myDiv = this.playerdiv;
		var meObj = this;
		myDiv.find('.cards').droppable({
			//if cards are dragged back, remove the unwanted class
			drop: function( event, ui ){ ui.draggable.removeClass('unwanted') }
		});
		myDiv.find('.destination').droppable({
			activeClass : "destination-drop",
			hoverClass : "destination-over",
			accept :  ".adjacent",
			drop : function( event, ui ) {
				meObj.playCard(ui.draggable);
			}
		});
		myDiv.find('.discards').droppable({
			drop : function( event, ui ) {
				console.log(ui.draggable.prop('innerHTML') + " was dropped on "+$(this).attr('class'));
				// register the card on to discard later / at end of turn
				ui.draggable.addClass('unwanted');
				// change text and binding of  discard button
				//$('.allcardsbtn').bind('click', jQuery.proxy(meObj, "switchCards") );
				myDiv.find('.discards .or').hide();
				myDiv.find('.allcardsbtn').html("Discard the cards above");
				// the line below won't bind 'this' to switchCards the way switchAllCards does later, b/c inside jquery scope?
				myDiv.find('.allcardsbtn').unbind().bind('click', $.proxy(meObj.switchCards, meObj) );
			}
		});
		myDiv.find('.discards .or').show();
		myDiv.find('.allcardsbtn').html("Exchange all cards").unbind().bind('click', $.proxy(this.switchAllCards, this ) );
	};
	this.redrawHand = function() { // deprecate this function
		var handspan = '';
		var meObj = this;
		var myDiv = "#"+this.name;
		var bordering = states[ this.location ].borders;
		var startspan = "";
		for( var i =0; i<this.hand.length; i++ ) {
			if( bordering.indexOf(this.hand[i]) == -1 )  {
				startspan = "<span class='cardbtn'>";
			} else {
				startspan = "<span class='cardbtn adjacent'>";
			}
			handspan += startspan+this.hand[i]+"</span>";
		}
		$(this.playerdiv).find('.cards').html(handspan);
		$(myDiv + ' .cardbtn').draggable({ containment: myDiv, revert: "invalid" });
	} 
	this.markAdjacentCards = function( cardArray ) {
		if( cardArray instanceof Array) {
			$.each( cardArray, $.proxy( 
				function( index, cardDOM ) {
					var cardObj = $(cardDOM);
					if(stateObjects[cardObj.html()].movesTo(stateObjects[this.location]) == 1) {
						cardObj.addClass('adjacent');
					} else {
						cardObj.removeClass('adjacent');
					}
				}, this )
			)
		}
	}
	this.addCard = function( stateAbbrev ) {
		var cardDiv = $( cardTmpl );
		cardDiv.html( stateAbbrev );
		this.markAdjacentCards( [cardDiv] ); // pass in as a single-element array
		if(!this.automated) {
			cardDiv.draggable({ containment: "#"+this.name, revert: "invalid" });
		}
		this.cards.push( cardDiv[0] );
		$(this.playerdiv).find('.cards').append(cardDiv);
	}
	this.dealHand = function( cardsNeeded ) {
		for (var i=0; i<cardsNeeded; i++) {
			this.addCard(randomState());
		}
		//this.redrawHand();
		if(!this.automated) this.setDroppables();
	}
	this.switchAllCards = function() {
		var numberOfCards = this.cards.length;
		this.cards = [];
		$(this.playerdiv).find('.cards').empty();
		this.dealHand(numberOfCards);
		//this.redrawHand();
	}
	this.switchCards = function() {
		console.log("switchCards ... cards length "+this.cards.length);
		var h = this.cards;
		var cardsLost = 0;
		var cardsKept = new Array();
		$.each( h, function( index, cardDOM ) {
			var card = $(cardDOM);
			var discardtest = "considering "+card.html();
			if( card.hasClass('unwanted') ) {
				discardtest += " ... unwanted";
				card.remove();
				cardsLost++;
				//h.splice( index, 1 );
			} else { 
				discardtest += " ... retain";
				cardsKept.push(card);
			}
			console.log(discardtest);
		});
		this.cards = cardsKept;
		// animate cards leftward into any empty spaces created by discards
		this.dealHand(cardsLost);
	}
	this.playCard = function( targetDOMList ) {
		var targetDOM = targetDOMList[0];
		var target = targetDOM.innerHTML;
		console.log(targetDOM);
		console.log(targetDOM.innerHTML);
		//var cardPlayed = this.cards[ the one that matches target ]
		if ( stateObjects[target].movesTo(stateObjects[this.location]) === 1 ) {
			console.log("traveling to "+target);
			this.cards.splice( this.cards.indexOf(targetDOM), 1 );
			this.setLocation( target );
			$(targetDOM).remove();
			// mark cards whose states are adjacent to the new location
			this.markAdjacentCards( this.cards );
			$('#ranking').html(ranking());
			//this.checkVictory(); //handled outside player object now?
			// animate cards consolide left, new card slides in from right
			this.addCard( randomState() );
			//this.redrawHand();
		} else {
			console.log(target + " is not adjacent to " + this.location);
			// revert card to original postion through 'revert' property on .draggable()
		}
	}
}


stateObjects = {
	"AK" : new State("AK","Alaska",['WA','HI'],[110,550]),
	"HI" : new State("HI","Hawaii",['AK','CA'],[270,600]),
	"WA" : new State("WA","Washington",['OR','ID'],[120,60]),
	"OR" : new State("OR","Oregon",['WA','ID','CA','NV'],[110,140]),
	"CA" : new State("CA","California",['OR','NV','AZ'],[100,350]),
	"NV" : new State("NV","Nevada",['OR','ID', 'CA','UT','AZ'],[130,240]),
	"ID" : new State("ID","Idaho",['WA','OR','MT','WY','NV','UT'],[180,150]),
	"UT" : new State("UT","Utah",['ID','WY','NV','CO','AZ','NM'],[220,255]),
	"AZ" : new State("AZ","Arizona",['CA','NV','UT','CO','NM'],[210,390]),
	"MT" : new State("MT","Montana",['ID','ND','SD','WY'],[240,90]),
	"WY" : new State("WY","Wyoming",['MT','ID','SD','NE','UT','CO'],[280,200]),
	"CO" : new State("CO","Colorado",['WY','UT','NM','OK','KS','NE'],[300,280]),
	"NM" : new State("NM","New Mexico",['CO','AZ','TX','OK'],[280,390]),
	"ND" : new State("ND","North Dakota",['MT','SD','MN'],[420,80]),
	"SD" : new State("SD","South Dakota",['ND','MT','WY','NE','IA','MN'],[420,170]),
	"NE" : new State("NE","Nebraska",['SD','WY','CO','KS','MO','IA'],[420,250]),
	"KS" : new State("KS","Kansas",['NE','CO','OK','MO'],[445,315]),
	"OK" : new State("OK","Oklahoma",['KS','CO','NM','TX','AR','MO'],[460,380]),
	"TX" : new State("TX","Texas",['OK','NM','LA','AR'],[430,450]),
	"MN" : new State("MN","Minnesota",['ND','SD','IA','WI'],[510,120]),
	"IA" : new State("IA","Iowa",['SD','NE','MO','IL','WI','MN'],[600,260]),
	"MO" : new State("MO","Missouri",['IA','NE','KS','OK','AR','TN','KY','IL'],[550,310]),
	"AR" : new State("AR","Arkansas",['MO','OK','TX','LA','MS','TN'],[550,385]),
	"LA" : new State("LA","Louisiana",['AR','TX','MS'],[555,460]),
	"WI" : new State("WI","Wisconsin",['MN','IA','IL','MI'],[590,160]),
	"IL" : new State("IL","Illinois",['WI','IA','MO','KY','IN'],[600,255]),
	"MI" : new State("MI","Michigan",['WI','IN','OH'],[670,185]),
	"IN" : new State("IN","Indiana",['MI','IL','KY','OH'],[655,255]),
	"OH" : new State("OH","Ohio",['MI','IN','KY','WV','PA'],[710,240]),
	"KY" : new State("KY","Kentucky",['IN','IL','MO','TN','VA','WV','OH'],[685,305]),
	"TN" : new State("TN","Tennessee",['KY','MO','AR','MS','AL','GA','NC','VA'],[670, 345]),
	"MS" : new State("MS","Mississippi",['TN','AR','LA','AL'],[605,420]),
	"AL" : new State("AL","Alabama",['TN','MS','FL','GA'],[660,420]),
	"ME" : new State("ME","Maine",['NH'],[900,90]),
	"NH" : new State("NH","New Hampshire",['ME','MA','VT'],[880,125]),
	"VT" : new State("VT","Vermont",['NH','NY','MA'],[860,120]),
	"MA" : new State("MA","Massachusetts",['NH','VT','NY','CT','RI'],[880,155]),
	"RI" : new State("RI","Rhode Island",['MA','CT'],[893,170]),
	"CT" : new State("CT","Connecticut",['RI','MA','NY'],[875,175]),
	"NY" : new State("NY","New York",['VT','MA','CT','PA','NJ'],[830,160]),
	"PA" : new State("PA","Pennsylvania",['NY','OH','WV','MD','DE','NJ'],[805,210]),
	"NJ" : new State("NJ","New Jersey",['NY','PA','DE'],[852,220]),
	"DE" : new State("DE","Delware",['NJ','PA','MD'],[843,250]),
	"MD" : new State("MD","Maryland",['DE','PA','WV','VA'],[820,245]),
	"WV" : new State("WV","West Virginia",['PA','OH','KY','VA','MD'],[750,275]),
	"VA" : new State("VA","Virginia",['MD','WV','KY','TN','NC'],[800,290]),
	"NC" : new State("NC","North Carolina",['VA','TN','GA','SC'],[800,335]),
	"SC" : new State("SC","South Carolina",['NC','GA'],[770,380]),
	"GA" : new State("GA","Georgia",['TN','AL','FL','SC','NC'],[730,425]),
	"FL" : new State("AK","Florida",['GA','AL'],[780,525])
}
/*
**	Possible refactoring note:
**	create a separate array that lists state abbreviations to allow more efficient
**	random state selection (i.e., select random from array.count and lookup state 
**	object by abbreviation).
*/


 //storing initial graph distances for floyd's calculations
_.each(stateObjects, function(state) {
	_.each(state.neighbors(), function (neighbor) {
		state.setDist(neighbor, 1);
		neighbor.setDist(state, 1);
	})
})

//Floyd's shortest path calculation
_.each(stateObjects, function(interState) {
	_.each(stateObjects, function(state1) {
		_.each(stateObjects, function(state2) {
			var min = Math.min(
				state1.movesTo(state2), 
				(state1.movesTo(interState) + interState.movesTo(state2)) 
				// Doesn't the second argument evaluate to true instead of a number?
			);
			state1.setDist(state2, min);
			state2.setDist(state1, min);
		})
	})
})


states = {
	"AK" : {"name": "Alaska", "borders":['WA','HI'], "location":[110,550]},
	"HI" : {"name":"Hawaii", "border":['AK','CA'], "location":[270,600]},
	"WA" : {"name": "Washington", "borders":['OR','ID'], "location":[120,60]},
	"OR" : {"name": "Oregon", "borders":['WA','ID','CA','NV'], "location":[110,140]},
	"CA" : {"name": "California", "borders":['OR','NV','AZ'], "location":[100,350]},
	"NV" : {"name": "Nevada", "borders":['OR','ID', 'CA','UT','AZ'], "location":[130,240]},
	"ID" : {"name": "Idaho", "borders":['WA','OR','MT','WY','NV','UT'], "location":[180,150]},
	"UT" : {"name": "Utah", "borders":['ID','WY','NV','CO','AZ','NM'], "location":[220,255]},
	"AZ" : {"name": "Arizona", "borders":['CA','NV','UT','CO','NM'], "location":[210,390]},
	"MT" : {"name": "Montana", "borders":['ID','ND','SD','WY'], "location":[240,90]},
	"WY" : {"name": "Wyoming", "borders":['MT','ID','SD','NE','UT','CO'], "location":[280,200]},
	"CO" : {"name": "Colorado", "borders":['WY','UT','NM','OK','KS','NE'], "location":[300,280]},
	"NM" : {"name": "New Mexico", "borders":['CO','AZ','TX','OK'], "location":[280,390]},
	"ND" : {"name": "North Dakota", "borders":['MT','SD','MN'], "location":[420,80]},
	"SD" : {"name": "South Dakota", "borders":['ND','MT','WY','NE','IA','MN'], "location":[420,170]},
	"NE" : {"name": "Nebraska", "borders":['SD','WY','CO','KS','MO','IA'], "location":[420,250]},
	"KS" : {"name": "Kansas", "borders":['NE','CO','OK','MO'], "location":[445,315]},
	"OK" : {"name": "Oklahoma", "borders":['KS','CO','NM','TX','AR','MO'], "location":[460,380]},
	"TX" : {"name": "Texas", "borders":['OK','NM','LA','AR'], "location":[430,450]},
	"MN" : {"name": "Minnesota", "borders":['ND','SD','IA','WI'], "location":[510,120]},
	"IA" : {"name": "Iowa", "borders":['SD','NE','MO','IL','WI','MN'], "location":[600,260]},
	"MO" : {"name": "Missouri", "borders":['IA','NE','KS','OK','AR','TN','KY','IL'], "location":[550,310]},
	"AR" : {"name": "Arkansas", "borders":['MO','OK','TX','LA','MS','TN'], "location":[550,385]},
	"LA" : {"name": "Louisiana", "borders":['AR','TX','MS'], "location":[555,460]},
	"WI" : {"name": "Wisconsin", "borders":['MN','IA','IL','MI'], "location":[590,160]},
	"IL" : {"name": "Illinois", "borders":['WI','IA','MO','KY','IN'], "location":[600,255]},
	"MI" : {"name": "Michigan", "borders":['WI','IN','OH'], "location":[670,185]},
	"IN" : {"name": "Indiana", "borders":['MI','IL','KY','OH'], "location":[655,255]},
	"OH" : {"name": "Ohio", "borders":['MI','IN','KY','WV','PA'], "location":[710,240]},
	"KY" : {"name": "Kentucky", "borders":['IN','IL','MO','TN','VA','WV','OH'], "location":[685,305]},
	"TN" : {"name": "Tennessee", "borders":['KY','MO','AR','MS','AL','GA','NC','VA'], "location":[670, 345]},
	"MS" : {"name": "Mississippi", "borders":['TN','AR','LA','AL'], "location":[605,420]},
	"AL" : {"name": "Alabama", "borders":['TN','MS','FL','GA'], "location":[660,420]},
	"ME" : {"name": "Maine", "borders":['NH'], "location":[900,90]},
	"NH" : {"name": "New Hampshire", "borders":['ME','MA','VT'], "location":[880,125]},
	"VT" : {"name": "Vermont", "borders":['NH','NY','MA'], "location":[860,120]},
	"MA" : {"name": "Massachusetts", "borders":['NH','VT','NY','CT','RI'], "location":[880,155]},
	"RI" : {"name": "Rhode Island", "borders":['MA','CT'], "location":[893,170]},
	"CT" : {"name": "Connecticut", "borders":['RI','MA','NY'], "location":[875,175]},
	"NY" : {"name": "New York", "borders":['VT','MA','CT','PA','NJ'], "location":[830,160]},
	"PA" : {"name": "Pennsylvania", "borders":['NY','OH','WV','MD','DE','NJ'], "location":[805,210]},
	"NJ" : {"name": "New Jersey", "borders":['NY','PA','DE'], "location":[852,220]},
	"DE" : {"name": "Delware", "borders":['NJ','PA','MD'], "location":[843,250]},
	"MD" : {"name": "Maryland", "borders":['DE','PA','WV','VA'], "location":[820,245]},
	"WV" : {"name": "West Virginia", "borders":['PA','OH','KY','VA','MD'], "location":[750,275]},
	"VA" : {"name": "Virginia", "borders":['MD','WV','KY','TN','NC'], "location":[800,290]},
	"NC" : {"name": "North Carolina", "borders":['VA','TN','GA','SC'], "location":[800,335]},
	"SC" : {"name": "South Carolina", "borders":['NC','GA'], "location":[770,380]},
	"GA" : {"name": "Georgia", "borders":['TN','AL','FL','SC','NC'], "location":[730,425]},
	"FL" : {"name": "Florida", "borders":['GA','AL'], "location":[780,525]}
}
//Cards	array?

function randomState() {
	var x;
	var i=0;
	for (var s in states) {
    	++i;
		if (Math.random() < 1/i) x = s;
	}
	return x
}

function ranking() {
	//this may be a hack?
	//create hash to store (disance -> player) as Key/Value pairs
	//also store distances in an array
	//sort array, then get player values in sequence
	positions = {};
	values = [];
	var x = 0;
	for (var i in players) {
		positions[players[i].calcDistance(players[i].objective)]= players[i];
		values[x]=players[i].calcDistance(players[i].objective);
		x++;
	}
	values.sort();
	var returnString = "";
	for (var i in players) {
		returnString += positions[values[i]].name + ", ";
	}
	return returnString.slice(0,-2);
}

function nextPlayer() {
	if (turn >= 0) {
		players[turn].playerdiv.removeClass('current');
		players[turn].endTurn();
	}
	if (++turn >= players.length) {
		turn = 0;
		round++;
	}
	players[turn].playerdiv.addClass('current');
	players[turn].startTurn();
	updateTurnDisplay();
}

function updateTurnDisplay() {
	$('#turn_number').html(round);
	$('#current_player').html(players[turn].name);
}


$(document).ready( function() {
	players.push( new Player("Morris", true, '#token1') );
	players.push( new Player("You", false, '#token2') );
	players.push( new Player("Priscilla", true, '#token3') );

	$('#turn_number').html(turn);    //draw cards
	var distance = 300;

	for (p = 0; p < players.length; p++) {
		players[p].setLocation( randomState() );
		players[p].setMission( distance );
		players[p].dealHand(7);
		if(!players[p].automated) {
			players[p].setDroppables();
		}
	}
	
	nextPlayer();
	
});

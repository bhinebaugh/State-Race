/*******
June 2011
Objective:
Progress:
	implement basic game rules
	object-orient players and cards
Questions:
	svg display
	jquery linking
********/

states = {
	"AK" : {"name": "Alaska", "borders":['WA','HI'], "location":[]},
	"HI" : {"name":"Hawaii", "border":['AK','CA'], "location":[]},
	"WA" : {"name": "Washington", "borders":['OR','ID'], "location":[]},
	"OR" : {"name": "Oregon", "borders":['WA','ID','CA','NV'], "location":[]},
	"CA" : {"name": "California", "borders":['OR','NV','AZ'], "location":[]},
	"NV" : {"name": "Nevada", "borders":['OR','ID', 'CA','UT','AZ'], "location":[]},
	"ID" : {"name": "Idaho", "borders":['WA','OR','MT','WY','NV','UT'], "location":[]},
	"UT" : {"name": "Utah", "borders":['ID','WY','NV','CO','AZ','NM'], "location":[]},
	"AZ" : {"name": "Arizona", "borders":['CA','NV','UT','CO','NM'], "location":[]},
	"MT" : {"name": "Montana", "borders":['ID','ND','SD','WY'], "location":[]},
	"WY" : {"name": "Wyoming", "borders":['MT','ID','SD','NE','UT','CO'], "location":[]},
	"CO" : {"name": "Colorado", "borders":['WY','UT','NM','OK','KS','NE'], "location":[]},
	"NM" : {"name": "New Mexico", "borders":['CO','AZ','TX','OK'], "location":[]},
	"ND" : {"name": "North Dakota", "borders":['MT','SD','MN'], "location":[]},
	"SD" : {"name": "South Dakota", "borders":['ND','MT','WY','NE','IA','MN'], "location":[]},
	"NE" : {"name": "Nebraska", "borders":['SD','WY','CO','KS','MO','IA'], "location":[]},
	"KS" : {"name": "Kansas", "borders":['NE','CO','OK','MO'], "location":[]},
	"OK" : {"name": "Oklahoma", "borders":['KS','CO','NM','TX','AR','MO'], "location":[]},
	"TX" : {"name": "Texas", "borders":['OK','NM','LA','AR'], "location":[]},
	"MN" : {"name": "Minnesota", "borders":['ND','SD','IA','WI'], "location":[]},
	"IA" : {"name": "Indiana", "borders":['SD','NE','MO','IL','WI','MN'], "location":[]},
	"MO" : {"name": "Missouri", "borders":['IA','NE','KS','OK','AR','TN','KY','IL'], "location":[]},
	"AR" : {"name": "Arkansas", "borders":['MO','OK','TX','LA','MS','TN'], "location":[]},
	"LA" : {"name": "Louisiana", "borders":['AR','TX','MS'], "location":[]},
	"WI" : {"name": "Wisconsin", "borders":['MN','IA','IL','MI'], "location":[]},
	"IL" : {"name": "Illinois", "borders":['WI','IA','MO','KY','IN'], "location":[]},
	"MI" : {"name": "Michigan", "borders":['WI','IN','OH'], "location":[]},
	"IN" : {"name": "Indiana", "borders":['MI','IL','KY','OH'], "location":[]},
	"OH" : {"name": "Ohio", "borders":['MI','IN','KY','WV','PA'], "location":[]},
	"KY" : {"name": "Kentucky", "borders":['IN','IL','MO','TN','VA','WV','OH'], "location":[]},
	"TN" : {"name": "Tennessee", "borders":['KY','MO','AR','MS','AL','GA','NC','VA'], "location":[]},
	"MS" : {"name": "Mississippi", "borders":['TN','AR','LA','AL'], "location":[]},
	"AL" : {"name": "Alabama", "borders":['TN','MS','FL','GA'], "location":[]},
	"ME" : {"name": "Maine", "borders":['NH'], "location":[]},
	"NH" : {"name": "New Hampshire", "borders":['ME','MA','VT'], "location":[]},
	"VT" : {"name": "Vermont", "borders":['NH','NY','MA'], "location":[]},
	"MA" : {"name": "Massachusetts", "borders":['NH','VT','NY','CT','RI'], "location":[]},
	"RI" : {"name": "Rhode Island", "borders":['MA','CT'], "location":[]},
	"CT" : {"name": "Connecticut", "borders":['RI','MA','NY'], "location":[]},
	"NY" : {"name": "New York", "borders":['VT','MA','CT','PA','NJ'], "location":[]},
	"PA" : {"name": "Pennsylvania", "borders":['NY','OH','WV','MD','DE','NJ'], "location":[]},
	"NJ" : {"name": "New Jersey", "borders":['NY','PA','DE'], "location":[]},
	"DE" : {"name": "Delware", "borders":['NJ','PA','MD'], "location":[]},
	"MD" : {"name": "Maryland", "borders":['DE','PA','WV','VA'], "location":[]},
	"WV" : {"name": "West Virginia", "borders":['PA','OH','KY','VA','MD'], "location":[]},
	"VA" : {"name": "Virginia", "borders":['MD','WV','KY','TN','NC'], "location":[]},
	"NC" : {"name": "North Carolina", "borders":['VA','TN','GA','SC'], "location":[]},
	"SC" : {"name": "South Carolina", "borders":['NC','GA'], "location":[]},
	"GA" : {"name": "Georgia", "borders":['TN','AL','FL','SC','NC'], "location":[]},
	"FL" : {"name": "Florida", "borders":['GA','AL'], "location":[]},
	"AL" : {"name": "Alabama", "borders":[], "color":"green"},
}
//Cards	array?

function randomState() {
	var x;
	var i=0;
	for (var s in states) {
		if (Math.random() < 1/++i) x = s;
	}
	return x
}
$(document).ready( function() {
	//set up the game
		
	pt = $('#player-template');
	turn = 0;
	players = [];
	
	/*** the Player object ***/
	function Player( name, nonhuman ) {
		var playerdiv = pt.clone();
		playerdiv.attr('id', name);
		$('#players').append(playerdiv);
		this.name = name;
		
		this.nameDiv = playerdiv.find('.name')[0];
		$(this.nameDiv).html(name);
		
		//p_temp.find('.name').each( function() { this.update('shmoo') });
		//$('#'+name+' .name').html(this.name);
		this.automated = nonhuman;
		this.icon;
		this.location;
		this.objective;
		this.points = 0;
		this.hand = new Array();
/* 		hand.prototype.push
		function() {
			DOMelement '.cards' .html( new_card )
			Array.push
		}
 */		this.addCard = function( newcard ) {
			this.hand.push(newcard);
			var card_class = (this.automated) ? 'card' : 'cardbtn';
 			$(playerdiv.find('.cards')[0]).append("<span class='"+card_class+"'>"+newcard+"</span>");
			//make it a button for human players
		}
		this.playCard = function( target ) {
			//( target_state is_in states[this.location].borders )
			//	change location
			//swap card
		}
	}
		
	players.push( new Player("Morris", true) );
	players.push( new Player("You", false) );
	players.push( new Player("Priscilla", true) );
	pt.hide();

	$('#turn_number').html(turn);
	//draw cards
	for (p = 0; p < players.length; p++) {
		players[p].location = randomState();
		$('#'+players[p].name+' .location').append(players[p].location);
		for (var i=0; i<6; i++) {
			players[p].addCard(randomState());
		}
	}
	
	$('.cardbtn').click(  function(event) { 
		console.log($(event.target).closest('.player-info').attr('id') + " " + event.target.innerHTML) ;
		players[1].playCard(event.target.innerHTML);
	} );
	
	// listener for all card buttons
	//move, move, move
	/***
	get targetState
	is player.location adjacent to targetState?  
	if (states[player.location].borders includes targetState)
	player.location = targetState
	***/

	//check victory conditions


	//end the game, restart if requested
});
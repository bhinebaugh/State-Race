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
		if (Math.random() < 1/++i) x = s;
	}
	return x
}
$(document).ready( function() {
	//set up the game
	pt = $('#player-template');
	newCardsButton = "<p class='allcardsbtn'>Draw New Cards</p>";
	turn = 0;
	players = [];
	
	/*** the Player object ***/
	function Player( name, nonhuman, pawnid ) {
		this.playerdiv = pt.clone();
		this.playerdiv.attr('id', name);
		$('#players').append(this.playerdiv);
		this.name = name;
		this.nameDiv = this.playerdiv.find('.name')[0];
		$(this.nameDiv).html(name);
		$(this.playerDiv).append(newCardsButton);
		//p_temp.find('.name').each( function() { this.update('shmoo') });
		//$('#'+name+' .name').html(this.name);
		this.automated = nonhuman;
		if( !this.automated ) {
			this.playerdiv.append(newCardsButton)
			$(this.playerdiv).addClass('human');
		}
		this.icon = $(pawnid);
		this.location;
		this.objective;
		this.points = 0;
		this.setLocation = function( newLocation ) {
			this.location = newLocation;
			this.playerdiv.find('.location')[0].innerHTML = this.location;
			this.icon.css({
				'left': states[this.location].location[0],
				'top': states[this.location].location[1],
				'position': 'absolute'
			});
		}
		this.hand = new Array();
		this.redrawHand = function() {
			var handspan = '';
			for( var i =0; i<this.hand.length; i++ ) {
				handspan += "<span class='cardbtn'>"+this.hand[i]+"</span>";
			}
			$(this.playerdiv).find('.cards').html(handspan);
		}
		this.addCard = function( newcard ) {
			this.hand.push(newcard);
		}
		this.dealHand = function( cardsNeeded ) {
			for (var i=0; i<=cardsNeeded; i++) {
				this.addCard(randomState());
			}
			this.redrawHand();
		}
		this.switchAllCards = function() {
			var numberOfCards = this.hand.length;
			this.hand = [];
			$(this.playerdiv).find('.cards').empty();
			this.dealHand(numberOfCards-1);
			this.redrawHand();
		}
		this.playCard = function( target ) {
			if ( states[this.location].borders.indexOf(target) < 0 ) {
				console.log(target + " is not a adjacent to " + this.location) 
			} else {
				console.log("traveling to "+target);
				this.setLocation( target );
				this.hand.splice( this.hand.indexOf(target), 1 );
				this.addCard( randomState() );
				this.redrawHand();
			}
		}
	}
		
	players.push( new Player("Morris", true, '#token1') );
	players.push( new Player("You", false, '#token2') );
	players.push( new Player("Priscilla", true, '#token3') );
	pt.hide();

	$('#turn_number').html(turn);
	//draw cards
	for (p = 0; p < players.length; p++) {
		players[p].setLocation( randomState() );
		players[p].dealHand(6);
	}
	
	$('#You .cards').click(  function(event) {
		players[1].playCard(event.target.innerHTML);
	} );
	$('.allcardsbtn').click( function() {
		players[1].switchAllCards();
	});
	

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
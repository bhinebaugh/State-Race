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

var animate = function() {
	$("#instructions").animate({
		opacity: 0.9,
		height: 'toggle'
		}, 500, function() {
		// Animation complete.
	});
};

$(document).ready( function() {
	$("#instructions #done").bind("click", function(){
		$("#help").show();
		animate();
	});
	$("#help").bind("click", function(){
		$(this).hide();
		animate();
	});
	

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

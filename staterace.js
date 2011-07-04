/*******
June 2011
Objective:
Progress:
	implement basic game rules
********/

function Player( name ) {
	this.name = name;
	this.location;
	this.objective;
	this.points = 0;
}

function State() {
	name,
	coordinates,
	neighbors
}

states = {
	"AL" : {"name": "Alabama", "borders":[], "color":"green"},
	"WA" : {"name": "Washington", "borders":['OR','ID'], "color":"green"},
	"OR" : {"name": "Oregon", "borders":['WA','ID','CA','NV'], "color":"green"},
	"CA" : {"name": "California", "borders":['OR','NV','AZ'], "color":"green"}
}
//Cards	array?

//set up the game
players = [];
players.push( new Player( "Morris" ) );

//move, move, move
/***
get targetStae
is player.location adjacent to targetState?  
if (states[player.location].borders includes targetState)
player.location = targetState
***/

//check victory conditions


//end the game, restart if requested
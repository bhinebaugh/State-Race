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
	"FL" : new State("FL","Florida",['GA','AL'],[780,525])
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

function randomState() {
	var x;
	var i=0;
	for (var s in stateObjects) {
    	++i;
		if (Math.random() < 1/i) x = s;
	}
	return x
}

/*
 *  # State Race #
 *  Kent Hinebaugh, Jason Hinebaugh, Brian Glusman
 *  MIT license or something?
*/

window.App = Ember.Application.create();


App.Router = Ember.Router.extend({
    enableLogging: true,
    root: Ember.Route.extend({
        index: Ember.Route.extend({
            route: '/',
            connectOutlets: function (router, context) {
                router.get('applicationController').connectOutlet('board', 'nation', App.nation);
                router.get('applicationController').connectOutlet('deck', 'hand', App.drawPile);
                router.get('applicationController').connectOutlet('players', 'players', App.players);
            }
        })
    })
});


/*
 *  ## Models ##
 *  
 *  The goal here is to use as few models as possible and only to model
 *  real data. This is in contrast to the our Backbone implementation,
 *  which included a model, view, and controller specifically for each
 *  data type. So if a dataset only really exists at the controller layer, 
 *  we avoid creating an unused model behind it.
 *
 *  ### Nation Model ###
*/
App.Nation = Ember.Object.extend({
/*
 *  Using init creates a states attribute that is unique to each instance.
 *  The nation is a thin wrapper around a collection of states. When
 *  instantiated, it gains a name and a set of bounds, defining the latitude
 *  and longitude limits of the map (used for creating the initial map view).
*/
    name: null,
    bounds: null,
    init: function () {
        this.set('states', this.states.map(function (data) {
            return App.State.create(data);
        }));
    }
});

//  ### State Model ###

App.State = Ember.Object.extend();

/*
 *  ### Player Model ###
 *  
 *  The player has a name and a hand of cards, which starts as an empty Array.
 *  A player's location indicates where they currently are on the map. Their 
 *  target is where they need to go in order to win the game. Any call to create
 *  a new player object should set the player name, at minimum. If the player
 *  is computer controlled, human should be set false at instantiation.
*/
App.Player = Ember.Object.extend({
    human: true,
    name: 'Player',
    location: null,
    target: null,
/*
 *  The cards property must be created in the init function to avoid all players
 *  sharing a reference to one single "Class-level" array of cards.
*/
    init: function () {
        this.set('cards', []);
    },
    draw: function (cards) {
        if (!cards.length) {
            cards = [cards];
        }
        this.get('cards').pushObjects(cards);
    }
});

/*  
 *  ## Controllers ##  
 *
 *  This implementation puts a lot of emphasis on the controllers. Most gameplay
 *  logic belongs here, and so constructs like hands and decks are only defined in 
 *  the controller layer.
 *
 *  ### Application Controller ###
*/
App.ApplicationController = Ember.ArrayController.extend();

//  ### Nation Controller ###

App.NationController = Ember.ObjectController.extend({
    //  Returns a string in the form of "N State(s)"
    length: function () {
        var length, plural;
        length = this.get('content.states.length');
        plural = (1 === length) ? 'State' : 'States';
        return [length, plural].join(' ');
    }.property('content.states')
});

//  ### Players Controller ###

App.PlayersController = Ember.ArrayController.extend({
    draw: function (e, num) {
        var card, name, player;
        num = num || 1;
        card = App.drawPile.deal(num);
        name = e.view.get('content.name');
        player = this.findProperty('name', name);
        player.draw(card);
    },
});

//  ### Hand Controller

App.HandController = Ember.ArrayController.extend({
    isFaceUp: true,
    isCollapsed: true,
    deal: function (num) {
        var dealt = [];
        while (dealt.length < num) {
            dealt.pushObjects(this.popObject());
        }
        return dealt;
    },
    shuffle: function () {
        var deck = this.copy();
        deck.forEach(function (item) {
            var i = Math.floor(Math.random() * deck.length);
            while (this[i]) {
                i += 1;
                if (i > deck.length - 1) {
                    i = 0;
                }
            }
            this[i] = item;
        });
        return this;
    }
});


//  ## Views ##

//  ### Application View ###
App.ApplicationView = Ember.View.extend({
    templateName: 'application',
    classNames: ['container-fluid']
});

//  ### Hand View ###
App.HandView = Ember.CollectionView.extend({
    classNames: ['hand'],
    classNameBindings: ['isFaceUp:is-face-up', 'isCollapsed:is-collapsed'],
    contentBinding: 'controller.content',
    tagName: 'ul',
    itemViewClass: Ember.View.extend({
        templateName: 'card',
        classNames: ['card']
    })
});

//  ### Deck View ###
App.DeckView = App.HandView.extend({
    templateName: 'deck',
    classNames: ['deck']
});

//  ### Players View ###
App.PlayersView = Ember.CollectionView.extend({
    tagName: 'ul',
    classNames: ['players', 'row-fluid'],
    contentBinding: 'controller.content',
    itemViewClass: Ember.View.extend({
        templateName: 'player',
        classNames: ['player', 'span3'],
        handView: App.HandView.extend(),
        drawClick: function (e) {
            this.get('content').draw(1, App.drawPile);
        }
    })
});

//  ### Nation View ###
App.NationView = Ember.View.extend({
    templateName: 'map',
    classNames: ['board'],
    stateCollectionView: Ember.CollectionView.extend({
        contentBinding: 'controller.states',
        classNames: ['nation-map'],
        didInsertElement: function () {
            var $_this, height, width, proportion;
            $_this = this.$();
            height = this.get('controller.bounds.north') - this.get('controller.bounds.south');
            width = this.get('controller.bounds.east') - this.get('controller.bounds.west');
            proportion = Math.abs(height / width);
            this._super();
            function handleResize() {
                $_this.height(proportion * $_this.width());        
            }
            handleResize();
            $(window).on('resize', handleResize);
        },
        itemViewClass: Ember.View.extend({
            tagName: 'abbr',
            template: Ember.Handlebars.compile('{{view.content.id}}'),
            classNames: ['state-map'],
            attributeBindings: ['style', 'title'],
            style: function () {
                var nationHeight, nationWidth, top, left;
                nationHeight = Math.abs(this.get('controller.bounds.north') - this.get('controller.bounds.south'));
                nationWidth = Math.abs(this.get('controller.bounds.west') - this.get('controller.bounds.east'));
                top = 100 * (this.get('controller.bounds.north') - this.get('content.latitude')) / nationHeight;
                left = 100 * (this.get('content.longitude') - this.get('controller.bounds.west')) / nationWidth;
                return 'left: ' + left + '%;' + 'top: ' + top + '%;';
            }.property('content.latitude', 'content.longitude'),
            title: function () {
                return this.get('content.capital')  + ', ' + this.get('content.name');
            }.property('content.capital')
        })
    })
});


//  ## Initialization and Bootstrapping ##
App.nation = App.Nation.create({
    name: 'United States of America',
    states: StateDefaults,
    bounds: {
        east: -64.546386,
        north: 48.922499,
        south: 22.024546,
        west: -125.433105
    }
});

App.players = [
    App.Player.create({name: 'Dave'}),
    App.Player.create({name: 'Pat'}),
    App.Player.create({name: 'Nate'}),
    App.Player.create({name: 'Will'})
];

App.discardPile = App.HandController.create();
App.drawPile = App.HandController.create({
    content: App.nation.get('states')
});
App.drawPile.shuffle();
App.players.forEach(function (player) {
    var cards, num = 5;
    cards = App.drawPile.deal(num);
    player.draw(cards);
})

App.initialize();
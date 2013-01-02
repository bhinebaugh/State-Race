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
                router.get('applicationController').connectOutlet('players', 'players', App.players);
            }
        })
    })
});

/*
 *  NOTE: The problem with doing it this way is that the templates are dumb about attaching an appropriate
 *  controller when using {{view App.StateView}}, so you end up with an {{#each}} that passes the correct
 *  model data, but stays in the context of the original controller. The model data is accessible because
 *  the NationController (specifically the instance App.router.nationController) has access to the model
 *  instance App.nation, and it can travel down the chain to App.nation.states for the each loop and pass
 *  a reference to that state on to the App.StateView. It stays in the context of the original controller
 *  (App.router.nationController) so when we get to the state view, variables like {{id}} work because the
 *  nation controller passes through to the model to find the value. If, however, we try to do something in 
 *  the controller to make, say, {{latitude}} more useful, we want to use {{controller.latitude}} in the 
 *  template, which refers only to the nation controller because no state controller has been created yet. 
 *  So either the nation controller awkwardly handles the latitude (and I'm not even sure if you could 
 *  indicate the correct State instance at that point), or the view has to manipulate model data, the 
 *  avoidance of which is the whole point of using MVC and creating a StateController class.
 *
 *  TLDR: Use outlets instead of nested {{view}}s.
 */


/*  ## Models ##  */

App.Nation = Ember.Object.extend({
    init: function () {
        this.set('states', this.states.map(function (data) {
            return App.State.create(data);
        }));
    }
});

App.State = Ember.Object.extend();

App.Card = Ember.Object.extend();;

App.Hand = Ember.Object.extend({
    init: function () {
        this.set('cards', Ember.A());
    }
});

App.Deck = App.Hand.extend({
    init: function () {
        this.set('cards', this.nation.states.map(function (state) {
            return App.Card.create({state: state});
        }));
    }
});

App.Player = Ember.Object.extend({
    init: function () {
        this.set('hand', App.Hand.create());
    }
});


/*  ## Views ##  */

App.ApplicationView = Ember.View.extend({
    templateName: 'application'
});


App.NationView = Ember.View.extend({
    templateName: 'map',
    classNames: ['nation-map']
});

App.StateView = Ember.View.extend({
    templateName: 'state',
    classNames: ['state-map']
});

App.HandView = Ember.View.extend({
    templateName: 'hand'
});

App.CardView = Ember.View.extend({
    templateName: 'card',
    classNames: ['card']
});

App.PlayersView = Ember.View.extend({
    templateName: 'players',
    classNames: ['players', 'row-fluid']
});

App.PlayerView = Ember.View.extend({
    templateName: 'player',
    classNames: ['player', 'span3']
});


/*  # Controllers #  */

App.ApplicationController = Ember.Controller.extend();

App.NationController = Ember.ObjectController.extend({
    foo: 'bap'
});

App.StateController = Ember.ObjectController.extend({
    foo: 'bar',
    latitude: function () {
        return Math.floor(this.get('content.latitude'));
    }.property('content.latitude')
});

App.CardController = Ember.ObjectController.extend();

App.HandController = Ember.ArrayController.extend();

App.PlayersController = Ember.ArrayController.extend();

App.PlayerController = Ember.ObjectController.extend();


/*  ## Instantiation and Kickoff ##  */

App.nation = App.Nation.create({
    name: 'United States of America',
    states: StateDefaults
});

App.deck = App.Deck.create({
    nation: App.nation
});

App.players = Ember.A([
    App.Player.create({name: 'Adam'}),
    App.Player.create({name: 'Ben'}),
    App.Player.create({name: 'Charlie'}),
    App.Player.create({name: 'David'})
]);

App.initialize();
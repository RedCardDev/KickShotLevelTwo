game.module(
    'game.main'
).require(
    'engine.scene',

    'game.assets',
    'game.dice'
)
.body(function() {

game.HUMAN = true;
game.AI = false;
game.HumanScore = 0;
game.AiScore = 0;

game.createScene('Main', {
    backgroundColor: 0xb9bec7,
    title: null,

    playButton: null,
    webButton: null,

    init: function() {
        this.title = new game.Sprite('title').addTo(this.stage);
        this.title.x = game.system.width / 2 - this.title.width / 2 + 10;
        this.title.y = -game.system.height / 4;

        this.playButton = new game.Sprite('play').addTo(this.stage);
        this.playButton.anchor.set(0.5, 0.5);
        this.playButton.x = -200;
        this.playButton.y = game.system.height / 2 + 350;
        this.playButton.interactive = true;
        this.playButton.click = this.playClick.bind(this);

        this.webButton = new game.Sprite('web').addTo(this.stage);
        this.webButton.anchor.set(0.5, 0.5);
        this.webButton.x = game.system.width + 200;
        this.webButton.y = game.system.height / 2 + 350;
        this.webButton.interactive = true;
        this.webButton.click = this.webClick.bind(this);

        this.addTween(this.title, {y: 80}, 800, {delay: 100, easing: game.Tween.Easing.Back.Out}).start();
        this.addTween(this.playButton, {x: game.system.width/2 - 150}, 800, {delay: 300, easing: game.Tween.Easing.Quadratic.Out}).start();
        this.addTween(this.webButton, {x: game.system.width/2 + 150}, 800, {delay: 300, easing: game.Tween.Easing.Quadratic.Out}).start();
    },

    playClick: function() {
        this.addTween(this.title, {y: -this.title.height}, 400, {delay: 50, easing: game.Tween.Easing.Back.In}).start();
        this.addTween(this.playButton, {x: -200}, 400,
            {delay: 250, easing: game.Tween.Easing.Back.In,
             onComplete: function() {
                 game.system.setScene('Game');
             }}).start();
        this.addTween(this.webButton, {x: game.system.width + 200}, 400, {delay: 250, easing: game.Tween.Easing.Back.In}).start();
    },

    webClick: function() {
        // TODO: use CocoonJS extension Cocoon.App.openURL("target_url")
    }
});

game.createScene('Game', {
    backgroundColor: 0xb9bec7,

    dice: null,

    canTap: false,
    turn: game.HUMAN,
    possession: game.HUMAN,

    chip: null,
    chipZone: 0,

    init: function() {
        var self = this;
        var field = new game.Sprite('field').addTo(this.stage);
        field.x = 0;
        field.y = -field.height;
        this.addTween(field, {y: 0}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        this.chip = new game.Sprite('chip-home').addTo(this.stage);
        this.chip.scale.x = this.chip.scale.y = 0.7;
        this.chip.anchor.set(0.5, 0.5);
        this.chip.center();
        this.chip.y = -field.height/2;
        this.addTween(this.chip, {y: game.system.height / 2}, 600,
            {delay: 400, easing: game.Tween.Easing.Quadratic.Out,
             onComplete: function() {
                 self.dice = new game.Dice();
                 self.addObject(self.dice);
                 self.showDice();
             }
            }).start();

        game.HumanScore = 0;
        game.AiScore = 0;
    },

    enableInput: function() {
        this.canTap = true;
    },

    disableInput: function() {
        this.canTap = false;
    },

    mouseup: function() {
        if (!this.canTap) { return; }

        if (this.turn == game.HUMAN) {
            this.rollDice();
        }
    },

    hideDice: function() {
        this.disableInput();
        this.dice.hide();
    },

    showDice: function() {
        this.disableInput();
        this.dice.show();

        var self = this;
        if (this.turn == game.HUMAN) {
            this.addTimer(500, function() {
                self.enableInput();
            });
        }

        if (this.turn == game.AI) {
            this.addTimer(1000, function() {
                self.rollDice();
            });
        }
    },

    changeActivePlayer: function() {
        if (this.turn === game.HUMAN) {
            this.turn = game.AI;
            this.dice.setAiPosition();
        } else {
            this.turn = game.HUMAN;
            this.dice.setPlayerPosition();
        }
        this.showDice();
    },

    rollDice: function() {
        this.disableInput();

        var self = this;
        this.dice.roll();
        // roll the dice for a second
        this.addTimer(1000, function() {
            self.dice.stopRoll();
            // brief pause before action is taken
            self.addTimer(250, function() {
                if (self.dice.value1 === self.dice.value2) {
                    // doubles? turn over
                    if (self.chipZone == 12 || self.chipZone == -12) {
                        self.blockGoal();
                    } else {
                        self.changePossession();
                    }
                } else if (self.turn === self.possession) {
                    if (self.chipZone == 12 || self.chipZone == -12) {
                        self.scoreGoal();
                    } else {
                        self.advanceToken();
                    }
                } else {
                    if (self.chipZone == 12 || self.chipZone == -12) {
                        self.scoreGoal();
                    } else {
                        self.endTurn();
                    }
                }
            });
        });
    },

    changePossession: function() {
        var self = this;
        // TODO: show interception message here

        this.possession = !this.possession;
        this.chip.setTexture(this.possession == game.HUMAN ? 'chip-home' : 'chip-away');
        this.endTurn();
    },

    blockGoal: function() {
        var self = this;
        // TODO: show goal block message here

        this.possession = !this.possession;
        this.chip.setTexture(this.possession == game.HUMAN ? 'chip-home' : 'chip-away');

        // same player rolls again on block
        this.addTimer(500, function() {
            if (self.turn == game.HUMAN) {
                self.enableInput();
            } else {
                self.rollDice();
            }
        });
    },

    advanceToken: function() {
        var self = this;
        var move = Math.max(this.dice.value1, this.dice.value2);

        // AI territory < 0, Human territory > 0

        this.chipZone += (this.possession == game.HUMAN) ? -move : move;
        if (this.chipZone > 12) { this.chipZone = 12; }
        if (this.chipZone < -12) { this.chipZone = -12; }

        var newpos = game.system.height * 0.5;
        if (this.chipZone > 0) {
            newpos += 28 + (this.chipZone - 1) * 38.5;
        } else if (this.chipZone < 0) {
            newpos += -28 + (this.chipZone + 1) * 38.5;
        }

        this.addTween(this.chip, {y: newpos}, 500, {
            easing: game.Tween.Easing.Quadratic.InOut,
            onComplete: function() {
                if (self.chipZone == 12 || self.chipZone == -12) {
                    self.goalShot();
                } else {
                    self.endTurn();
                }
            }
        }).start();
    },

    goalShot: function() {
        // TODO: show goal shot message here

        this.endTurn();
    },

    endTurn: function() {
        var self = this;
        this.addTimer(1000, function() {
            self.hideDice();
            self.addTimer(1000, function() {
                self.changeActivePlayer();
            });
        });
    },

    scoreGoal: function() {
        var self = this;
        // TODO: show goal score message here

        var kickOffPlayer = false;
        if (this.chipZone == 12) {
            game.AiScore += 1;
            kickOffPlayer = game.HUMAN;
        }
        if (this.chipZone == -12) {
            game.HumanScore += 1;
            kickOffPlayer = game.AI;
        }

        this.hideDice();
        this.addTimer(1000, function() {
            self.chipZone = 0;
            self.chip.y = game.system.height * 0.5;
            self.turn = kickOffPlayer;
            if (kickOffPlayer == game.HUMAN) {
                self.dice.setPlayerPosition();
                self.possession = game.HUMAN;
                self.chip.setTexture('chip-home');
            } else {
                self.dice.setAiPosition();
                self.possession = game.AI;
                self.chip.setTexture('chip-away');
            }
            self.showDice();
        });
    }
});

});

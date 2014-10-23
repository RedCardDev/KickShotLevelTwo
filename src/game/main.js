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

    init: function() {
        this.title = new game.Sprite('title').addTo(this.stage);
        this.title.x = game.system.width / 2 - this.title.width / 2 + 10;
        this.title.y = -this.title.height;

        this.addTween(this.title, {y: 130}, 800, {delay: 100, easing: game.Tween.Easing.Back.Out}).start();
    },

    mouseup: function() {
        var self = this;
        this.addTween(this.title, {y: -this.title.height}, 400,
            {   delay: 50,
                easing: game.Tween.Easing.Back.In,
                onComplete: function() {
                    game.system.setScene('Game');
                }
            }).start();
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
                    self.changePossession();
                } else if (self.turn === self.possession) {
                    self.advanceToken();
                } else {
                    self.endTurn();
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

    advanceToken: function() {
        var self = this;
        var move = Math.max(this.dice.value1, this.dice.value2);

        this.chipZone += (this.possession == game.HUMAN) ? -move : move;
        if (this.chipZone > 12) { this.chipZone = 12; }
        if (this.chipZone < -12) { this.chipZone = -12; }

        var newpos = game.system.height * 0.5;
        if (this.chipZone > 0) {
            newpos += 8 + this.chipZone * 38.5;
        } else if (this.chipZone < 0) {
            newpos += -8 + this.chipZone * 38.5;
        }

        if (this.chipZone == 12 || this.chipZone == -12) {
            this.scoreGoal();
        } else {
            this.addTween(this.chip, {y: newpos}, 500, {
                easing: game.Tween.Easing.Quadratic.InOut,
                onComplete: function() {
                    if (self.chipZone == 1 || self.chipZone == -12) {
                        self.scoreGoal();
                    }
                    self.endTurn();
                }
            }).start();
        }
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
            // ai score
            game.AiScore += 1;
            kickOffPlayer = game.HUMAN;
        }
        if (this.chipZone == -12) {
            game.HumanScore += 1;
            kickOffPlayer = game.AI;
        }
        this.chipZone = 0;
        this.chip.y = game.system.height * 0.5;

        this.hideDice();
        this.addTimer(1000, function() {
            self.turn = kickOffPlayer;
            if (kickOffPlayer == game.Human) {
                self.setPlayerPosition();
                self.possession = game.HUMAN;
                self.chip.setTexture('chip-home');
            } else {
                self.setAiPosition();
                self.possession = game.AI;
                self.chip.setTexture('chip-away');
            }
            self.showDice();
        });
    }
});

});

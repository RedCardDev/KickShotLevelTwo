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
        this.playButton.click = this.playButton.tap = this.playClick.bind(this);

        this.webButton = new game.Sprite('web').addTo(this.stage);
        this.webButton.anchor.set(0.5, 0.5);
        this.webButton.x = game.system.width + 200;
        this.webButton.y = game.system.height / 2 + 350;
        this.webButton.interactive = true;
        this.webButton.click = this.webButton.tap = this.webClick.bind(this);

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
    message: null,
    aiScoreText: null,
    humanScoreText: null,

    canTap: false,
    inMessage: false,
    afterMessage: null,

    turn: game.HUMAN,
    possession: game.HUMAN,

    chip: null,
    chipZone: 0,

    init: function() {
        var self = this;
        field = new game.Sprite('field').addTo(this.stage);
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
                 self.addObject(self.dice);
                 self.showDice();
             }
            }).start();

        this.dice = new game.Dice();

        this.aiScoreText = new game.BitmapText('AI: 0', { font: 'Foo' }).addTo(this.stage);
        this.aiScoreText.position.set(500, -game.system.height + 40);
        this.humanScoreText = new game.BitmapText('YOU: 0', { font: 'Foo' }).addTo(this.stage);
        this.humanScoreText.position.set(465, -110);
        this.addTween(this.aiScoreText, {y: 40}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();
        this.addTween(this.humanScoreText, {y: 850}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();

        this.message = new game.Sprite('Intercept_home').addTo(this.stage);
        this.message.anchor.set(0.5, 0.5);
        this.message.center();
        this.message.y = -game.system.height / 2;
        this.afterMessage = this.hideMessage.bind(this);

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

        if (this.inMessage) {
            this.hideMessage(this.afterMessage);
            return;
        }

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
                    if ((self.chipZone == 12 || self.chipZone == -12) &&
                        self.possession != self.turn) {
                        self.blockGoal();
                    } else {
                        self.changePossession();
                    }
                } else if (self.turn === self.possession) {
                    if ((self.chipZone == 12  && self.possession == game.AI) ||
                        (self.chipZone == -12 && self.possession == game.HUMAN)) {
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
        this.showMessage('Intercept', function() {
            self.possession = !self.possession;
            self.chip.setTexture(self.possession == game.HUMAN ? 'chip-home' : 'chip-away');
            self.endTurn();
        });
    },

    blockGoal: function() {
        var self = this;
        this.showMessage('GoalBlock', function() {
            self.possession = !self.possession;
            self.chip.setTexture(self.possession == game.HUMAN ? 'chip-home' : 'chip-away');

            // same player rolls again on block
            self.addTimer(500, function() {
                if (self.turn == game.HUMAN) {
                    self.enableInput();
                } else {
                    self.rollDice();
                }
            });
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
        this.showMessage('GoalShot', this.endTurn.bind(this));
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

        this.showMessage('Goal', function() {
            if (game.AiScore == 5 || game.HumanScore == 5) {
                self.showMessage('End', self.gameOver.bind(self));
                return;
            }

            var kickOffPlayer = false;
            if (self.chipZone == 12) {
                game.AiScore += 1;
                kickOffPlayer = game.HUMAN;
            }
            if (self.chipZone == -12) {
                game.HumanScore += 1;
                kickOffPlayer = game.AI;
            }
            self.updateScore();

            self.hideDice();
            self.addTimer(1000, function() {
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
        });
    },

    showMessage: function(msgType, after) {
        var self = this;
        this.afterMessage = after;
        this.message.setTexture(msgType + (this.possession ? "_home" : "_away"));

        this.addTween(this.message, {y: game.system.height/2}, 500, {
            easing: game.Tween.Easing.Back.Out,
            onComplete: function() {
                self.enableInput();
                self.inMessage = true;
            }
        }).start();
    },

    hideMessage: function(after) {
        this.disableInput();
        this.inMessage = false;
        this.addTween(this.message, {y: -game.system.height/2}, 500, {
            easing: game.Tween.Easing.Back.In,
            onComplete: after
        }).start();
    },

    gameOver: function() {
        var self = this;
        this.hideDice();
        this.addTimer(1000, function() {
            self.chipZone = 0;
            self.chip.y = game.system.height * 0.5;
            self.turn = game.HUMAN;
            self.dice.setPlayerPosition();
            self.possession = game.HUMAN;
            self.chip.setTexture('chip-home');
            game.HumanScore = 0;
            game.AiScore = 0;
            self.updateScore();
        });
    },

    updateScore: function() {
        this.humanScoreText.setText('You: ' + game.HumanScore);
        this.aiScoreText.setText('AI: ' + game.AiScore);
    }
});

});

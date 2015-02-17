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
game.MaxScore = 5;

// Rob was here
game.createScene('Main', {
    backgroundColor: 0x629dc5,
    title: null,

    playButton: null,
    webButton: null,

    characters: ['racoon','hare','jaguar','weasel','lion','dog','crocodile'],
    cycle: null,
    charSprite: null,
    charIndex: 0,

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

        this.cycle = this.characters.shuffle();
        this.nextCharacter();
    },

    playClick: function() {
        // stop character tween
        game.tweenEngine.stopTweensForObject(this.charSprite);
        this.addTween(this.charSprite, {x: -200}, 400, {delay: 50, easing: game.Tween.Easing.Back.In}).start();

        this.addTween(this.title, {y: -this.title.height}, 400, {delay: 50, easing: game.Tween.Easing.Back.In}).start();
        this.addTween(this.playButton, {x: -200}, 400,
            {delay: 250, easing: game.Tween.Easing.Back.In,
             onComplete: function() {
                 game.system.setScene('Game');
             }}).start();
        this.addTween(this.webButton, {x: game.system.width + 200}, 400, {delay: 250, easing: game.Tween.Easing.Back.In}).start();
    },

    webClick: function() {
        Cocoon.App.openURL("http://www.kickshot.org");
    },

    nextCharacter: function() {
        if (this.charSprite == null) {
            this.charSprite = new game.Sprite(this.cycle[this.charIndex]).addTo(this.stage);
            this.charSprite.anchor.set(0.5, 0.5);
            this.charSprite.center();
            this.charSprite.x = -200;
            this.charSprite.scale.set(1.75, 1.75);
        } else {
            this.charSprite.x = -200;
            this.charIndex += 1;
            if (this.charIndex >= this.cycle.length) {
                this.cycle = this.characters.shuffle();
                this.charIndex = 0;
            }
            this.charSprite.setTexture(this.cycle[this.charIndex]);
        }

        var self = this;
        this.addTween(this.charSprite, {x: game.system.width / 2}, 600,
            {delay:50, easing: game.Tween.Easing.Back.Out, onComplete: function() {
                self.addTween(self.charSprite, {x: 800}, 600,
                    {delay:2050, easing: game.Tween.Easing.Back.In, onComplete: self.nextCharacter.bind(self)}).start();
            }}).start();
    }
});

game.createScene('Game', {
    backgroundColor: 0x629dc5,

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

    helpButton: null,
    rules: null,
    backButton: null,

    init: function() {
        var self = this;
        this.field = new game.Sprite('field').addTo(this.stage);
        this.field.x = 0;
        this.field.y = -this.field.height;
        this.field.interactive = true;
        this.field.click = this.field.tap = this.fieldClick.bind(this);
        this.addTween(this.field, {y: 0}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        this.chip = new game.Sprite('chip-home').addTo(this.stage);
        this.chip.scale.x = this.chip.scale.y = 0.7;
        this.chip.anchor.set(0.5, 0.5);
        this.chip.center();
        this.chip.y = -game.system.height + 516;//-this.field.height/2;
        this.addTween(this.chip, {y: 516}, 600,
            {delay: 400, easing: game.Tween.Easing.Quadratic.Out,
             onComplete: function() {
                 self.addObject(self.dice);
                 self.showDice();
             }
            }).start();

        this.dice = new game.Dice();

        this.aiScoreText = new game.BitmapText('AI: 0', { font: 'Foo' }).addTo(this.stage);
        this.aiScoreText.position.set(500, -game.system.height + 110);
        this.humanScoreText = new game.BitmapText('YOU: 0', { font: 'Foo' }).addTo(this.stage);
        this.humanScoreText.position.set(465, -110);
        this.addTween(this.aiScoreText, {y: 110}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();
        this.addTween(this.humanScoreText, {y: 850}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();

        this.helpButton = new game.Sprite('help').addTo(this.stage);
        this.helpButton.anchor.set(0.5, 0.5);
        this.helpButton.scale.set(0.5, 0.5);
        this.helpButton.x = 50;
        this.helpButton.y = -960 + 150;
        this.helpButton.interactive = true;
        this.helpButton.click = this.helpButton.tap = this.helpClick.bind(this);
        this.addTween(this.helpButton, {y: 150}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        this.backButton = new game.Sprite('close').addTo(this.stage);
        this.backButton.anchor.set(0.5, 0.5);
        this.backButton.scale.set(0.5, 0.5);
        this.backButton.x = 50;
        this.backButton.y = -960 + 225;
        this.backButton.interactive = true;
        this.backButton.click = this.backButton.tap = this.backClick.bind(this);
        this.addTween(this.backButton, {y: 225}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        this.rules = new game.Sprite('rules').addTo(this.stage);
        this.rules.x = -640;
        this.rules.y = 0;

        this.hideRules = new game.Sprite('close').addTo(this.stage);
        this.hideRules.anchor.set(0.5, 0.5);
        this.hideRules.scale.set(0.5, 0.5);
        this.hideRules.x = -640 + 50;
        this.hideRules.y = 300;
        this.hideRules.interactive = true;
        this.hideRules.click = this.hideRules.tap = this.hideRulesClick.bind(this);

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

    helpClick: function() {
        this.addTween(this.rules, {x: 0}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();
        this.addTween(this.hideRules, {x: 50}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();
        this.helpButton.interactive = false;
        this.field.interactive = false;
        this.backButton.interactive = true;
    },

    backClick: function() {
        game.system.setScene('Main');
    },

    hideRulesClick: function() {
        var self = this;
        this.addTween(this.rules, {x: -640}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out,
            onComplete: function() {
                self.backButton.interactive = true;
                self.helpButton.interactive = true;
                self.field.interactive = true;
            }}).start();
        this.addTween(this.hideRules, {x: -640+50}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();
    },

    fieldClick: function() {
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
	// NEW rollDice function 
	rollDice: function(player,numDice) {
        this.disableInput();

        var self = this;
        this.dice.roll();
        // roll the dice for a second
        this.addTimer(1000, function() {
            self.dice.stopRoll();
            // brief pause before action is taken
			console.log("Hello??");
			suspend1(3000);
            
        });
    },
	
	suspend1: function(millisec){
		this.pause();
		console.log("milliseconds till wakeup: " + millisec);
		self.addTimer(millisec, function() {
			this.resume();
		});
	},
	// legacy function 
	/*
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
                    if ((self.chipZone == 11 || self.chipZone == -11) &&
                        self.possession != self.turn) {
                        self.blockGoal();
                    } else {
                        self.changePossession();
                    }
                } else if (self.turn === self.possession) {
                    if ((self.chipZone == 11  && self.possession == game.AI) ||
                        (self.chipZone == -11 && self.possession == game.HUMAN)) {
                        self.scoreGoal();
                    } else {
                        //self.advanceToken();
						self.moveBall(5);
                    }
                } else {
                    if (self.chipZone == 11 || self.chipZone == -11) {
                        self.scoreGoal();
                    } else {
                        self.endTurn();
                    }
                }
            });
        });
    },

	*/
    changePossession: function() { // This looks like what we want TurnOver() to be 
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
	moveBall: function( move) { // NEW MoveBall ~~
        var self = this;
        //var move = Math.max(this.dice.value1, this.dice.value2);// make this an argument 

        // AI territory < 0, Human territory > 0

        this.chipZone += (this.possession == game.HUMAN) ? -move : move;
        if (this.chipZone > 11) { this.chipZone = 11; }
        if (this.chipZone < -11) { this.chipZone = -11; }

        var newpos = 516;//game.system.height * 0.5;
        if (this.chipZone > 0) {
            newpos += 24 + (this.chipZone - 1) * 36; // what do the numbers mean?
        } else if (this.chipZone < 0) {
            newpos += -24 + (this.chipZone + 1) * 36;
        }

        this.addTween(this.chip, {y: newpos}, 500, {
            easing: game.Tween.Easing.Quadratic.InOut,
            onComplete: function() {
                if (self.chipZone == 11 || self.chipZone == -11) {
                    self.goalShot();
                } else {
                    self.endTurn();
                }
            }
        }).start();
    },
	// legacy move function 
    advanceToken: function() { // this looks like what we want MoveBall(number) to be 
        var self = this;
        var move = Math.max(this.dice.value1, this.dice.value2);// make this an argument 

        // AI territory < 0, Human territory > 0

        this.chipZone += (this.possession == game.HUMAN) ? -move : move;
        if (this.chipZone > 11) { this.chipZone = 11; }
        if (this.chipZone < -11) { this.chipZone = -11; }

        var newpos = 516;//game.system.height * 0.5;
        if (this.chipZone > 0) {
            newpos += 24 + (this.chipZone - 1) * 36; // what do the numbers mean?
        } else if (this.chipZone < 0) {
            newpos += -24 + (this.chipZone + 1) * 36;
        }

        this.addTween(this.chip, {y: newpos}, 500, {
            easing: game.Tween.Easing.Quadratic.InOut,
            onComplete: function() {
                if (self.chipZone == 11 || self.chipZone == -11) {
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

        if (self.chipZone == 11) {
            //game.audio.playSound('boo');
        } else {
            //game.audio.playSound('cheer');
        }

        this.showMessage('Goal', function() {
            var kickOffPlayer = false;
            if (self.chipZone == 11) {
                game.AiScore += 1;
                kickOffPlayer = game.HUMAN;
            }
            if (self.chipZone == -11) {
                game.HumanScore += 1;
                kickOffPlayer = game.AI;
            }
            self.updateScore();

            if (game.AiScore == game.MaxScore || game.HumanScore == game.MaxScore) {
                self.showMessage('End', self.gameOver.bind(self));
                return;
            }

            self.hideDice();
            self.addTimer(1000, function() {
                self.chipZone = 0;
                self.chip.y = 516;
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
            self.chip.y = 516;
            self.turn = game.HUMAN;
            self.dice.setPlayerPosition();
            self.possession = game.HUMAN;
            self.chip.setTexture('chip-home');
            game.HumanScore = 0;
            game.AiScore = 0;
            self.updateScore();
            self.showDice();
        });
    },

    updateScore: function() {
        this.humanScoreText.setText('You: ' + game.HumanScore);
        this.aiScoreText.setText('AI: ' + game.AiScore);
    }
});

});

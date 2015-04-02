game.module(
    'game.main'
).require(
    'engine.scene',

    'game.assets',
    'game.dice',
    'game.deck',
    'game.cardMenu'
)
.body(function() {

game.HUMAN = true;
game.AI = false;
game.HumanScore = 0;
game.AiScore = 0;
game.MaxScore = 5;
game.Doubles = 0;

/*** Title screen ***/
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

/*** Game ***/
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

    playerDeck: null,
    hand: [],

    chip: null,
    chipZone: 0,
	gamePhase: -1,
    kickoff: false,

    helpButton: null,
    rules: null,
    backButton: null,

    boardZone: [
        {zone: -11, ySpot: 60},
        {zone: -10, ySpot: 99},
        {zone: -9, ySpot: 139},
        {zone: -8, ySpot: 178},
        {zone: -7, ySpot: 218},
        {zone: -6, ySpot: 258},
        {zone: -5, ySpot: 298},
        {zone: -4, ySpot: 338},
        {zone: -3, ySpot: 378},
        {zone: -2, ySpot: 418},
        {zone: -1, ySpot: 456},
        {zone: 0,  ySpot: 480},
        {zone: 1,  ySpot: 507},
        {zone: 2,  ySpot: 546},
        {zone: 3,  ySpot: 584},
        {zone: 4,  ySpot: 622},
        {zone: 5,  ySpot: 660},
        {zone: 6,  ySpot: 699},
        {zone: 7,  ySpot: 737},
        {zone: 8,  ySpot: 776},
        {zone: 9,  ySpot: 815},
        {zone: 10, ySpot: 854},
        {zone: 11, ySpot: 895}],
    

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
        this.chip.y = -game.system.height * 0.5;//-this.field.height/2;
        this.addTween(this.chip, {y: game.system.height * 0.5}, 600,
            {delay: 400, easing: game.Tween.Easing.Quadratic.Out,
             onComplete: function() {
                 self.addObject(self.dice);
                 self.showDice();
             }
            }).start();

        this.dice = new game.Dice();

        this.cardMenu = new game.CardMenu();

        this.cardMenu.cards[0].sprite.click = this.clickCard0.bind(this);
        this.cardMenu.cards[1].sprite.click = this.clickCard1.bind(this);
        this.cardMenu.cards[2].sprite.click = this.clickCard2.bind(this);
        this.cardMenu.cards[3].sprite.click = this.clickCard3.bind(this);
        this.cardMenu.cards[4].sprite.click = this.clickCard4.bind(this);
        this.cardMenu.cards[5].sprite.click = this.clickCard5.bind(this);


        this.playerDeck = new game.Deck("home");
        //this.playerDeck.printDeck();

        this.drawCard();
        this.drawCard();
        this.drawCard();
        this.drawCard();
        this.drawCard();
        this.drawCard();

        this.cardMenu.updateCards(this.hand);




        this.aiScoreText = new game.BitmapText('AI: 0', { font: 'Foo' }).addTo(this.stage);
        this.aiScoreText.position.set(500, -game.system.height + 110);
        this.humanScoreText = new game.BitmapText('YOU: 0', { font: 'Foo' }).addTo(this.stage);
        this.humanScoreText.position.set(465, -110);
        this.addTween(this.aiScoreText, {y: 50}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();
        this.addTween(this.humanScoreText, {y: 850}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();

        this.helpButton = new game.Sprite('help').addTo(this.stage);
        this.helpButton.anchor.set(0.5, 0.5);
        this.helpButton.scale.set(0.5, 0.5);
        this.helpButton.x = 50;
        this.helpButton.y = -960 + 150;
        this.helpButton.interactive = true;
        this.helpButton.click = this.helpButton.tap = this.helpClick.bind(this);
        this.addTween(this.helpButton, {y: 90}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        this.backButton = new game.Sprite('close').addTo(this.stage);
        this.backButton.anchor.set(0.5, 0.5);
        this.backButton.scale.set(0.5, 0.5);
        this.backButton.x = 50;
        this.backButton.y = -960 + 225;
        this.backButton.interactive = true;
        this.backButton.click = this.backButton.tap = this.backClick.bind(this);
        this.addTween(this.backButton, {y: 165}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

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
		
		this.gamePhase = 0;
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

    humanTurn: function() {
        console.log("start human turn");
        // Kickoff from center line
        if(this.kickoff)
        {
            // Todo: enable input here
            this.gamePhase = 2;
            return;
        }
        // Non kickoff
        else
        {
            // todo: enable input here
            // Let player select a card
            this.gamePhase = 3;
            return;
        }
    },

    aiTurn: function() {
        console.log("start ai turn");

    },

    fieldClick: function() {
	
		var self = this;
		
        if (!this.canTap) { return; }

        // Ensure input is disabled here
        if (this.inMessage) {
            this.hideMessage(this.afterMessage);
            return;
        }
		
				
		// if (this.gamePhase == 7)
		// {
  //           console.log("-----gamePhase 7-----");
		// 	this.gamePhase = 4;
		// 	console.log("-----end gamePhase 7-----");
		// }
		
		// if (this.gamePhase == 8)
		// {
  //           console.log("-----gamePhase 8-----");
		// 	this.gamePhase = 2;
		// 	console.log("-----end gamePhase 8-----");
		// }
		
		// if (this.gamePhase == 6)
		// {
  //           console.log("-----gamePhase 6-----");
		// 	if (this.turn == game.HUMAN)
		// 	{
		// 		if (this.possession == game.HUMAN)
		// 		{
		// 			// Pass
		// 			if (this.dice.value1 == this.dice.value2)					
		// 			{
		// 				this.Doubles = 1;
		// 			}
		// 			else
		// 			{
		// 				this.Doubles = 0;
		// 			}
		// 			this.moveBall (Math.max(this.dice.value1, this.dice.value2) + this.Doubles);
		// 			if (this.dice.value1 == 1 || this.dice.value2 == 1)
		// 			{
		// 				if (self.chipZone != 11 || self.chipZone != -11)
		// 				{
		// 					self.changePossession();
		// 				}
		// 			}
		// 			//self.changeActivePlayer();
		// 			self.endTurn();
		// 		}
		// 		else
		// 		{
		// 			// Intercept
		// 			//self.changeActivePlayer();
		// 			if (this.dice.value1 == 6 || this.dice.value2 == 6)
		// 			{
		// 				self.changePossession();
		// 			}
		// 			self.endTurn();
		// 		}
		// 	}
		// 	else
		// 	{
		// 		if (this.possession == game.AI)
		// 		{
		// 			// Pass
		// 			if (this.dice.value1 == this.dice.value2)					
		// 			{
		// 				this.Doubles = 1;
		// 			}
		// 			else
		// 			{
		// 				this.Doubles = 0;
		// 			}
		// 			this.moveBall (Math.max(this.dice.value1, this.dice.value2) + this.Doubles);
		// 			self.endTurn();
		// 			//self.changeActivePlayer();
		// 			if (this.dice.value1 == 1 || this.dice.value2 == 1)
		// 			{
		// 				if (self.chipZone != 11 || self.chipZone != -11)
		// 				{
		// 					self.changePossession();
		// 				}
		// 			}
		// 		}
		// 		else
		// 		{
		// 			// Intercept
					
		// 			//self.changeActivePlayer();
		// 			if (this.dice.value1 == 6 || this.dice.value2 == 6)
		// 			{
		// 				self.changePossession();
		// 			}
  //                   self.endTurn();
		// 		}
		// 	}
		// 	if (self.chipZone == 11 || self.chipZone == -11) // this if clause was added by Tessa 
		// 	{ 
		// 		this.scoreGoal();
		// 	}else{	
		// 		this.gamePhase = 7;
		// 		console.log("No Goal test!");
		// 	}
		// 	console.log("-----end gamePhase 6-----");
		// }
		
		// if (this.gamePhase == 5)
		// {
  //           console.log("-----gamePhase 5-----");
		// 	if (this.turn == game.HUMAN)
		// 	{
		// 		if (this.possession == game.HUMAN)
		// 		{
		// 			// Pass
		// 			console.log("Player Pass");
		// 			this.rollDice("Player 1");
		// 		}
		// 		else
		// 		{
		// 			// Intercept
		// 			console.log("Player Intercept");
		// 			this.rollDice("Player 1");
		// 		}
		// 	}
		// 	else
		// 	{
		// 		if (this.possession == game.AI)
		// 		{
		// 			// Pass
		// 			console.log("AI Pass");
		// 			this.rollDice("Player 2");
		// 		}
		// 		else
		// 		{
		// 			// Intercept
		// 			console.log("AI Intercept");
		// 			this.rollDice("Player 2");
		// 		}
		// 	}
		// 	this.gamePhase = 6;
		// 	console.log("-----end gamePhase 5-----");
		// }
		
        /* Human Card Menu */
		if (this.gamePhase == 3)
		{
            // Todo: somehow insert the cardmenu into this phase. Input will enable,
            //       and a card will be selected. Go to separate function after this 
            //       that figures which card, and does all the steps for that card.
            //       Will probably need numerous game phases for the different cards.

            // Idea: set gamePhase = -1 so that when input is enabled, this
            //       does nothing
            console.log("-----gamePhase 3-----");
			if (this.turn == game.HUMAN)
			{
				//Open Card Menu
				console.log("Card Menu");
			}
            // Todo: Move ai card choice to its own function
			else{
				// AI Choice
				console.log("AI");
			}
			this.gamePhase = 5;
			console.log("-----end gamePhase 3-----");
		}
		
		// if (this.gamePhase == 3)
		// {
  //           console.log("-----gamePhase 3-----");
		// 	if (this.turn == game.HUMAN) {
		// 		if (this.dice.value1 == this.dice.value2)					
		// 		{
		// 			this.Doubles = 1;
		// 		}
		// 		else
		// 		{
		// 			this.Doubles = 0;
		// 		}
		// 		this.moveBall (Math.max(this.dice.value1, this.dice.value2) + this.Doubles);
		// 		self.endTurn();
		// 		//self.changeActivePlayer();
		// 		if (this.dice.value1 == 1 || this.dice.value2 == 1)
		// 		{
		// 			self.changePossession()
		// 		}
		// 	}
		// 	else if (this.turn == game.AI) {
		// 		if (this.dice.value1 == this.dice.value2)					
		// 		{
		// 			this.Doubles = 1;
		// 		}
		// 		else
		// 		{
		// 			this.Doubles = 0;
		// 		}
		// 		this.moveBall (Math.max(this.dice.value1, this.dice.value2) + this.Doubles);
		// 		self.endTurn();
		// 		//self.changeActivePlayer();
		// 		if (this.dice.value1 == 1 || this.dice.value2 == 1)
		// 		{
		// 			self.changePossession()
		// 		}
		// 	}
		// 	this.gamePhase = 4;
		// 	console.log("-----end gamePhase 3-----");
		// }
		

        /* Human Kickoff */
		if (this.gamePhase == 1)
		{
            console.log("-----gamePhase 1-----");

            // Todo: call centerBall() immediately after a goal score or kickoff etc; 
            //       otherwise it won't center until it is time to kick it
            this.centerBall();
            this.updateBallTexture();

			if (this.turn == game.HUMAN) {
				this.rollDice("Player 1");
			}


            // Todo: move ai kickoff to its own function
			else if (this.turn == game.AI) {
                console.log("Oops! AI turn during gamePhase 1");
				this.rollDice("Player 2");
			}
			this.gamePhase = 3;
			console.log("-----end gamePhase 1-----");
		}
		

  //       /* Initial rolloff result */
		// if (this.gamePhase == 1)
		// {
  //           console.log("-----gamePhase 1-----");
		// 	if (this.dice.value1 > this.dice.value2)
		// 	{
		// 		this.turn = game.HUMAN;
		// 		this.possession = game.HUMAN;
		// 		this.gamePhase = 2;
		// 	}
		// 	else if (this.dice.value2 > this.dice.value1)
		// 	{
  //               // Todo: AI turn must go here; else you have to click to start it
  //               //       note: AI turn can be in a separate function, because it doesn't need clicks
  //               //             from the user (except for defending goal attempts)
		// 		this.turn = game.AI;
		// 		this.possession = game.AI;

  //               // May not need this line.. this is for the initial rolloff
		// 		this.gamePhase = 2;
		// 	}
		// 	else
		// 	{
		// 		this.gamePhase = 0;
		// 	}
		// 	console.log("-----end gamePhase 1-----");
		// }
		

        /* Initial rolloff */
		if (this.gamePhase == 0)
		{
            console.log("-----gamePhase 0-----");

            // Prevent access of this function
            //this.gamePhase = -1;

			//Roll both dice, then evaluate the result
            this.disableInput();
			this.rollDice("Both", function() {

                    // Tie roll: prepare to reroll
                    if(self.dice.value1 === self.dice.value2) {
                        console.log("dice values: " + self.dice.value1 + ", " + self.dice.value2);
                        self.enableInput();
                        return;
                    }

                    // Human wins the rolloff: start human's turn
                    if (self.dice.value1 > self.dice.value2) 
                    {
                        // Update everything
                        self.turn = game.HUMAN;
                        self.possession = game.HUMAN;
                        self.updateBallTexture();

                        // Wait a bit, hide dice, then start player turn
                        self.addTimer(1000, function() { 
                            self.hideDice( function(){self.humanTurn();} );
                        });
                        

                    }
                    // AI wins the rolloff: start ai's turn
                    else if(self.dice.value1 < self.dice.value2) 
                    {
                        // Update everything
                        self.turn = game.AI;
                        self.possession = game.AI;
                        self.updateBallTexture();

                        // Hide dice, then start ai turn
                        self.addTimer(1000, function() { 
                            self.hideDice( function(){self.aiTurn();} );
                        });
                    }
                }

            );

		}
    },

    // Pass a function() in as 'callback' and it will execute after dice hide
    hideDice: function(callback) {
        //this.disableInput();
        this.dice.hide(callback);
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
                //self.rollDice("Player 2");
				self.enableInput();
            });
        }
    },

    // changeActivePlayer: function() {
    //     if (this.turn === game.HUMAN) {
    //         this.turn = game.AI;
    //         //this.dice.setAiPosition();
    //         //console.log("It is now the AI's turn.");
    //     } else {
    //         this.turn = game.HUMAN;
    //         //this.dice.setPlayerPosition();
    //         //console.log("It is now Player 1's turn.");
    //     }
    //     //this.showDice();
    // },

    // Rolls dice for "Player 1", "Player 2", or "both"
    rollDice: function(whichPlayer, callback) {
        this.disableInput();

        var self = this;
        this.dice.roll(whichPlayer);
        // roll the dice for a second
        this.addTimer(1000, function() {
            self.dice.stopRoll();
            // brief pause before other actions can be taken
            self.addTimer(250, function() {
                //console.log("dice roll complete.Re-enabling input."); 
                //self.enableInput();
                callback();
            });
        });
    },


    changePossession: function() {
        var self = this;
        this.showMessage('Intercept', function() {
            self.possession = !self.possession;
            //self.chip.setTexture(self.possession == game.HUMAN ? 'chip-home' : 'chip-away');
            self.updateBallTexture();
            // remove endturn() from here
        });
    },

    centerBall: function() {
        this.chip.y = game.system.height * 0.5;
        this.chipZone = 0;
    },

    updateBallTexture: function() {
        this.chip.setTexture(this.possession == game.HUMAN ? 'chip-home' : 'chip-away');    
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
                    // TODO: pass in appropriate player for dice roll
                    self.rollDice();
                }
            });
        });
    },

    moveBall: function(move) {

        var self = this;
        //var move = Math.max(this.dice.value1, this.dice.value2);

        // AI territory < 0, Human territory > 0

        this.chipZone += (this.possession == game.HUMAN) ? -move : move;
        if (this.chipZone > 11) { this.chipZone = 11; }
        if (this.chipZone < -11) { this.chipZone = -11; }

        // Set target position
        //var newpos = 516;//game.system.height * 0.5;
        var newpos = game.system.height * 0.5;

        // New board (blank field)
        if(self.chipZone != 0){
            // newpos += this.boardZone[this.chipZone].ySpot;
            newpos = self.boardZone[self.chipZone + 11].ySpot;
        }

        // Old board (with KickShot logo)
        // if (this.chipZone > 0) {
        //     newpos += 24 + (this.chipZone - 1) * 36;
        // } else if (this.chipZone < 0) {
        //     newpos += -24 + (this.chipZone + 1) * 36;
        // }

        // Animation
        this.addTween(this.chip, {y: newpos}, 500, {
            easing: game.Tween.Easing.Quadratic.InOut,
            onComplete: function() {
                // previously, endTurn() called here. Should be done by central control.
            }
        }).start();
    },

    /*  old function. Replaced by moveBall  */
    advanceToken: function() {
        var self = this;
        var move = Math.max(this.dice.value1, this.dice.value2);

        // AI territory < 0, Human territory > 0

        this.chipZone += (this.possession == game.HUMAN) ? -move : move;
        if (this.chipZone > 11) { this.chipZone = 11; }
        if (this.chipZone < -11) { this.chipZone = -11; }

        var newpos = 516;//game.system.height * 0.5;
        if (this.chipZone > 0) {
            newpos += 24 + (this.chipZone - 1) * 36;
        } else if (this.chipZone < 0) {
            newpos += -24 + (this.chipZone + 1) * 36;
        }

        this.addTween(this.chip, {y: newpos}, 500, {
            easing: game.Tween.Easing.Quadratic.InOut,
            onComplete: function() {
                if (self.chipZone == 11 || self.chipZone == -11) {
                    //self.goalShot();
                } else {
                   // self.endTurn();
                }
            }
        }).start();
    },

    goalShot: function() {
        // Todo: check about sending null callback functions
        this.showMessage('GoalShot', function(){} );
    },


    // End the current turn and start the next one
    endTurn: function() {
        //console.log("EndingTurn");
        var self = this;
        this.addTimer(1000, function() {
            self.hideDice();
            self.addTimer(1000, function() {

                // Start the next turn
                if (this.turn === game.HUMAN) {
                    this.turn = game.AI;
                    this.aiTurn();
                } else {
                    this.turn = game.HUMAN;
                    this.humanTurn();
                }

            });
        });
    },

    // // Old endTurn function
    // endTurn: function() {
    //     console.log("EndingTurn");
    //     var self = this;
    //     this.addTimer(1000, function() {
    //         self.hideDice();
    //         self.addTimer(1000, function() {
    //             self.changeActivePlayer();
    //             //self.showDice();
    //         });
    //     });
    // },
	
	scoreGoal: function() {
		// New function made by Tessa 
        var self = this;

        if (self.chipZone == 11) {
            //game.audio.playSound('boo');
        } else {
            //game.audio.playSound('cheer');
        }

        this.showMessage('Goal', function() { });
			//var kickOffPlayer = false;
			if (self.chipZone == 11) {
				game.AiScore += 1;
				//    kickOffPlayer = game.HUMAN;
			}
			if (self.chipZone == -11) {
				game.HumanScore += 1;
				//    kickOffPlayer = game.AI;
			}
			self.updateScore();

			/*if (game.AiScore == game.MaxScore || game.HumanScore == game.MaxScore) {
				self.showMessage('End', self.gameOver.bind(self));
				return true ;
			}*/
			this.centerBall();
			this.chipZone = 0;
			this.changePossession();
			this.updateBallTexture();
			this.gamePhase = 8;
				
			this.pause(3000);
			console.log("Goal test!");
    },
	
    oldscoreGoal: function() {
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

    // Draw card from player's deck and puts in hand
    // ToDo: draw cards for computer
    drawCard: function() {
        if(this.hand.length <= 6){
            this.hand.push( this.playerDeck.draw() );      
        } else {
            console.log("Can't draw a card for player 1, already too many cards in hand");
        }
        
    },

    // Print contents of "hand" for debugging
    printHand: function() {
        console.log("Printing contents of \"hand\"...");

        for(var i = 0; i < 6; i++){
            console.log("Hand[" + i + "]: " + this.hand[i]);
        }
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
    },
	
	pause: function(timeToPause){
		// This pause was added by Tessa 
		this.disableInput();
		this.addTimer(function(){this.enableInput();},timeToPause);
	
	},

    testPlayable: function(cardName) {
        return this.cardMenu.isPlayable(cardName, this.turn, this.possession, this.chipZone);
    },



    /* Card Menu clicks */
    clickCard0: function(mousedata) { 
        console.log("clicked card 0");
        this.testPlayable(this.cardMenu.cards[0].name);
    },
    clickCard1: function(mousedata) { 
        console.log("clicked card 1");
        this.testPlayable(this.cardMenu.cards[1].name);
    },
    clickCard2: function(mousedata) { 
        console.log("clicked card 2");
        this.testPlayable(this.cardMenu.cards[2].name);
    },
    clickCard3: function(mousedata) { 
        console.log("clicked card 3");
        this.testPlayable(this.cardMenu.cards[3].name);
    },
    clickCard4: function(mousedata) { 
        console.log("clicked card 4");
        this.testPlayable(this.cardMenu.cards[4].name);
    },
    clickCard5: function(mousedata) { 
        console.log("clicked card 5");
        this.testPlayable(this.cardMenu.cards[5].name);
    }
    






    
});

});

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
game.GoalAttempt = -1;
game.HumanScore = 0;
game.AiScore = 0;
game.MaxScore = 5;
game.Doubles = 0;
game.DiceHideSpeed = 500;
game.CardHideSpeed = 500;

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

    inPlayClick: false,

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
        /* Return if this function is already running */
        if(this.inPlayClick){
            return;
        }

        this.inPlayClick = true;

        // stop character tween
        game.tweenEngine.stopTweensForObject(this.charSprite);
        this.addTween(this.charSprite, {x: -200}, 400, {delay: 50, easing: game.Tween.Easing.Back.In}).start();

        this.addTween(this.title, {y: -this.title.height}, 400, {delay: 50, easing: game.Tween.Easing.Back.In}).start();
        this.addTween(this.playButton, {x: -200}, 400,
            {delay: 250, easing: game.Tween.Easing.Back.In,
             onComplete: function() {
                this.inPlayClick = false;
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
    playerHand: [],
    canPlayCards: false,

    aiDeck: null,
    aiHand: [],

    chip: null,
    chipZone: 0,
	gamePhase: -1,
    kickoff: false,
    goalKick: false,

    helpButton: null,
    rules: null,
    backButton: null,

    _this: null,

	activeSprite: null,
    messageText: null,
	
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

        _this = this;

        var self = this;
        

        /* Add the playing field */
        this.field = new game.Sprite('field').addTo(this.stage);
        this.field.x = 0;
        this.field.y = -this.field.height;
        this.field.interactive = true;
        this.field.click = this.field.tap = this.fieldClick.bind(this);
        this.addTween(this.field, {y: 0}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        /* Add the ball */
        this.chip = new game.Sprite('chip-home').addTo(this.stage);
        this.chip.scale.x = this.chip.scale.y = 0.7;
        this.chip.anchor.set(0.5, 0.5);
        this.chip.center();
        this.chip.y = -game.system.height * 0.5;//-this.field.height/2;
        this.addTween(this.chip, {y: game.system.height * 0.5}, 600,
            {delay: 400, easing: game.Tween.Easing.Quadratic.Out,
             onComplete: function() {
                 self.addObject(self.dice);
                 self.showDice( function(){ _this.enableInput();} );
             }
            }).start();

        /* Create the dice */
        this.dice = new game.Dice();

        /* Create a cardMenu for the player */
        this.cardMenu = new game.CardMenu();
		
		this.cardMenu.skipButton.sprite.click =  this.skipClick.bind(this);
		
        /* Enable the cards to be clicked */
        this.cardMenu.cards[0].sprite.click = this.clickCard0.bind(this);
        this.cardMenu.cards[1].sprite.click = this.clickCard1.bind(this);
        this.cardMenu.cards[2].sprite.click = this.clickCard2.bind(this);
        this.cardMenu.cards[3].sprite.click = this.clickCard3.bind(this);
        this.cardMenu.cards[4].sprite.click = this.clickCard4.bind(this);
        this.cardMenu.cards[5].sprite.click = this.clickCard5.bind(this);

        /* Create a deck of cards for the player */
        this.playerDeck = new game.Deck("home");
        //this.playerDeck.printDeck();

        /* Draw player's starting hand */
        this.drawCard("Player 1");
        this.drawCard("Player 1");
        this.drawCard("Player 1");
        this.drawCard("Player 1");
        this.drawCard("Player 1");
        this.drawCard("Player 1");

        /* Create a deck of cards for the computer */
        this.aiDeck = new game.Deck("away");
        // this.aiDeck.printDeck();

        /* Draw computer's starting hand */
        this.drawCard("AI");
        this.drawCard("AI");
        this.drawCard("AI");
        this.drawCard("AI");
        this.drawCard("AI");
        this.drawCard("AI");


        this.cardMenu.updateCards(this.playerHand);
        this.cardMenu.resetHiddenPosition();

        // Testing the new card animations
        this.cardMenu.showCards();



        this.aiScoreText = new game.BitmapText('AI: 0', { font: 'Foo' }).addTo(this.stage);
        this.aiScoreText.position.set(500, -game.system.height + 110);
        this.humanScoreText = new game.BitmapText('YOU: 0', { font: 'Foo' }).addTo(this.stage);
        this.humanScoreText.position.set(465, -110);
        this.addTween(this.aiScoreText, {y: 50}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();
        this.addTween(this.humanScoreText, {y: 850}, 600, { delay: 400, easing: game.Tween.Easing.Quadratic.Out }).start();

        /* Add the help button */
        this.helpButton = new game.Sprite('help').addTo(this.stage);
        this.helpButton.anchor.set(0.5, 0.5);
        this.helpButton.scale.set(0.5, 0.5);
        this.helpButton.x = 50;
        this.helpButton.y = -960 + 150;
        this.helpButton.interactive = true;
        this.helpButton.click = this.helpButton.tap = this.helpClick.bind(this);
        this.addTween(this.helpButton, {y: 90}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        /* Add the back button */
        this.backButton = new game.Sprite('close').addTo(this.stage);
        this.backButton.anchor.set(0.5, 0.5);
        this.backButton.scale.set(0.5, 0.5);
        this.backButton.x = 50;
        this.backButton.y = -960 + 225;
        this.backButton.interactive = true;
        this.backButton.click = this.backButton.tap = this.backClick.bind(this);
        this.addTween(this.backButton, {y: 165}, 600, {delay: 400, easing: game.Tween.Easing.Quadratic.Out}).start();

        // Todo: get rid of rules--they are for the Level 1 version of the game
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

        /* Message text */
        this.messageText = new game.BitmapText('longest block of text we need', { font: 'Foo' , align: 'center' }).addTo(this.stage);
        this.messageText.visible = true;
        this.messageText.position.set(-this.messageText.textWidth, 585);

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

        /* Kickoff from center line */
        if(_this.kickoff)
        {
            // Prevent clicks from doing anything
            _this.gamePhase = -1;

            // Give player 1 the dice
            _this.dice.setPlayerPosition();
            _this.showDice( function(){
                _this.gamePhase = 1;
                _this.enableInput();
            });

            return;
        }
        /* Goal kick (from goal line, after a block) */
        else if(_this.goalKick)
        {
            console.log("warning: goal kick not implemented yet for human player!");
            // Todo: goal kicks
        }
        // Non kickoff
        else
        {
            // todo: enable input here
            // Let player select a card
            // Todo: input is currently disabled here
			_this.showHand();
            _this.gamePhase = 2;
            return;
        }
    },

    aiTurn: function() {
        console.log("start ai turn");

        /* Kickoff from center line */
        if(_this.kickoff)
        {
            _this.aiKickoff();
        }
        /* Goal kick (from goal line, after a block) */
        else if(_this.goalKick)
        {
            // do a goal kick and end turn
            _this.aiGoalKick();
        }
        else
        {
            // Temporary until we start ai
            // Skip over the ai turn
            console.log("skipping...");

            _this.endTurn(); 
        }


          

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


        if(this.gamePhase == 5){
            //Todo: human goalKick!
        }
		
        /* Rolloff for passing in to goal */
        if(this.gamePhase == 4){

            /* Prevent re-entry */
            _this.gamePhase = -1;
            _this.disableInput();


            _this.rollDice("Both", function() {
                
                /* Tie! Let them roll again */
                if(_this.dice.value1 == _this.dice.value2){
                    _this.gamePhase = 4;
                    _this.enableInput();
                    return;
                }
                /* Success! Score goal (which also ends turn)*/
                else if (_this.dice.value1 > _this.dice.value2) 
                {
                    _this.scoreGoal();
                }
                /* Blocked! */
                else
                {
                    /* Defender does a goal kick for their next turn */
                    _this.changePossession();
                    _this.goalKick = true;
                    _this.endTurn();
                }

            });
        }


        /* Roll dice for human pass card */
        if(this.gamePhase == 3){

            /* Prevent re-entry */
            _this.gamePhase = -1;
            _this.disableInput();

            /* Roll both dice for player */
            _this.rollDice("Player 1", function(){

                if(_this.dice.value1 == _this.dice.value2)
                {
                    // Todo: message here for the +1 bonus
                    _this.Doubles = 1;
                } 
                else 
                {
                    _this.Doubles = 0;
                }

                // Move ball, then turnover if 1 rolled, then end turn
                _this.moveBall (Math.max(_this.dice.value1, _this.dice.value2) + _this.Doubles, function() {
                    _this.Doubles = 0;
                    
                    /* Pass in goal attempt */
                    if (_this.chipZone == -11)
                    {
                        /* Hide dice before repositioning them */
                        _this.hideDice(function(){

                            /* Set up a roll off. Wait for player to click */
                            _this.dice.setBothPositions();
                            _this.showDice( function() {
                                _this.gamePhase = 4;
                                _this.enableInput();
                                return;
                            });

                        });

                    }
                    /* Turnover if 1 on either dice. This rule doesn't apply when attempting a goal */
                    else
                    {

                        if(_this.dice.value1 == 1 || _this.dice.value2 == 1)
                        {
                            _this.changePossession();
                        }

                            _this.endTurn();
                    }
                    
                });
            });
        }




        /* Human Card Menu */
		if (this.gamePhase == 2)
		{

            console.log("-----gamePhase 2-----");
			if (this.turn == game.HUMAN)
			{
				//Open Card Menu
				console.log("Card Menu");
				//self.showHand();
			}
            // Todo: Move ai card choice to its own function
			else{
				// AI Choice
				console.log("AI");
			}
			this.gamePhase = 5;
			console.log("-----end gamePhase 2-----");
		}
		
		

        /* Human Kickoff */
		if (this.gamePhase == 1)
		{

            // If it is the AI's ball, a mistake was made
            if(this.possession == game.AI) {
                console.log("Error: AI possession during human kickoff");
                _this.enableInput();
                _this.gamePhase = 1;
                return;
            }

            // Prevent re-entry
            this.disableInput();
            gamePhase = -1;

            // Roll both dice
            this.rollDice("Player 1", function() {

                // +1 to roll for doubles
                if(self.dice.value1 == self.dice.value2)
                {
                    // Todo: message here for the +1 bonus?
                    self.Doubles = 1;
                } 
                else 
                {
                    self.Doubles = 0;
                }

                // Move ball, then turnover if 1 rolled, then end turn
                self.moveBall (Math.max(self.dice.value1, self.dice.value2) + self.Doubles, 
                               function() {
                                    self.kickoff = false;
                                    _this.Doubles = 0;

                                    // Turnover if 1 is rolled
                                    if(self.dice.value1 == 1 || self.dice.value2 == 1)
                                    {
                                        self.changePossession();
                                    }
                                    self.endTurn();
                               });

            });

            return;

		}
		

		

        /* Initial rolloff */
		if (this.gamePhase == 0)
		{

            // Prevent re-access of this function
            _this.disableInput();
            _this.gamePhase = -1;
			// self.hideHand();

			//Roll both dice, then evaluate the result
			this.rollDice("Both", function() {

                    // Tie roll: prepare to reroll
                    if(self.dice.value1 === self.dice.value2) {
                        console.log("dice values: " + self.dice.value1 + ", " + self.dice.value2);
                        _this.enableInput();
                        _this.gamePhase = 0;
                        return;
                    }

                    // Human wins the rolloff: start human's turn
                    if (self.dice.value1 > self.dice.value2) 
                    {
                        // Update everything
                        self.turn = game.HUMAN;
                        self.possession = game.HUMAN;
                        self.updateBallTexture();
                        self.kickoff = true;

                        _this.displayMessageSprite("             You go first!", function(){} );

                        // Wait a moment, then hide the dice
                        self.addTimer(1000, function() { 
                            self.hideDice( function() {
                                // After hiding dice, wait a moment and then start human turn
                                self.addTimer(500, function() {
                                    self.humanTurn();
                                });
                            });
                        });                       
                    }

                    // AI wins the rolloff: start ai's turn
                    else if(self.dice.value1 < self.dice.value2) 
                    {
                        // Update everything
                        self.turn = game.AI;
                        self.possession = game.AI;
                        self.updateBallTexture();
                        self.kickoff = true;

                        _this.displayMessageSprite("       Computer goes first!", function(){} );

                        // Wait a moment, then hide the dice
                        self.addTimer(1000, function() { 
                            self.hideDice( function() {
                                // After hiding dice, wait a moment and then start ai turn
                                self.addTimer(500, function() {
                                    self.aiTurn();
                                });
                            });
                        });
                    }
                }

            );

		}
    },

    /******** AI functions ********/

    // Todo: possibly remove this callback
    aiKickoff: function(callback) {
        _this.gamePhase = -1;
        _this.kickoff = false;


        _this.dice.setAiPosition();
        _this.showDice( function(){
            _this.rollDice("Player 2", function(){
                // Calculate outcome of dice roll

                // +1 to roll for doubles
                if(_this.dice.value1 == _this.dice.value2)
                {
                    // Todo: message here for the +1 bonus
                    _this.Doubles = 1;
                } 
                else 
                {
                    _this.Doubles = 0;
                }

                // Move ball, then turnover if 1 rolled, then end turn
                _this.moveBall (Math.max(_this.dice.value1, _this.dice.value2) + _this.Doubles, 
                               function() {
                                    _this.Doubles = 0;
                                    
                                    // Turnover if 1 is rolled
                                    if(_this.dice.value1 == 1 || _this.dice.value2 == 1)
                                    {
                                        _this.changePossession();
                                    }
                                    _this.endTurn();
                               });



            });
        });
    },

    /* Goal kick after a successful block */
    aiGoalKick: function() {
        _this.goalKick = false;
        console.log("ai goal kick");

        _this.dice.setAiPosition();
        _this.showDice( function(){
            _this.rollDice("Player 2", function(){

                /* Calculate outcome of dice roll */

                // +1 to roll for doubles
                if(_this.dice.value1 == _this.dice.value2)
                {
                    // Todo: message here for the +1 bonus
                    _this.Doubles = 1;
                } 
                else 
                {
                    _this.Doubles = 0;
                }

                _this.moveBall(_this.dice.value1 + _this.dice.value2 + _this.Doubles, function(){

                    /* Turnover if 1 is rolled */
                    if(_this.dice.value1 == 1 || _this.dice.value2 == 1)
                    {
                        _this.changePossession();
                    }
                    _this.endTurn();

                });

            });
        });

    },







    hideDice: function(callback) {

        _this.dice.hide();
        // Use timer rather than passing callback to 'dice.hide()'
        _this.addTimer(game.DiceHideSpeed, function() {
            callback();
        });
    },


    showDice: function(callback) {

        _this.disableInput();
        _this.dice.show();

        // Enable input after dice have shown
        _this.addTimer(game.DiceHideSpeed, function() {
            //_this.enableInput();
            callback();
        });
    },

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
	
	showHand: function(callback) {

        _this.cardMenu.showCards();
        _this.addTimer(game.CardHideSpeed, function() {
        });
    },
	
	hideHand: function(callback) {

        _this.cardMenu.hideCards();
        _this.addTimer(game.CardHideSpeed, function() {
        });
    },


    changePossession: function() {
        _this.possession = !_this.possession;
        _this.updateBallTexture();
        _this.displayMessageSprite("          Turnover!", function(){} );
        // var self = this;
        // this.showMessage('Intercept', function() {
        //     self.possession = !self.possession;
        //     self.updateBallTexture();
        // });
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

    moveBall: function(move, callback) {

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

        // Animation
        this.addTween(this.chip, {y: newpos}, 500, {
            easing: game.Tween.Easing.Quadratic.InOut,
            onComplete: function() {
                callback();
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
        this.showMessage('GoalShot', function(){} );
    },


    // End the current turn and start the next one
    endTurn: function() {
        //console.log("EndingTurn");
        var self = this;
        self.addTimer(1000, function() {
            // Todo: hide the dice somewhere else
            //  (only hide them after they are used, otherwise there is extra 1 sec pause here)
            self.hideDice( function(){} );
            self.addTimer(1000, function() {

                // Start the next turn
                if (self.turn === game.HUMAN) {
                    self.turn = game.AI;
                    self.aiTurn();
                } else {
                    self.turn = game.HUMAN;
                    self.humanTurn();
                }

            });
        });
    },
	
    /* Awards point, then resets ball for kickoff and ends turn */
	scoreGoal: function() {

        _this.displayMessageSprite("         Goal!", function() {

            /* Award a point */
            if (_this.chipZone == 11) {
                game.AiScore += 1;
            }
            else if (_this.chipZone == -11) {
                game.HumanScore += 1;
            }
            else {
                console.log("error in 'scoreGoal', ball not in valid chipZone");
            }
            _this.updateScore();

            /* Reset for kickoff */
            _this.centerBall();
            _this.changePossession();
            _this.updateBallTexture();
            _this.kickoff = true;

            _this.endTurn();

        });

    },
	

    // Draw card from the deck and put in hand
    // ToDo: handle empty deck
    // Todo: handle hand with <6 cards
    drawCard: function(whichplayer) {
        whichplayer = whichplayer.toUpperCase();

        switch(whichplayer) {

            case "PLAYER":
            case "PLAYER 1":
            case "HUMAN": 

                if(this.playerHand.length <= 6){
                    this.playerHand.push( this.playerDeck.draw() );      
                }else{
                    console.log("Can't draw a card for player 1, already too many cards in their hand");
                }
                break;

            case "AI":
            case "COMPUTER":
            case "PLAYER 2":

                if(this.aiHand.length <= 6){
                    this.aiHand.push( this.aiDeck.draw() );      
                }else{
                    console.log("Can't draw a card for ai, already too many cards in its hand");
                }
                break;

            default:
                console.log("Error in 'drawCard': invalid parameter. Please use a name that works.");
                break; 
        }
 
    },

    // Print contents of "hand" for debugging
    printPlayerHand: function() {
        console.log("Printing contents of \"playerHand\"...");

        for(var i = 0; i < 6; i++){
            console.log("Hand[" + i + "]: " + this.playerHand[i]);
        }
    },

    /* show a sprite, from top to bottom of screen */
    // Todo: adapt this to show a played card; but use text messages for everything else
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


    // Todo: remake this
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

	skipClick: function(mousedata){
		console.log("clicked on skip");
        this.cardMenu.hideCards();
		this.endTurn();
	},


    /* Card Menu clicks */

    clickCard0: function(mousedata) { 
        console.log("clicked card 0");
        if(this.testPlayable(this.cardMenu.cards[0].name)){
            // Todo: remove the card and draw another
            _this.playCard(_this.cardMenu.cards[0].name);
        }
    },
    clickCard1: function(mousedata) { 
        console.log("clicked card 1");
        if(this.testPlayable(this.cardMenu.cards[1].name)){
            // Todo: remove the card and draw another
            _this.playCard(_this.cardMenu.cards[1].name);
        }
    },
    clickCard2: function(mousedata) { 
        console.log("clicked card 2");
        if(this.testPlayable(this.cardMenu.cards[2].name)){
            // Todo: remove the card and draw another
            _this.playCard(_this.cardMenu.cards[2].name);
        }
    },
    clickCard3: function(mousedata) { 
        console.log("clicked card 3");
        if(this.testPlayable(this.cardMenu.cards[3].name)){
            // Todo: remove the card and draw another
            _this.playCard(_this.cardMenu.cards[3].name);
        }
    },
    clickCard4: function(mousedata) { 
        console.log("clicked card 4");
        if(this.testPlayable(this.cardMenu.cards[4].name)){
            // Todo: remove the card and draw another
            _this.playCard(_this.cardMenu.cards[4].name);
        }
    },
    clickCard5: function(mousedata) { 
        console.log("clicked card 5");
        if(this.testPlayable(this.cardMenu.cards[5].name)){
            // Todo: remove the card and draw another
            _this.playCard(_this.cardMenu.cards[5].name);
        }
    },

    playCard: function(whichCard){
        whichCard = whichCard.toUpperCase();

        switch (whichCard) {
            case "PASS_HOME":
            case "PASS_AWAY":
                console.log("Playing pass card...");
                _this.playerPass();
                break;
            case "INTERCEPT_HOME":
            case "INTERCEPT_AWAY":
                console.log("Playing intercept card....");
                _this.playerIntercept();
                break;
            default:
                console.log("warning: can't play this card yet");
                break;
        }
    },

	
    /* Slide text message across screen */
	displayMessageSprite: function(messageString, callback){

        /* Return if a message is already being displayed */ 
        if(_this.inMessage){
            console.log("Error in 'displayMessageSprite': cannot show message '" + messageString + "', already showing a message!");
            return;
        }

        /* Set this global to show that a message is being displayed */
        _this.inMessage = true;

        /* Position message to left of screen */
        _this.messageText.x = -_this.messageText.textWidth;

        /* Update the text */
        _this.messageText.setText(messageString);

        /* Show the message. Run callback() after message is done */
        _this.addTween(_this.messageText, {x: (game.system.width / 2 - _this.messageText.textWidth / 2)}, 600,
                    {delay:50, easing: game.Tween.Easing.Back.Out, onComplete: function() {
                        _this.addTween(_this.messageText, {x: game.system.width + 50}, 600,
                            {delay:1000, easing: game.Tween.Easing.Back.In, onComplete: function() {
                                callback();
                                _this.inMessage = false;} 
                            }).start();
                    }}).start();


        // Todo: update this to use sprites if Aziz doesn't like the text
	},
    

	// Todo: manually click to roll the dice
    // Todo: goal scoring on the rolloff
    // Todo: have a goal kick (both die roll) after blocking a goal. uses your next turn
    playerPass: function()
	{
		_this.dice.setPlayerPosition();
        _this.showDice( function(){
            _this.gamePhase = 3;
            _this.enableInput();
        });
	},
	

    // Todo: fix to manually click to roll dice
	playerIntercept: function()
	{
		_this.dice.setPlayerPosition();
        _this.showDice( function(){
    		_this.rollDice("Player 1", function() {

        		/* Success if neither dice rolls a '1' */ 
                if(_this.dice.value1 != 1 && _this.dice.value2 != 1)
                {
                    _this.changePossession();
                }
                else
                {
                    _this.displayMessageSprite("      Unsuccessful", function(){} )
                }


                // Todo: call this somewhere else
        		_this.endTurn();
            });
        });
	},
	

    // Todo: test this
	playerGoalShot: function(Direction)
	{
		_this.dice.setPlayerPosition();
        _this.showDice( function(){
    		_this.rollDice("Player 1", function() {

            		if(_this.dice.value1 == _this.dice.value2)
            		{
            			// Todo: message here for the +1 bonus
            			_this.Doubles = 1;
            		} 
            		else 
            		{
            			_this.Doubles = 0;
            		}

            		// Move ball, then turnover if 1 rolled, then end turn
            		_this.moveBall (_this.dice.value1 + _this.dice.value2 + _this.Doubles, function() {
                    		_this.Doubles = 0;
                    		if (_this.chipZone == 11)
                    		{
                    			GoalAttempt = Direction;
                    		}
                    		else
                    		{
                    			_this.changePossession();
                    		}
                    		_this.endTurn();
            	    });
            });
        });
    },

    animYTop: 350,
    animYBot: 600,
    animYCenter: 480,
    animYOffset: 0,

    // Testing card animations
    mousemove: function(mousedata) {
        if(mousedata.global.y > this.animYTop && mousedata.global.y < this.animYBot){
            // Get distance to center
                // Get height from center --> this changes resize strength
                this.animYOffset = Math.abs(mousedata.global.y - this.animYCenter);
                // console.log("animYOffset: " + this.animYOffset);

                // Get x coordinate --> this changes which card resizes

                // reDraw the cards
                this.cardMenu.reDraw(mousedata.global.x, this.animYOffset);
        }
        console.log("screenwidth: " + game.system.width);
        // console.log("mouse (x,y): (" + mousedata.global.x + ", " + mousedata.global.y + ")");


    }
    // Todo for animations: 
        // make sure cards are showing
        // Handle arbitrary number of cards




    
});

});

game.module(
    'game.cardMenu'
).body(function() {

game.createClass('CardMenu', {

    cards: [
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null},
        {name: 'close', sprite: null}
        ],
	skipButton: {name: 'skip', sprite: null},
    //highlightedCard: -1,

    init: function() {
		this.skipButton.sprite = new game.Sprite('skip').addTo(game.scene.stage);
		this.skipButton.sprite.scale.x = this.skipButton.sprite.scale.y = 0.49;
		this.skipButton.sprite.interactive = true;
		this.skipButton.sprite.mouseover = this.mouseOverSkip.bind(this);
		this.skipButton.sprite.mouseout = this.mouseOutSkip.bind(this);
		this.skipButton.sprite.position.set( this.skipButton.sprite.y + 9, game.system.height/2 -140);
        // Add a sprite to the game for each card
        for(var i = 0; i < this.cards.length; i++){
            this.cards[i].sprite = new game.Sprite(this.cards[i].name).addTo(game.scene.stage);
            this.cards[i].sprite.scale.x = this.cards[i].sprite.scale.y = 0.3;

            this.cards[i].sprite.interactive = true;

            // Mouse over
            // this.cards[i].sprite.mouseover = this.mouseOverCard.bind(this.cards[i].sprite);
            this.cards[i].sprite.mouseover = this.mouseOverCard.bind(this);


            // Mouse out
            this.cards[i].sprite.mouseout = this.mouseOutCard.bind(this);
        }


    },

    mouseOutCard: function(mousedata) {
        mousedata.target.scale.x = mousedata.target.scale.y = 0.3;
        //mousedata.target.position.y = game.system.height - this.cards[0].sprite.height*0.15;
        mousedata.target.position.y += 500;

    },


    mouseOverCard: function(mousedata) {

        mousedata.target.scale.x = mousedata.target.scale.y = 0.5;
        mousedata.target.position.y -= 500;
		
		
		// These numbers will have to be adjusted if card size is adjusted.
		// if (mousedata.target.position.x <= 50)
		// 	console.log("1");
		// else if (mousedata.target.position.x <= 100)
		// 	console.log("2");
		// else if (mousedata.target.position.x <= 200)
		// 	console.log("3");
		// else if (mousedata.target.position.x <= 250)
		// 	console.log("4");
		// else if (mousedata.target.position.x <= 350)
		// 	console.log("5");
		// else
		// 	console.log("6");
    },

  //   clickedCard: function(mousedata){
  //       console.log("clicked card: ");
  //       mousedata.target.setTexture("Intercept_Home");

		// if (mousedata.target.position.x <= 50)
		// 	console.log("1");
		// else if (mousedata.target.position.x <= 100) {
		// 	console.log("2");
  //           //console.log("card's name is: " + this.cards[1].name);
  //       }
		// else if (mousedata.target.position.x <= 200)
		// 	console.log("3");
		// else if (mousedata.target.position.x <= 250)
		// 	console.log("4");
		// else if (mousedata.target.position.x <= 350)
		// 	console.log("5");
		// else
		// 	console.log("6");
  //   },
	 mouseOverSkip: function(mousedata) {
		mousedata.target.setTexture('skipover');
        mousedata.target.scale.x = mousedata.target.scale.y = 0.5;
        //mousedata.target.position.y -= 500;
		
    },

	mouseOutSkip: function(mousedata) {
		mousedata.target.setTexture('skip');
        mousedata.target.scale.x = mousedata.target.scale.y = 0.49;
        //mousedata.target.position.y = game.system.height - this.cards[0].sprite.height*0.15;
        //mousedata.target.position.y += 500;

    },
   
    // Update the cards to match cards in hand
    updateCards: function(cardsInHand) {

        if(cardsInHand.length == 0){
            console.log("No cards in hand! CardMenu will be empty");
            return;
        }


        // Update names and sprites in "cards"
        // Todo: update all 6 cards
        for(var i = 0; i < cardsInHand.length; i++){
            this.cards[i].name = cardsInHand[i];
            this.cards[i].sprite.setTexture( this.cards[i].name );
        }

        // Todo: check for number of cards in hand if less than 6
        for(var i = 0; i < 6; i++) {
            this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height - this.cards[i].sprite.height*0.1);
            
            //this.cards[i].sprite.position.set( (((game.system.width/ (this.cards.length+2) )*5 + this.cards[i].sprite.width)/this.cards.length) * i, game.system.height - this.cards[i].sprite.height*0.15);

        }

        //this.printCards();
    },
	
	hideCard: function(cardNumber)
	{
	  game.scene.addTween(this.cards[cardNumber].sprite, {y: game.system.height}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out }).start();
	},
	
	hideCards: function()
	{
		for(var i = 0; i < 6; i++) {
			game.scene.addTween(this.cards[i].sprite, {y: game.system.height}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out }).start();
		}
	},
	
	showCard: function(cardNumber)
	{
	  game.scene.addTween(this.cards[cardNumber].sprite, {y: game.system.height - 50}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out }).start();
	},
	
	showCards: function()
	{
		for(var i = 0; i < 6; i++) {
			game.scene.addTween(this.cards[i].sprite, {y: game.system.height - 50}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out }).start();
		}
	},



    isPlayable: function(cardName, currentPlayer, currentPossession, ballZone) {

        returnValue: false;

        switch (cardName) {

            // Intercept
            case("Intercept_Home"):
            case("Intercept_Away"):
                // Return true if the current Player does not have the ball
                currentPlayer != currentPossession ? returnValue = true : returnValue = false;
                console.log("Card \'" + cardName + "\' isPlayable == " + returnValue);
                return returnValue;
                break;

            // Pass
            // warning: this card is not actually checked yet
            case("Pass_Home"):
                console.log("warning: \'Pass card\' not checked in \'isPlayable()\'");
                break;
            default: 
                console.log("error in \'isPlayable\': unsupported card name");
                console.log("warning: returning \'false\'");
                return this.returnValue;
        }
    },
    





    show: function() {
        // Show the card menu
    },

    
    hide: function() {
        // Hide the card menu
    },

    enlargeCard: function() {
        // Enlarge a card for inspection
    },

    

    // Print names of cards in console for debugging
    printCards: function() {
        console.log("Printing contents of \"cards\" in CardMenu...");
        for(var i = 0; i < this.cards.length; i++){
            console.log("cards[" + i + "]: " + this.cards[i].name );
        }
    }

});

});

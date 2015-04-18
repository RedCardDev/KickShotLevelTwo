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
    animating: false,

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

        // for(var i = 0; i < 6; i++) {
        //     this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height - this.cards[i].sprite.height*0.1); 
        // }


    },

    mouseOutCard: function(mousedata) {

        if(this.animating){
            return;
        }

        mousedata.target.scale.x = mousedata.target.scale.y = 0.3;
        //mousedata.target.position.y = game.system.height - this.cards[0].sprite.height*0.15;
        // mousedata.target.position.y += 500;
        mousedata.target.position.y = game.system.height - 50;
    },


    mouseOverCard: function(mousedata) {

        if(this.animating){
            return;
        }

        mousedata.target.scale.x = mousedata.target.scale.y = 0.5;
        // mousedata.target.position.y -= 500;
        mousedata.target.position.y = 420;	
    },


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
        // for(var i = 0; i < 6; i++) {
        //     this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height - this.cards[i].sprite.height*0.1); 
        // }

        //this.printCards();
    },



    /* Reset cards to the initial position (showing, on bottom of screen) */
    resetShowingPosition: function() {
        for(var i = 0; i < 6; i++) {
            this.cards[i].sprite.scale.x = this.cards[i].sprite.y = 0.3;
            // this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height - this.cards[i].sprite.height*0.1);
            this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height - 50); 
        }
    },

    resetHiddenPosition: function() {
        for(var i = 0; i < 6; i++) {
            this.cards[i].sprite.scale.x = this.cards[i].sprite.y = 0.3;
            this.cards[i].sprite.position.set( 30 + this.cards[i].sprite.width*0.25*i, game.system.height); 
        }
    },


	/* unused. Also may be buggy (doesn't reset positions when animating) */
	hideCard: function(cardNumber)
	{
        var self = this;
        this.animating = true;
        this.resetShowingPosition();
        game.scene.addTween(this.cards[cardNumber].sprite, {y: game.system.height}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out,
            onComplete: function(){
                self.animating = false;
            }}).start();
	},
	
	hideCards: function()
	{
        console.log("hiding cards");
        var self = this;
        this.animating = true;

        /* make sure cards are in position to hide */
        this.resetShowingPosition();

        /* Slide cards off screen */
		for(var i = 0; i < 6; i++) {
			game.scene.addTween(this.cards[i].sprite, {y: game.system.height}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out,
                onComplete: function(){
                    self.animating = false;
                }}).start();
		}
	},
	
    /* unused. Also may be buggy (doesn't reset positions when animating) */
	showCard: function(cardNumber)
	{
        var self = this;
        this.animating = true;
	    game.scene.addTween(this.cards[cardNumber].sprite, {y: game.system.height - 50}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out,
            onComplete: function(){
                self.animating = false;
            }}).start();
	},
	
	showCards: function()
	{
        console.log("showing cards");
        var self = this;
        this.animating = true;

        /* make sure cards are right below bottom of screen */
        this.resetHiddenPosition();

        /* Slide cards into view */
		for(var i = 0; i < 6; i++) {           
			game.scene.addTween(this.cards[i].sprite, {y: game.system.height - 50}, game.CardHideSpeed, { easing: game.Tween.Easing.Back.Out,
                onComplete: function(){
                    self.animating = false;
                }}).start();
		}
	},



    isPlayable: function(cardName, currentPlayer, currentPossession, ballZone) {

        returnValue: false;

        switch (cardName) {

            /* Intercept */
            case("Intercept_Home"):
            case("Intercept_Away"):
                // Return true if the current Player does not have the ball
                currentPlayer != currentPossession ? returnValue = true : returnValue = false;
                console.log("Card \'" + cardName + "\' isPlayable == " + returnValue);
                return returnValue;
                break;

            /* Pass */
            case("Pass_Home"):
            case("Pass_Away"):
                /* return true if the current player has the ball */
                currentPlayer === currentPossession ? returnValue = true : returnValue = false;
                console.log("Card \'" + cardName + "\' isPlayable == " + returnValue);
                return returnValue;
                break;
            default: 
                console.log("error in \'isPlayable\': unsupported card name");
                console.log("warning: returning \'false\'");
                return this.returnValue;
        }
    },

    enlargeCard: function() {
        // Enlarge a card for inspection
    },

    reDraw: function(mouseX, mouseY){
        // console.log("mosex and mousey: " + mouseX + ", " + mouseY);

        var numCards = 6;       // Number of cards in hand (non-null sprites)
        var overlap = 0.25;     // % of card that overlaps
        var margin = 30;        // Margin between cards and edge of screen
        var cardWidth = 229.25; // Width for card at 25% scale

        /* Get number of cards in hand */
        for(var i = 0; i < this.cards.length; i++){
            if(this.cards[i].sprite === null){
                numCards--;
            }
        }
        // console.log("numCards: " + numCards);

        // Determine size of overlap
        // AreaToFill = numCards*(sprite.width - overlap) + overlap
        
        // Gives overlap amount in pix
        overlap = ( (game.system.width - margin*2) - (cardWidth * numCards) ) / (1 - numCards)
        overlap = overlap / cardWidth;

        console.log("OVERLAP: " + overlap);


        for(var i = 0; i < this.cards.length; i++){


            // margin + (cardWith - cardWidth*overlap)*i
            this.cards[i].sprite.position.set( margin + (i*(cardWidth - (cardWidth*overlap))), game.system.height *0.5 );
            // this.cards[i].sprite.position.set( margin + i*(30), game.system.height *0.5 );
            console.log("fucky expressoin: " + overlap);

            console.log("card[" + i + "]: (" + this.cards[i].sprite.x + ", " + this.cards[i].sprite.y + ")");
            // this.cards[i].sprite.position.set(0,0);

            // console.log("scaling at first : " + this.cards[i].sprite.scale.x);
            // console.log("width at frist scaling: " + this.cards[i].sprite.width);

            // this.cards[i].sprite.scale.x = this.cards[i].sprite.scale.y = 1.0;
            // console.log("width at size 1.0: " + this.cards[i].sprite.width);


            
        }
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

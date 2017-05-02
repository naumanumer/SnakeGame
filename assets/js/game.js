var snake, apple, squareSize, score, speed, walls, wall, isAppleOver,
    updateDelay, direction, new_direction,
    addNew, cursors, scoreTextValue, speedTextValue, textStyle_Key, textStyle_Value, LoadingText;

var swipeCoordX,
    swipeCoordY,
    swipeCoordX2,
    swipeCoordY2,
    swipeMinDistance = 50;

var Game = {

    preload: function() {

        // setting game background color
        game.stage.backgroundColor = '#061f27';

        //clearing all the variables
        snake = apple = squareSize = score = speed = walls = wall = isAppleOver =
            updateDelay = direction = new_direction = addNew= cursors= scoreTextValue=
            speedTextValue= textStyle_Key= textStyle_Value= LoadingText= undefined;

        //displaying loading level.. until all the resources are loaded
        textStyle_Key = { font: "bold 14px sans-serif", fill: "#46c0f9", align: "center" };
        textStyle_Value = { font: "bold 18px sans-serif", fill: "#fff", align: "center" };
        LoadingText = game.add.text(220, 230, "Loading Levels ...", textStyle_Value);

        // loading level resources
        game.load.image('snake', './assets/images/snake.png');
        game.load.image('apple', './assets/images/apple.png');
        game.load.image('tile', './assets/images/tile.png');
        game.load.tilemap('level', `assets/levels/level${level}.csv`);

        // initializing game physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
    },

    create: function() {
        // destroy the loading level text
        LoadingText.destroy();


        snake = [];
        apple = {};
        squareSize = 15;
        score = 0;
        speed = 0;
        updateDelay = 0;
        direction = 'right';
        new_direction = null;
        addNew = false; // A variable used when an apple has been eaten.

        // Set up a Phaser controller for keyboard input.
        cursors = game.input.keyboard.createCursorKeys();


        // initializing map
        map = game.add.tilemap('level', 15, 15);
        map.addTilesetImage('tile');
        wall = map.createLayer(0);
        wall.resizeWorld();

        walls = game.add.physicsGroup();

        map.createFromTiles(0, null, 'tile', wall, walls);
        map.setCollision(20, true, this.wall);


        // Generate the initial snake stack. Our snake will be 10 elements long.
        for (var i = 0; i < 10; i++) {
            snake[i] = game.add.sprite(165 + i * squareSize, 150, 'snake'); // Parameters are (X coordinate, Y coordinate, image)
            game.physics.arcade.enable(snake[i]);
        }

        // Score.
        game.add.text(30, 20, "SCORE", textStyle_Key);
        scoreTextValue = game.add.text(90, 18, score.toString(), textStyle_Value);

        // Speed.
        game.add.text(500, 20, "LEVEL", textStyle_Key);
        speedTextValue = game.add.text(558, 18, level.toString(), textStyle_Value);

        // touch support

        game.input.onDown.add(function(pointer) {
            swipeCoordX = pointer.clientX;
            swipeCoordY = pointer.clientY;
        }, this);

        game.input.onUp.add(function(pointer) {
            swipeCoordX2 = pointer.clientX;
            swipeCoordY2 = pointer.clientY;

            if (swipeCoordX2 < swipeCoordX - swipeMinDistance) {
                if (direction != 'right')
                    new_direction = "left"
            } else if (swipeCoordX2 > swipeCoordX + swipeMinDistance) {
                if (direction != 'left')
                    new_direction = "right"
            } else if (swipeCoordY2 < swipeCoordY - swipeMinDistance) {
                if (direction != 'down')
                    new_direction = "up"
            } else if (swipeCoordY2 > swipeCoordY + swipeMinDistance) {
                if (direction != 'up')
                    new_direction = "down"
            }

        }, this);

        // Generate the first apple.
        this.generateApple();
    },

    update: function() {
        // check if snake overlay any of the wall
        game.physics.arcade.overlap(snake[snake.length - 1], walls, this.levelCollision, null, this);

        // Handle arrow key presses, while not allowing illegal direction changes that will kill the player.
        if (cursors.right.isDown && direction != 'left') {
            new_direction = 'right';
        } else if (cursors.left.isDown && direction != 'right') {
            new_direction = 'left';
        } else if (cursors.up.isDown && direction != 'down') {
            new_direction = 'up';
        } else if (cursors.down.isDown && direction != 'up') {
            new_direction = 'down';
        }

        speed = Math.min(10, Math.floor(score / 5));

        // Since the update function of Phaser has an update rate of around 60 FPS,
        // we need to slow that down make the game playable.

        // Increase a counter on every update call.
        updateDelay++;

        // Do game stuff only if the counter is aliquot to (10 - the game speed).
        // The higher the speed, the more frequently this is fulfilled,
        // making the snake move faster.
        if (updateDelay % (10 - speed) == 0) {
            // Snake movement
            var firstCell = snake[snake.length - 1],
                lastCell = snake.shift(),
                oldLastCellx = lastCell.x,
                oldLastCelly = lastCell.y;

            if (new_direction) {
                direction = new_direction;
                new_direction = null;
            }

            // Change the last cell's coordinates relative to the head of the snake, according to the direction.
            if (direction == 'right') {
                lastCell.x = firstCell.x + 15;
                lastCell.y = firstCell.y;
            } else if (direction == 'left') {
                lastCell.x = firstCell.x - 15;
                lastCell.y = firstCell.y;
            } else if (direction == 'up') {
                lastCell.x = firstCell.x;
                lastCell.y = firstCell.y - 15;
            } else if (direction == 'down') {
                lastCell.x = firstCell.x;
                lastCell.y = firstCell.y + 15;
            }


            // Place the last cell in the front of the stack.
            // Mark it as the first cell.
            snake.push(lastCell);
            firstCell = lastCell;

            // End of snake movement.


            // Increase length of snake if an apple had been eaten.
            // Create a block in the back of the snake with the old position of the previous last block (it has moved now along with the rest of the snake).
            if (addNew) {
                snake.unshift(game.add.sprite(oldLastCellx, oldLastCelly, 'snake'));
                addNew = false;
            }

            // Check for apple collision.
            this.appleCollision();

            // Check for collision with self. Parameter is the head of the snake.
            this.selfCollision(firstCell);

            // Check with collision with wall. Parameter is the head of the snake.
            this.wallCollision(firstCell);
        }


    },

    levelCollision: function(spriteThatCollided, tileThatCollided) {
        // end the game
        game.state.start('Game_Over');
    },

    generateApple: function() {
        // Chose a random place on the grid.
        // X is between 0 and 585 (39*15)
        // Y is between 0 and 435 (29*15);
        if (isAppleOver) {
            apple.destroy();
            isAppleOver = false;
        }
        var randomX = (Math.floor(Math.random() * 38) + 1) * squareSize,
            randomY = (Math.floor(Math.random() * 27) + 1) * squareSize;
        // Add a new apple.
        apple = game.add.sprite(randomX, randomY, 'apple');

        //check if apple overlay the walls
        game.physics.arcade.enable(apple);
        game.physics.arcade.overlap(apple, walls, this.reGenerateApple, null, this);
    },

    reGenerateApple: function() {
        // regenerate apple if it overlay the walls
        isAppleOver = true;
        this.generateApple();
    },

    appleCollision: function() {
        // Check if any part of the snake is overlapping the apple.
        // This is needed if the apple spawns inside of the snake.
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x == apple.x && snake[i].y == apple.y) {
                // Next time the snake moves, a new block will be added to its length.
                addNew = true;
                // Destroy the old apple.
                apple.destroy();
                // Make a new one.
                this.generateApple();
                // Increase score.
                score++;
                // Refresh scoreboard.
                scoreTextValue.text = score.toString();
            }
        }
    },

    selfCollision: function(head) {
        // Check if the head of the snake overlaps with any part of the snake.
        for (var i = 0; i < snake.length - 1; i++) {
            if (head.x == snake[i].x && head.y == snake[i].y) {
                // If so, go to game over screen.
                game.state.start('Game_Over');
            }
        }

    },

    wallCollision: function(head) {
        // Check if the head of the snake is in the boundaries of the game field.
        if (head.x >= 785 || head.x < 15 || head.y >= 435 || head.y < 15) {
            // If it's not in, we've hit a wall. Go to game over screen.
            game.state.start('Game_Over');
        }
    }

};
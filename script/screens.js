Game.Screen = {};
Game.Screen.startScreen = {
  enter: function () {
    Game._display.setOptions({layout: "rect", bg: "black", height: 21})
  },
  render: function (display) {
    display.drawText(1,1, "%c{coral}Dungeon Crawler");
    display.drawText(1,2, "press ENTER key to start game");
  },
  handleInput: function (inputData) {
    if (inputData.keyCode === ROT.VK_RETURN) {
      Game.switchScreen(Game.Screen.playScreen);
    }
  }
}
Game.Screen.playScreen = {
  _map: null,
  _player: null,
  
  enter: function () {
    Game._display.setOptions({layout: "tile", bg: "transparent", height: 10})
    let map = [];
    let width = 40;
    let height = 40;
    
    for (let x = 0; x < width; x++) {
        map.push([]);
        for (let y = 0; y < height; y++) {
            map[x].push(Game.Tile.nullTile);
        }
    }
    let generator = new ROT.Map.Cellular(width, height);
    generator.randomize(0.5);
    let totalIterations = 3;
    for (let i = 0; i < totalIterations - 1; i++) {
        generator.create();
    }
    generator.create(function(x,y,v) {
        if (v === 1) {
            map[x][y] = Game.Tile.floorTile;
        } else {
            map[x][y] = Game.Tile.wallTile;
        }
    });
    
    this._player = new Game.Entity(Game.PlayerTemplate);
    this._map = new Game.Map(map, this._player);
    this._map.engine.start();
  },
  render: function (display) {
    let screenWidth = Game.getScreenWidth();
    let screenHeight = Game.getScreenHeight();
    let info = Game._infoDisplay;
    let messageColor = '%c{white}%b{black}';
    
    let topLeftX = Math.max(0, this._player.X - (screenWidth/2));
    topLeftX = Math.min(topLeftX, this._map.width - screenWidth);

    let topLeftY = Math.max(0, this._player.Y - (screenHeight / 2));
    topLeftY = Math.min(topLeftY, this._map.height - screenHeight);
    
    for (let x = topLeftX; x < topLeftX + screenWidth; x++) {
      for (let y = topLeftY; y < topLeftY + screenHeight; y++) {
        let tile = this._map.getTile(x,y);
        display.draw(x - topLeftX,
                     y - topLeftY,
                    tile.char,
                    tile.foreground,
                    tile.background);
      }
    }
    display.draw(
      this._player.X - topLeftX,
      this._player.Y - topLeftY,
      this._player.char,
      this._player.foreground,
      this._player.background);

    let entities = this._map.entities;
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      
      if (entity.X >= topLeftX && entity.Y >= topLeftY &&
          entity.X < topLeftX + screenWidth &&
          entity.Y < topLeftY + screenHeight) {

        display.draw(
            entity.X - topLeftX, 
            entity.Y - topLeftY,    
            entity.char, 
            entity.foreground, 
            entity.background
        );
      }
      
    }
    //messaging screen
    info.clear();
    let messages = this._player.getMessages();
    let messageY = 0;
    for (let i = 0; i < messages.length; i++) {
      messageY += info.drawText(
        0,
        messageY,
        messageColor + messages[i]
      );
    }
    let enemiesLeft = entities.filter(el => el.hasMixin('Actor') && !el.hasMixin('PlayerActor'));
    if (enemiesLeft.length === 0) {
      info.clear();
      info.drawText(0, 0, '%c{white}BOSS enters the dungeon!');
      this._map.addEntityAtRandomPosition(new Game.Entity(Game.BossTemplate));
    }
    let enemiesAmount = `${messageColor} Enemies: ${enemiesLeft.length}`
    info.drawText(0, 5, enemiesAmount);
    
    let statsHP = `${messageColor} HP: ${this._player.getHp()}/${this._player.getMaxHp()}`;
    let statsAttack = `${messageColor} Attack: ${this._player.getAttackValue()}`;
    let statsDefense =  `${messageColor} Defense: ${this._player.getDefenseValue()}`;
    let statsPickaxes =  `${messageColor} Pickaxes: ${this._player.getPickaxes()}`;
    info.drawText(0, 6, statsHP);
    info.drawText(0, 7, statsAttack);
    info.drawText(0, 8, statsDefense); 
    info.drawText(0, 9, statsPickaxes); 
  },
  move: function (dX, dY) {
    let newX = this._player.X + dX;
    let newY = this._player.Y + dY;
    this._player.tryMove(newX, newY, this._map)
  },
  handleInput: function (inputData) {
    if (inputData.keyCode === ROT.VK_L) {
      Game.switchScreen(Game.Screen.winScreen);
    } else if (inputData.keyCode === ROT.VK_ESCAPE) {
      Game.switchScreen(Game.Screen.loseScreen);
    } else {
      if (inputData.keyCode === ROT.VK_A) {
        this.move(-1, 0);
      } else if (inputData.keyCode === ROT.VK_S) {
        this.move(0, 1);
      } else if (inputData.keyCode === ROT.VK_D) {
        this.move(1, 0);
      } else if (inputData.keyCode === ROT.VK_W) {
        this.move(0, -1);
      } else if (inputData.keyCode === ROT.VK_SPACE) {

      } else {
        return
      }
      this._map.engine.unlock();
    }
  }
}
Game.Screen.winScreen = {
  enter: function() {
    Game._display.setOptions({layout: "rect", bg: "black", height: 21})
  },
  render: function (display) {
    display.drawText(1, 1, '%c{coral}Congratulations, you win!');
    display.drawText(1, 2, "press ENTER key to start again");
  },
  handleInput: function (inputData) {
    if (inputData.keyCode === ROT.VK_RETURN) {
      Game.switchScreen(Game.Screen.playScreen)
    }
  }
}
Game.Screen.loseScreen = {
  enter: function() {
    Game._display.setOptions({layout: "rect", bg: "black", height: 21})
  },
  render: function (display) {
    display.drawText(1, 1, '%c{coral}Sorry, you died :(');
    display.drawText(1, 2, "press ENTER key to start again");
  },
  handleInput: function (inputData) {

    if (inputData.keyCode === ROT.VK_RETURN) {
      Game.switchScreen(Game.Screen.playScreen)
    }

  }
}


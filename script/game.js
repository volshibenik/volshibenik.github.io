let Game = {
  _display: null,
  _currentScreen: null,
  _screenWidth: 20,
  _screenHeight: 10,
  _infoDisplay: null,

  init: function (atlas) {
    let options = {
        layout: "tile",
        bg: "transparent",
        tileWidth: 32,
        tileHeight: 32,
        tileSet: atlas,
        height:10,
        tileMap: {
            "H": [0, 0],
            "A": [32, 0],
            "W": [64, 0],
            "@": [96, 0],
            "s": [128, 0],
            "#": [160, 0],
            ".": [192, 0],
            "b": [224, 0],
            "w": [256, 0],
            " ": [288, 0]
        }
    }
    this._display = new ROT.Display(options);
    this._infoDisplay = new ROT.Display({width:30, height:10});
    let game = this;
    window.addEventListener('keydown', function (e) {
      if (game._currentScreen !== null) {
        game._currentScreen.handleInput(e);
      }
    });
  },
  refresh: function () {
    this._display.clear();
    this._currentScreen.render(this._display);
  },
  getDisplay: function () {
    return this._display;
  },
  getScreenWidth: function () {
    return this._screenWidth;
  },
  getScreenHeight: function () {
    return this._screenHeight;
  },
  switchScreen: function (screen) {
    this.getDisplay().clear();
    this._currentScreen = screen;
    if(this._currentScreen !== null) {
      this._currentScreen.enter();
      this.refresh();
    }
  }
}
function startGame() {
  let atlas = document.createElement("img");
  atlas.src = "img/atlas_new.png";
  atlas.onload = Game.init(atlas);
  document.body.appendChild(Game.getDisplay().getContainer());
  document.body.appendChild(Game._infoDisplay.getContainer());
  Game.switchScreen(Game.Screen.startScreen)
}
window.onload = startGame

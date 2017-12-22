Game.Tile = class extends Game.Glyph {
  constructor(properties) {
    super(properties);
    this._isWalkable = properties['isWalkable'] || false;
    this._isDiggable = properties['isDiggable'] || false;
  }
  isWalkable() {
    return this._isWalkable;
  }
  isDiggable() {
    return this._isDiggable;
  }
}
Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
  character: '.',
  isWalkable: true
});
Game.Tile.wallTile = new Game.Tile({
  character: '#',
  isDiggable: true,
  foreground: 'yellow'
});


Game.Map = class  {
  constructor(tiles, player) {
    this._entities = [];
    this._scheduler = new ROT.Scheduler.Simple();
    this._engine = new ROT.Engine(this._scheduler);
    this._tiles = tiles;
    this._width = tiles.length;
    this._height = tiles[0].length;

    this.addEntityAtRandomPosition(player);
    for (let i = 0; i < 12; i++) {
      this.addEntityAtRandomPosition(new Game.Entity(Game.WolfTemplate));
    }
    for (let i = 0; i < 10; i++) {
      this.addEntityAtRandomPosition(new Game.Entity(Game.BoarTemplate));
    }
    for (let i = 0; i < 5; i++) {
      this.addEntityAtRandomPosition(new Game.Entity(Game.HealTemplate));
    }
    for (let i = 0; i < 2; i++) {
      this.addEntityAtRandomPosition(new Game.Entity(Game.ArmorTemplate));
    }
    for (let i = 0; i < 3; i++) {
      this.addEntityAtRandomPosition(new Game.Entity(Game.WeaponTemplate));
    }
  }
  dig(x,y) {
    if (this.getTile(x, y).isDiggable()) {
      this._tiles[x][y] = Game.Tile.floorTile;
      
    }
  }
  isEmptyFloor (x, y) {
    return this.getTile(x, y) === Game.Tile.floorTile &&
           !this.getEntityAt(x, y);
  }
  addEntity (entity) {
    if (entity.X < 0 || entity.X >= this._width || 
        entity.Y < 0 || entity.Y >= this._height) {
          throw new Error('entity out of bounds');
    }
    entity.map = this;
    this._entities.push(entity);
    if (entity.hasMixin('Actor')) {
      this._scheduler.add(entity, true);
    }
  }
  addEntityAtRandomPosition (entity) {
    let position = this.randomFloorPosition;
    entity.X = position.x;
    entity.Y = position.y;
    this.addEntity(entity);
  }
  removeEntity (entity) {
    this._entities = this._entities.filter((e)=>e!==entity);
    if (entity.hasMixin('Actor')) {
      this._scheduler.remove(entity);
    }
  }
  getTile(x,y) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      return Game.Tile.nullTile;
    } else {
      return this._tiles[x][y] || Game.Tile.nullTile;
    }
  }
  getEntityAt (x,y) {
    return this._entities.find((e) => e.X === x && e.Y === y) || false

  }
  get width() {
    return this._width;
  }
  get height() {
      return this._height;
  }
  get randomFloorPosition() {
    let x = Math.floor(Math.random() * this._width);
    let y = Math.floor(Math.random() * this._height);

    return this.isEmptyFloor(x,y)? {x, y} : this.randomFloorPosition 
  }
  get engine() {
    return this._engine;
  }
  get entities  () {
    return this._entities;
  }
};





Game.Entity = class extends Game.Glyph {
  constructor(properties) {
    super(properties);
    this._name = properties['name'] || '';
    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;
    this._map = null;
    this._attachedMixins = {};
    this._attachedMixinGroups = {};

    let mixins = properties['mixins'] || [];
    for (let i = 0; i < mixins.length; i++) {
      for (let key in mixins[i]) {
        if (key !== 'init' && key !== 'name' && !this.hasOwnProperty(key)) {
          this[key] = mixins[i][key];
        }
      }
      this._attachedMixins[mixins[i].name] = true;
      if(mixins[i].groupName) {
        this._attachedMixinGroups[mixins[i].groupName] = true;
      }
      if (mixins[i].init) {
        mixins[i].init.call(this, properties);
      }
    }
  }
  hasMixin(obj) {
    if (typeof obj === 'object') {
      return this._attachedMixins[obj.name];
    } else {
      return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
  }
  set X(x) {
    this._x = x;
  }
  set Y(y) {
    this._y = y;
  }
  set map(map) {
    this._map = map;
  }
  get name() {
    return this._name;
  }
  get X() {
    return this._x;
  }
  get Y() {
    return this._y;
  }
  get map() {
    return this._map;
  }
}

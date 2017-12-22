Game.Mixins = {};
Game.Mixins.Moveable = {
  name: 'Moveable',
  tryMove: function (x, y, map) {
    let tile = map.getTile(x, y);
    let target = map.getEntityAt(x, y);
    if (target) {
      if (target.hasMixin('Consummable') && this.hasMixin('PlayerActor')){
        target.apply(this);
        target.map.removeEntity(target);
        this._x = x;
        this._y = y;
      } if (this.hasMixin('Attacker')) {
        this.attack(target);
      } else {
      }
    } else if (tile.isWalkable()) {
      this._x = x;
      this._y = y;
    } else if (tile.isDiggable() && this.hasMixin('PlayerActor')) {
      map.dig(x, y);
      this._pickaxes !== 0 ? this._pickaxes-- : this._hp-- &&
        Game.sendMessage(this, 'You hurt yourself while digging with bare hands');
    }
  }
}
Game.Mixins.Destructible = {
  name: 'Destructible',
  init: function(template) {
    this._maxHp = template['maxHp'] || 10;
    this._hp = template['hp'] || this._maxHp;
    this._defenseValue = template['defenseValue'] || 0;
  },
  getHp: function() {
    return this._hp;
  },
  getMaxHp: function() {
    return this._maxHp;
  },
  getDefenseValue: function() {
    return this._defenseValue;
  },
  takeDamage: function (attacker, damage) {
    this._hp -= damage;
    if (this._hp <= 0) {
      Game.sendMessage(attacker, 'You kill the %s', [this.name]);
      Game.sendMessage(this, 'You die');
      if (this.hasMixin('PlayerActor') || this.hasMixin('BossActor')) {
        Game.refresh();
        this.act();
      } else {
        this.map.removeEntity(this);
      }
    }
  }
}
Game.Mixins.Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init: function(template) {
    this._attackValue = template['attackValue'] || 1;
    this._pickaxes = template['pickaxes'] || 0;
  },
  getAttackValue: function() {
    return this._attackValue;
  },
  getPickaxes: function() {
    return this._pickaxes;
  },
  attack: function(target) {
    if (target.hasMixin('Destructible')) {
      let attack = this.getAttackValue();
      let defense = target.getDefenseValue();
      let max = Math.max(0, attack - defense);
      let damage = 1 + Math.floor(Math.random() * max);

      Game.sendMessage(this, 'You strike the %s for %d damage!', [target.name, damage]);
      Game.sendMessage(target, 'The %s strikes you for %d damage', [this.name, damage]);
      target.takeDamage(this, damage);
    }
  }
}
Game.Mixins.MessageRecipient = {
  name: 'MessageRecipient',
  init: function(template) {
    this._messages = [];
  },
  receiveMessage: function(message) {
    this._messages.push(message);
  },
  getMessages: function() {
    return this._messages;
  },
  clearMessages: function() {
    this._messages = [];
  }
}
Game.sendMessage = function(recipient, message, args) {
  if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
    if (args) {
      message = vsprintf(message, args);
    }
    recipient.receiveMessage(message);
  }
}
Game.Mixins.Monster = {
  name: 'Monster',
  beHostile: function () {
    let playerAdjacent = this.smellPlayer(this._x-1, this._y) ||
        this.smellPlayer(this._x, this._y-1) ||
        this.smellPlayer(this._x, this._y+1) ||
        this.smellPlayer(this._x+1, this._y)
    if (playerAdjacent) {
      this.attack(playerAdjacent);
    } else {
      this.move();
    }
  },
  smellPlayer: function (x,y) {
    let enemy = this._map.getEntityAt(x,y);
    if (enemy) {
      return enemy.hasMixin('PlayerActor') ? enemy : false
    }
    return false
  },
  move: function () {
    let random = Math.floor(Math.random() * 7);
    switch (random) {
      case 0:
        this.tryMove(this._x+1, this._y, this._map)
        break;
      case 1:
        this.tryMove(this._x-1, this._y, this._map)
        break;
      case 2:
        this.tryMove(this._x, this._y+1, this._map)
        break;
      case 3:
        this.tryMove(this._x, this._y-1, this._map)
        break;
      default:
        break;
    }
  }
}
Game.Mixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act: function () {
    if (this._hp <= 0) {
      Game.switchScreen(Game.Screen.loseScreen);
    }
    Game.refresh();
    this.map.engine.lock();
    this.clearMessages();
  }
}
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'transparent',
  maxHp: 30,
  attackValue: 10,
  pickaxes: 30,
  mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor, 
           Game.Mixins.Attacker, Game.Mixins.Destructible,
           Game.Mixins.MessageRecipient]
}

Game.Mixins.Consummable = {
  name: 'Consummable',
  groupName: 'Consummable',
  init: function(template) {
    this._maxHp = template['maxHp'] || 0;
    this._hp = template['hp'] || 0;
    this._defenseValue = template['defenseValue'] || 0;
    this._attackValue = template['attackValue'] || 0;
  },
  apply: function (player) {
    switch (this._name) {
      case 'Heal':
        let prevHp = player._hp;
        player._maxHp += this._maxHp;
        player._hp += this._hp;
        if (player._hp >= player._maxHp) {
          player._hp = player._maxHp;
        }
        Game.sendMessage(player, 'You found healing potion!');
        Game.sendMessage(player, 'You healed for %s HP. You feel stronger!' , [player._hp - prevHp]);
        break;
      case 'Armor':
        player._defenseValue += this._defenseValue;
        Game.sendMessage(player, 'You found better armor!');
        Game.sendMessage(player, 'You acquired %s defense point' , [this._defenseValue]);
        break;
      case 'Weapon':
        player._attackValue += this._attackValue;
        Game.sendMessage(player, 'You found weapon!');
        Game.sendMessage(player, 'Your attack increased by %s' , [this._attackValue]);
        break;
      default:
        break;
    }
  }
}
Game.HealTemplate = {
  name: 'Heal',
  character: 'H',
  foreground: 'white',
  background: 'transparent',
  hp: 10,
  maxHp: 5,
  mixins: [Game.Mixins.Consummable]
}
Game.ArmorTemplate = {
  name: 'Armor',
  character: 'A',
  foreground: 'white',
  background: 'transparent',
  defenseValue: 1,
  mixins: [Game.Mixins.Consummable]
}

Game.WeaponTemplate = {
  name: 'Weapon',
  character: 'W',
  foreground: 'white',
  background: 'transparent',
  attackValue: 2,
  mixins: [Game.Mixins.Consummable]
}

Game.Mixins.BoarActor = {
  name: 'BoarActor',
  groupName: 'Actor',
  act: function () {
    this.beHostile();
  }
}
Game.BoarTemplate = {
  name: 'Boar',
  character: 'b',
  foreground: 'green',
  background: 'transparent',
  maxHp: 8,
  attackValue: 2,
  mixins: [Game.Mixins.BoarActor, Game.Mixins.Moveable, 
           Game.Mixins.Destructible, Game.Mixins.Attacker,
           Game.Mixins.Monster]
}
Game.Mixins.WolfActor = {
  name: 'WolfActor',
  groupName: 'Actor',
  act: function () {
    this.beHostile();
  }
}
Game.WolfTemplate = {
  name: 'Wolf',
  character: 'w',
  foreground: 'gray',
  background: 'transparent',
  maxHp: 5,
  mixins: [Game.Mixins.WolfActor, Game.Mixins.Moveable, 
           Game.Mixins.Destructible, Game.Mixins.Attacker,
           Game.Mixins.Monster]
}
Game.Mixins.BossActor = {
  name: 'BossActor',
  groupName: 'Actor',
  act: function () {
    if (this._hp <= 0) {
      Game.switchScreen(Game.Screen.winScreen);
    }
    this.beHostile();
  }
}
Game.BossTemplate = {
  name: 'boss',
  character: 's',
  foreground: 'green',
  background: 'transparent',
  maxHp: 80,
  attackValue: 6,
  mixins: [Game.Mixins.BossActor, Game.Mixins.Moveable, 
           Game.Mixins.Destructible, Game.Mixins.Attacker,
           Game.Mixins.Monster]
}
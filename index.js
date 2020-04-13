class WriteLogOption {
  constructor() {
    this.message = new String();
  }
}

class RandTextOption {
  constructor() {
    this.range = new Number();
  }
}

class RandOption {
  constructor() {
    this.maxDecimalHouse = 10;
  }
}

class ControlMovementOption {
  constructor() {
    this['event-key'] = new String;
    this['event-code'] = new Number;
    this['event-type'] = new String;
  }
}

class NewPositionOption {
  constructor() {
    this.x = new Number();
    this.y = new Number();
  }
}

class ObstaculePositionOption {
  constructor() {
    this.div = document.createElement("div");
    this['min-width'] = new Number;
    this['max-width'] = new Number;
    this['min-height'] = new Number;
    this['max-height'] = new Number;
    this.position = {
      local: "",
      x: 0
    };
  }
}

class Util {
  playerId = "player-um";
  gameId = "game-map";
  logId = "game-log";
  bodyId = "body";
  obstaculeClass = "obstacule";
  intervalTime = 1000;
  movements = [
    // up
    38,
    // left
    37,
    // bottom
    40,
    // right
    39
  ];
  gameStart = false;
  gameStarted = false;
  gameEnd = false;
  initialInterval = null;

  constructor() {
    this.characters = {
      letter: "abcdefghijklmnopqrstuvxywz",
      number: "0123456789"
    };
    this.window = window;
    this.document = document;
    this.gameDiv = this.document.createElement('div');
    this.gameLogDiv = this.document.createElement('div');
    this.playerDiv = this.document.createElement('div');
    this.body = this.document.getElementById(this.bodyId);
  }

  async getGameOffSet(div = this.document.createElement('div')) {
    let { offsetWidth, offsetHeight } = div;
    return { offsetWidth: offsetWidth, offsetHeight: offsetHeight };
  }

  async getEventPropertiesMove(event) {
    let { key, keyCode, type } = event;

    return {
      'event-key': key,
      'event-code': keyCode,
      'event-type': type
    };
  }

  async rand(min, max, tocalc = new RandOption) {
    while (max > tocalc.maxDecimalHouse) {
      tocalc.maxDecimalHouse *= 10;
    }

    let randValue = Math.floor(Math.random() * (tocalc.maxDecimalHouse + 1));
    if (randValue < min || randValue > max) return await this.rand(min, max, tocalc);
    return randValue;
  }

  async randText(option = new RandTextOption) {
    let text = "";

    for (let x = 0; x < option.range; x++) {
      let keys = Object.keys(this.characters);
      let key = keys[await this.rand(0, keys.length - 1)];
      let len = this.characters[key].length - 1;

      text += this.characters[key][await this.rand(0, len)];
    }

    return text;
  }
}

class GameConfig extends Util {
  constructor() {
    super();
    this.playerPosition = {
      x: 0,
      y: 0,
      movimentPixel: 1
    };
    this.playerOffSet = {
      'top-bottom': 14,
      'left-right': 14
    }
    this.levelDiv = document.createElement('div');
    this.mapOffSet = {
      'min-width': 0,
      'max-width': 0,
      'min-height': 0,
      'max-height': 0
    }
    this.timer = 0;
    this.level = 1;
    this.pointLevel = 2;
    this.point = 0;
    this.obstacules = [];
    this.minWidthObstacule = 30;
    this.maxWidthObstacule = 50;
    this.minHeightObstacule = 60
    this.maxHeightObstacule = 190;
    this.obstaculesPosition = ["top", "bottom"];
  }



  async newObstacule() {
    let obstacule = {
      div: this.document.createElement("div"),
      'min-width': this.minWidthObstacule,
      'max-width': 0,
      'min-height': this.minHeightObstacule,
      'max-height': 0,
      position: {
        local: "",
        x: 0
      }
    };

    obstacule.div.id = await this.randText({ range: 30 });
    let offsets = await Promise.all([
      this.rand(this.minWidthObstacule, this.maxWidthObstacule),
      this.rand(this.minHeightObstacule, this.maxHeightObstacule),
      this.rand(1, 10)
    ]);

    obstacule['max-width'] = offsets[0];
    obstacule['max-height'] = offsets[1];
    obstacule['position']['local'] = this.obstaculesPosition[offsets[2] % 2];


    obstacule.div.className += `${this.obstaculeClass}-${obstacule['position']['local']}`;
    obstacule.div.style.width = `${obstacule['max-width']}px`;
    obstacule.div.style.height = `${obstacule['max-height']}px`;
    obstacule.div.style.right = `${obstacule['position']['x']}px`;

    this.gameDiv.appendChild(obstacule.div);

    // this.obstacules.push(obstacule);
    await this.movementObstacule(obstacule);
  }

  validateUserPositionObstacule(obstacule = new ObstaculePositionOption) {
    let original = {
      x: {
        min: 0,
        max: 0,
      },
      y: {
        min: 0,
        max: 0,
      }
    }

    original.x.min = (this.mapOffSet['max-width'] - (obstacule['max-width'] + obstacule['position']['x']));
    original.x.max = (this.mapOffSet['max-width'] - (obstacule['position']['x']));

    switch (obstacule['position']['local']) {
      case "top":
        original.y.min = 0;
        original.y.max = this.mapOffSet["max-height"] - (this.mapOffSet["max-height"] - obstacule['max-height']);

        if (
          this.playerPosition.x + 17 > (original.x.min) &&
          this.playerPosition.x + 2 < (original.x.max) &&
          this.playerPosition.y <= original.y.max) {
          return true;
        } else {
          return false;
        }
      case "bottom":
        original.y.min = 0;
        original.y.max = (this.mapOffSet["max-height"] - obstacule['max-height']);

        if (
          this.playerPosition.x + 17 > (original.x.min) &&
          this.playerPosition.x + 2 < (original.x.max) &&
          this.playerPosition.y + 16 >= original.y.max
        ) {
          return true
        } else {
          return false;
        }
    }
  }

  movementObstacule(obstacule = new ObstaculePositionOption) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (this.gameEnd) return true;

        if (this.validateUserPositionObstacule(obstacule)) {
          this.gameEnd = true;
          return true;
        }

        if (obstacule.position.x + obstacule['max-width'] > this.mapOffSet['max-width'] - 6) {
          obstacule['max-width'] -= this.playerPosition.movimentPixel + 1;
          obstacule.div.style.width = `${obstacule['max-width']}px`;
          if (obstacule['max-width'] <= 5) {
            this.gameDiv.removeChild(obstacule.div);
            return true;
          }
          resolve(await this.movementObstacule(obstacule));
        } else {
          obstacule['position']['x'] += this.playerPosition.movimentPixel + 1;
          obstacule.div.style.right = `${obstacule['position']['x']}px`;
          resolve(await this.movementObstacule(obstacule));
        }
      }, 50);
    });
  }

  async setNewLevel() {
    this.timer += 1;

    if (!this.levelDiv.id) {
      this.levelDiv.id = "game-level";
      this.gameDiv.appendChild(this.levelDiv);
      this.levelDiv.innerText = `Pointer ${this.point} Level ${this.level}`;
    }
    switch (this.timer) {
      case 10:
        this.level += 1;
        this.pointLevel += 2;
        this.point += this.pointLevel;
        this.playerPosition.movimentPixel = 2;
        this.levelDiv.innerText = `Pointer ${this.point} Level ${this.level}`;
        this.writeLog({ message: `Level ${this.level}` });
        return true;
      case 30:
        this.level += 1;
        this.pointLevel += 2;
        this.point += this.pointLevel;
        this.playerPosition.movimentPixel = 3;
        this.levelDiv.innerText = `Pointer ${this.point} Level ${this.level}`;
        this.writeLog({ message: `Level ${this.level}` });
        return true;
      case 50:
        this.level += 1;
        this.pointLevel += 2;
        this.point += this.pointLevel;
        this.playerPosition.movimentPixel = 4;
        this.levelDiv.innerText = `Pointer ${this.point} Level ${this.level}`;
        this.writeLog({ message: `Level ${this.level}` });
        return true;
      case 70:
        this.level += 1;
        this.pointLevel += 2;
        this.point += this.pointLevel;
        this.playerPosition.movimentPixel = 5;
        this.levelDiv.innerText = `Pointer ${this.point} Level ${this.level}`;
        this.writeLog({ message: `Level ${this.level}` });
        return true;
      default:
        return true;
    }
  }

  setNewPoint() {
    this.point += this.pointLevel;
    this.levelDiv.innerText = `Pointer ${this.point} Level ${this.level}`;
    return true;
  }

  setNewPosition(option = new NewPositionOption) {
    this.playerPosition.x = option.x;
    this.playerPosition.y = option.y;

    this.playerDiv.style.marginTop = `${option.y}px`;
    this.playerDiv.style.marginLeft = `${option.x}px`;
    return true;
  }
}

class Config extends GameConfig {
  constructor() { super(); }

  async setElement(elementName) {
    switch (elementName) {
      case "game":
        if (this.gameDiv) this.gameDiv = this.document.getElementById(this.gameId);
        return true;
      case "log":
        if (this.gameLogDiv) this.gameLogDiv = this.document.getElementById(this.logId);
        return true;
      default:
        return true;
    }
  }

  async getGameDateLog() {
    let date = new Date();
    return date.toLocaleString() + ` (${date.getTime()}) : `;
  }

  async writeLog(option = new WriteLogOption) {

    let log = this.document.createElement('div');
    log.innerText = await this.getGameDateLog() + option.message + ".";
    this.gameLogDiv.appendChild(log);
    this.gameLogDiv.scrollTop = this.gameLogDiv.scrollHeight;
  }

  async setInitialSize() {
    let { innerWidth, innerHeight } = this.window;

    this.body.style.width = `${innerWidth}px`;
    this.body.style.height = `${innerHeight}px`;
    return true;
  }

  async renderLog() {
    await this.setElement('log');
    this.writeLog({ message: "press enter to start" });
  }

  async setPlayer() {
    let offset = await this.getGameOffSet(this.gameDiv);
    this.mapOffSet['max-width'] = offset.offsetWidth;
    this.mapOffSet['max-height'] = offset.offsetHeight;

    this.playerPosition.y = (this.mapOffSet['max-height'] / 2);

    this.playerDiv.id = this.playerId;
    this.playerDiv.style.marginLeft = `${this.playerPosition.x}px`;
    this.playerDiv.style.marginTop = `${this.playerPosition.y}px`;
    this.gameDiv.appendChild(this.playerDiv);

    this.writeLog({ message: `Player start position (x ${this.playerPosition.x}, y ${this.playerPosition.y})` });
  }
}

class Controller extends Config {
  constructor() { super(); }

  async start() {
    this.gameStarted = true;
    await this.setElement('game');
    await this.setPlayer();
  }

  async controlMovement(option = new ControlMovementOption) {
    let message = {
      last: `player last position (x @x, y @y)`,
      new: `player new position (x @x, y @y)`
    };

    if (this.gameEnd) return true;
    switch (option['event-code']) {
      // up
      case 38:
        await this.writeLog({ message: message.last.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });

        if (this.playerPosition.y == this.mapOffSet['min-height']) return true;
        this.playerPosition.y -= this.playerPosition.movimentPixel;
        for (let x = this.mapOffSet['min-height']; this.playerPosition.y < x; this.playerPosition.y++);

        await this.writeLog({ message: message.new.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });
        this.setNewPoint();
        this.setNewPosition({ x: this.playerPosition.x, y: this.playerPosition.y });
        return true;
      // down
      case 40:
        await this.writeLog({ message: message.last.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });

        if (this.playerPosition.y == this.mapOffSet['max-height'] - this.playerOffSet['top-bottom']) return true;
        this.playerPosition.y += this.playerPosition.movimentPixel;
        for (let x = this.mapOffSet['max-height'] - this.playerOffSet['top-bottom']; x < this.playerPosition.y; this.playerPosition.y--);

        await this.writeLog({ message: message.new.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });
        this.setNewPoint();
        this.setNewPosition({ x: this.playerPosition.x, y: this.playerPosition.y });
        return true;
      // left
      case 37:
        await this.writeLog({ message: message.last.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });

        if (this.playerPosition.x == this.mapOffSet['min-width']) return true;
        this.playerPosition.x -= this.playerPosition.movimentPixel;
        for (let x = this.mapOffSet['min-width']; x > this.playerPosition.x; this.playerPosition.x++);

        await this.writeLog({ message: message.new.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });
        this.setNewPoint();
        this.setNewPosition({ x: this.playerPosition.x, y: this.playerPosition.y });
        return true;
      // right
      case 39:
        await this.writeLog({ message: message.last.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });

        if (this.playerPosition.x == this.mapOffSet['max-width'] - this.playerOffSet['left-right']) return true;
        this.playerPosition.x += this.playerPosition.movimentPixel;
        for (let x = this.mapOffSet['max-width'] - this.playerOffSet['left-right']; x < this.playerPosition.x; this.playerPosition.x--);

        await this.writeLog({ message: message.new.replace(/\@x/g, this.playerPosition.x).replace(/\@y/g, this.playerPosition.y) });
        this.setNewPoint();
        this.setNewPosition({ x: this.playerPosition.x, y: this.playerPosition.y });
        return true;
      default:
        return true;
    }
  }
}


class MyEvent extends Controller {
  constructor() {
    super();

    this.window.onkeydown = (event) => this.onEvent(event);
    this.window.onresize = (event) => this.onResize(event);
  }


  async onEvent(event) {
    let control = await this.getEventPropertiesMove(event);

    if (control['event-code'] == 13 && !this.gameStart) {
      this.writeLog({ message: "Game started" });
      return (this.gameStart = true);
    };
    if (!this.gameStart) return true;

    this.controlMovement(control);
  }

  async onResize(event) {
    let { innerWidth, innerHeight } = event.target;
    this.body.style.width = `${innerWidth}px`;
    this.body.style.height = `${innerHeight}px`;
  }
}

class Game extends MyEvent {
  constructor() {
    super();
  }

  async run() {
    this.setInitialSize();
    this.initialInterval = setInterval(() => {
      if (this.gameStart) {
        if (!this.gameStarted) {
          this.start();
        }
      }
      if (this.gameEnd)
        return true;
    }, 100);
    setInterval(async () => {
      if (this.gameStart)
        if (!this.gameEnd)
          this.newObstacule();

    }, (this.intervalTime * 10) / 2);
    setInterval(async () => {
      if (this.gameStart)
        if (!this.gameEnd)
          await this.setNewLevel();
    }, this.intervalTime);
    await this.renderLog();
  }
}


window.onload = function () {
  (new Game).run();
}





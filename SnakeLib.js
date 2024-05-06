var SnakeLib = {

  General: {},
  Settings: {},
  HTML: {},
  Fruit: {},

  Init: function(_MultiPlayer)
  {
    SnakeLib.Settings.MultiPlayer = _MultiPlayer;
    SnakeLib.Settings.Timer = "infinite";
    SnakeLib.Settings.ShowTimer = false;
    SnakeLib.Settings.ShowScore = false;

    canvas = SnakeLib.HTML.Canvas;
    ctx = canvas.getContext("2d");
    SnakeLib.General.Width = canvas.width;
    SnakeLib.General.Height = canvas.height;
    SnakeLib.General.Directions = ["up","down","right","left"];

    SnakeLib.General.FullFruitRadius = 15;
    SnakeLib.General.FullSnakeRadius = 12;
    SnakeLib.General.InitSnakeLength = 20;

    SnakeLib.Player = new SnakeLib.Snake();
    if (SnakeLib.Settings.MultiPlayer) {
      SnakeLib.Player2 = new SnakeLib.Snake();
    }

    SnakeLib.Fruit.Red = new SnakeLib.Fruit("#ff0000");
    SnakeLib.Fruit.Red.Calc();
    SnakeLib.Fruit.Green = new SnakeLib.Fruit("#00ff00");
    SnakeLib.Fruit.Green.Calc();
    SnakeLib.Fruit.Blue = new SnakeLib.Fruit("#0000ff");
    SnakeLib.Fruit.Blue.Calc();
  },

  Point: function (x,y)
  {
    this.X=x;this.Y=y;
  },

  Snake: function()
  {
    this.Pos= [];
    this.Pos[0] = new SnakeLib.Point(~~(Math.random()*SnakeLib.General.Width),~~(Math.random()*SnakeLib.General.Height));
    this.Direction = SnakeLib.General.Directions[Math.round(Math.random()*3)];
    this.Radius = SnakeLib.General.FullSnakeRadius;
    this.SnakeLength = SnakeLib.General.InitSnakeLength;
    this.Velocity = 1;
    this.Score = 0;
    this.PosCount = 0;
    this.Color = "#000";
    this.Name = "Snake";

    this.Draw = function(){
      this.Move();
      this.HandleFruitCollision(SnakeLib.Fruit.Red,SnakeLib.General.InitSnakeLength,this.SnakeLength,0);
      this.HandleFruitCollision(SnakeLib.Fruit.Green,0,this.SnakeLength*2,0);
      this.HandleFruitCollision(SnakeLib.Fruit.Blue,SnakeLib.General.InitSnakeLength*2,0,0);
      this.HandleSnakeCollision(this);
      if (SnakeLib.Settings.MultiPlayer)
        (this == SnakeLib.Player ? this.HandleSnakeCollision(SnakeLib.Player2) : this.HandleSnakeCollision(SnakeLib.Player));

      ctx.beginPath();
      ctx.fillStyle = this.Color;
      for (var i=0;i<this.SnakeLength;i+=1){
        if (this.Pos[i]) {
          ctx.rect(this.Pos[i].X-this.Radius/2,this.Pos[i].Y-this.Radius/2,this.Radius,this.Radius);
        }
      }
      ctx.fill();
    };

    this.Move = function(){
      switch (this.Direction) {
        case "down": if (this.Pos[0].Y + this.Velocity < SnakeLib.General.Height) this.Pos[0].Y += this.Velocity; else this.Pos[0].Y = 0; break;
        case "up": if (this.Pos[0].Y - this.Velocity > 0) this.Pos[0].Y -= this.Velocity; else this.Pos[0].Y = SnakeLib.General.Height; break;
        case "left": if (this.Pos[0].X - this.Velocity > 0) this.Pos[0].X -= this.Velocity; else this.Pos[0].X = SnakeLib.General.Width; break;
        case "right": if (this.Pos[0].X + this.Velocity < SnakeLib.General.Width) this.Pos[0].X += this.Velocity; else this.Pos[0].X = 0; break;
      }
      this.Pos[this.PosCount] = new SnakeLib.Point(this.Pos[0].X,this.Pos[0].Y);
      if (this.PosCount < this.SnakeLength) {
        this.PosCount++;
      }
      else
        this.PosCount = 0;
    };

    this.HandleFruitCollision = function(_Fruit,_Length,_Score,_Speed) {
      if (this.Pos[0].X+this.Radius/2 >= (_Fruit.Pos.X-_Fruit.Radius) && this.Pos[0].X-this.Radius/2 <= (_Fruit.Pos.X+_Fruit.Radius) && this.Pos[0].Y+this.Radius/2 >= (_Fruit.Pos.Y-_Fruit.Radius) && this.Pos[0].Y-this.Radius/2 <= (_Fruit.Pos.Y+_Fruit.Radius)) {
        this.SnakeLength += _Length;
        this.Score += Math.round(_Score*(_Fruit.Radius/10));
        this.Velocity += _Speed;
        _Fruit.Radius = SnakeLib.General.FullFruitRadius;
        _Fruit.Calc();
        if (SnakeLib.Settings.ShowScore)
          SnakeLib.UpdateScore();
      }
    };

    this.HandleSnakeCollision = function(_Other) {
      for (var i=1;i<_Other.SnakeLength;i++) {
        if (i != this.PosCount-1) {
          if (_Other.Pos[i]) {
            if (this.Pos[0].X == _Other.Pos[i].X && this.Pos[0].Y == _Other.Pos[i].Y) {
              _Other.SnakeLength = SnakeLib.General.InitSnakeLength;
              _Other.Pos = _Other.Pos.splice(0,SnakeLib.General.InitSnakeLength);
            }
          }
        }
      }
    };
  },

  Fruit: function(_Color)
  {
    this.Color = _Color;
    this.Radius = SnakeLib.General.FullFruitRadius;

    this.Calc = function() {
      this.Pos = new SnakeLib.Point(Math.random()*(SnakeLib.General.Width-this.Radius),Math.random()*(SnakeLib.General.Height-this.Radius));
    };

    this.Draw = function() {
      if (this.Radius > 1)
        this.Radius -= 0.01;
      else {
        this.Radius = SnakeLib.General.FullFruitRadius;
        this.Calc();
      }

      ctx.beginPath();
      ctx.fillStyle = this.Color;
      ctx.arc(this.Pos.X,this.Pos.Y,this.Radius,0,Math.PI*2,true);
      ctx.fill();
    };
  },

  doKeyDown: function(e)
  {
    switch (e.keyCode) {
      case 38: (SnakeLib.Player.Direction != "down" ? SnakeLib.Player.Direction = "up" : 0); break;
      case 40: (SnakeLib.Player.Direction != "up" ? SnakeLib.Player.Direction = "down" : 0); break;
      case 37: (SnakeLib.Player.Direction != "right" ? SnakeLib.Player.Direction = "left" : 0); break;
      case 39: (SnakeLib.Player.Direction != "left" ? SnakeLib.Player.Direction = "right" : 0); break;
    }
    if (SnakeLib.Settings.MultiPlayer) {
      switch (e.keyCode) {
        case 87: (SnakeLib.Player2.Direction != "down" ? SnakeLib.Player2.Direction = "up" : 0); break;
        case 83: (SnakeLib.Player2.Direction != "up" ? SnakeLib.Player2.Direction = "down" : 0); break;
        case 65: (SnakeLib.Player2.Direction != "right" ? SnakeLib.Player2.Direction = "left" : 0); break;
        case 68: (SnakeLib.Player2.Direction != "left" ? SnakeLib.Player2.Direction = "right" : 0); break;
      }
    }
  },

  UpdateScore: function()
  {
    SnakeLib.HTML.Score1.innerHTML = SnakeLib.Player.Name + ": " + SnakeLib.Player.Score;
    if (SnakeLib.Settings.MultiPlayer)
      SnakeLib.HTML.Score2.innerHTML = SnakeLib.Player2.Name + ": " + SnakeLib.Player2.Score;
  },

  UpdateTimer: function()
  {
    var sec = ~~(SnakeLib.Settings.Timer);
    var minutes = ~~(sec / 60),sec = sec - (minutes * 60);

    if (SnakeLib.Settings.Timer != "infinite")
    SnakeLib.HTML.Timer.innerHTML = (minutes < 10 ? "0"+minutes : minutes) + ":"+ (sec < 10 ? "0"+sec : sec);
    else
      SnakeLib.HTML.Timer.innerHTML = "∞";
  },

  StartGame: function()
  {
    if (SnakeLib.Settings.ShowScore)
      SnakeLib.UpdateScore();

    SnakeLib.General.GameLoopID = window.setInterval(SnakeLib.GameLoop,10);
    window.addEventListener("keydown",SnakeLib.doKeyDown,true);
  },

  TickTime: function()
  {
    if (SnakeLib.Settings.ShowTimer)
      SnakeLib.UpdateTimer();
    if (SnakeLib.Settings.Timer != "infinite") {
      if (SnakeLib.Settings.Timer > 0) {
        SnakeLib.Settings.Timer -= 0.01;
      }
      else {
        clearInterval(SnakeLib.General.GameLoopID);
        if (SnakeLib.Settings.MultiPlayer) {
          (SnakeLib.Player.Score > SnakeLib.Player2.Score ? alert(SnakeLib.Player.Name + " wins!") : alert(SnakeLib.Player2.Name + " wins!"));
        }
        else
          alert(SnakeLib.Player.Name + " got " + SnakeLib.Player.Score + " points!");
      }
    }
  },

  GameLoop: function()
  {
    ctx.clearRect(0,0,SnakeLib.General.Width,SnakeLib.General.Height);

    SnakeLib.TickTime(); 

    SnakeLib.Fruit.Red.Draw();
    SnakeLib.Fruit.Green.Draw();
    SnakeLib.Fruit.Blue.Draw();
    
    SnakeLib.Player.Draw();
    if (SnakeLib.Settings.MultiPlayer)
      SnakeLib.Player2.Draw();
  },
};

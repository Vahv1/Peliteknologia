var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade'
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

// Load assets
function preload()
{
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/playerpaddle.png');
    this.load.image('pc', 'assets/pc.png');
    this.load.image('ball', 'assets/ball.png');
    
    this.load.audio('ballHit', 'assets/ballhit.wav');
    this.load.audio('wallHit', 'assets/wallhit.wav');
    this.load.audio('goal', 'assets/goal.wav');
    this.load.audio('superShotActivate', 'assets/supershotactivate.ogg');
    this.load.audio('superShot', 'assets/supershot.wav');
}

var cursors;
var player;
var pc;
var ball;
var ballDirections = [-200, 200];
var ballVelocityX = ballDirections[Math.round(Math.random())]; //Set start direction randomly to left or right
var ballVelocityY = ballDirections[Math.round(Math.random())]; //Set start direction randomly to up or down

var scorePlayer = 0;
var scorePC = 0;
var scorePlayerText;
var scorePCText;

var superShotAmt = 1; // Player has supershots which can be used to shoot ball back faster
var superShotActive = false;
var superShotText;

// Create playing field, add objects and texts
function create()
{
    cursors = this.input.keyboard.createCursorKeys();
    space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.add.image(400, 300, 'background');
    
    this.sound.add('ballHit');
    this.sound.add('wallHit');
    this.sound.add('goal');
    this.sound.add('superShotActivate');
    this.sound.add('superShot');
    
    player = this.physics.add.sprite(20, 300, 'player');
    pc = this.physics.add.sprite(780, 300, 'pc');
    ball = this.physics.add.sprite(400, 300, 'ball');
    
    pc.setCollideWorldBounds(true);
    player.setCollideWorldBounds(true);
    ball.setCollideWorldBounds(true);
    ball.body.onWorldBounds = true;
    
    ball.setBounce(1);
    ball.setVelocityX(ballVelocityX);
    ball.setVelocityY(ballVelocityY);
    
    this.physics.add.collider(ball, player, hitPlayer, null, this);
    this.physics.add.collider(ball, pc, hitPC, null, this);
    this.physics.world.on('worldbounds', wallHit); // Event when ball hits world bounds
    
    scorePlayerText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#FFF' });
    scorePCText = this.add.text(700, 16, 'score: 0', { fontSize: '16px', fill: '#FFF' });
    superShotText = this.add.text(400, 16, '', { fontSize: '16px', fill: '#FFF' });
    
    xText = this.add.text(400, 500, '', { fontSize: '16px', fill: '#FFF' });
    yText = this.add.text(400, 530, '', { fontSize: '16px', fill: '#FFF' });
}

function update()
{
    // Player movement
    if (cursors.up.isDown)
    {
        player.setVelocityY(-200);
    }
    else if (cursors.down.isDown)
    {
        player.setVelocityY(200);
    }
    else
    {
        player.setVelocityY(0);
    }
    
    // PC Movement, tries to keep the same height as the ball
    if (ball.y > pc.y)
    {
        pc.setVelocityY(200)
    }
    else if (ball.y < pc.y)
    {
        pc.setVelocityY(-200)
    }
    
    // Scoring
    if(ball.x == 790)
    {
        this.sound.play('goal', {volume: 0.05});
        scorePlayer++;
        scorePlayerText.setText('Score: ' + scorePlayer);
        reset(); 
    }
    if (ball.x == 10)
    {
        this.sound.play('goal', {volume: 0.05});
        scorePC += 1;
        scorePCText.setText('Score: ' + scorePC);
        reset();
    }
    
    // Super shot
    if (Phaser.Input.Keyboard.JustDown(space) && superShotAmt > 0)
    {
        this.sound.play('superShotActivate');
        superShotActive = true;
        superShotAmt--;
    }
    if (superShotActive)
    {
        superShotText.setText('SUPERSHOT');
    }
}

// Called when object hits walls
/* Ei toimi, googlekaan ei auta. Jostain syystä äänen soittaminen onWorldBoundsissa
hajottaa pelin? */
function wallHit()
{
    //this.sound.play('wallHit');
}

// Interaction when player paddle hits ball
function hitPlayer(ball, player)
{
    // Shoot ball to opposite direction, add strength so ball speed rises when game goes on
    ballVelocityX = ballVelocityX * (Phaser.Math.Between(102, 105) / -100);
    
    // Shoot a faster shot
    if (superShotActive)
    {
        this.sound.play('superShot');
        ball.setVelocityX(ballVelocityX * 1.15)
        ball.setVelocityY(ball.body.velocity.y * 1.15)
        superShotActive = false;
        superShotText.setText('');
    }
    // Shoot normal shot
    else
    {
        this.sound.play('ballHit');
        ball.setVelocityX(ballVelocityX);
        ball.setVelocityY(ball.body.velocity.y * (Phaser.Math.Between(102, 105) / 100));
    }
    
    // Keep paddle in place after collision
    player.setVelocityX(0);
    player.x = 20;
}

// Interaction when PC paddle hits ball
function hitPC(ball, pc)
{
    this.sound.play('ballHit');
    
    // Shoot ball to opposite direction, add strength so ball speed rises when game goes on
    ballVelocityX = ballVelocityX * (Phaser.Math.Between(102, 105) / -100);
    ball.setVelocityX(ballVelocityX);
    ball.setVelocityY(ball.body.velocity.y * (Phaser.Math.Between(102, 105) / 100));
    
    // Keep paddle in place after collision
    pc.setVelocityX(0);
    pc.x = 780;
}

// Reset playing field to initial state
function reset()
{
    ball.x = 400;
    ball.y = 300;
    player.x = 20;
    player.y = 300;
    pc.x = 780;
    pc.y = 300;
    superShotAmt = 1;
    ballVelocityX = ballDirections[Math.round(Math.random())];
    ballVelocityY = ballDirections[Math.round(Math.random())];
    ball.setVelocityX(ballVelocityX);
    ball.setVelocityY(ballVelocityY);
}
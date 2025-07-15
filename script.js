// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const lengthElement = document.getElementById('length');
const colorIndicator = document.getElementById('colorIndicator');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const finalLengthElement = document.getElementById('finalLength');

// Game settings
const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Colors
const colors = {
    red: { hex: '#ff6b6b', name: 'RED' },
    blue: { hex: '#4ecdc4', name: 'BLUE' },
    green: { hex: '#95e1d3', name: 'GREEN' },
    yellow: { hex: '#f9ca24', name: 'YELLOW' },
    purple: { hex: '#a55eea', name: 'PURPLE' },
    orange: { hex: '#ff9f43', name: 'ORANGE' }
};

const colorKeys = Object.keys(colors);

// Game state
let game = {
    snake: [{ x: 15, y: 15 }],
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    currentColor: 'red',
    score: 0,
    foods: [],
    gameRunning: true,
    paused: false,
    lastTime: 0,
    gameSpeed: 150 // milliseconds between moves
};

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    handleInput(e.key.toLowerCase());
});

function handleInput(key) {
    if (!game.gameRunning) {
        if (key === 'r') resetGame();
        return;
    }

    if (game.paused) {
        if (key === ' ') togglePause();
        return;
    }

    switch (key) {
        case 'arrowup':
        case 'w':
            if (game.direction.y === 0) game.nextDirection = { x: 0, y: -1 };
            break;
        case 'arrowdown':
        case 's':
            if (game.direction.y === 0) game.nextDirection = { x: 0, y: 1 };
            break;
        case 'arrowleft':
        case 'a':
            if (game.direction.x === 0) game.nextDirection = { x: -1, y: 0 };
            break;
        case 'arrowright':
        case 'd':
            if (game.direction.x === 0) game.nextDirection = { x: 1, y: 0 };
            break;
        case ' ':
            togglePause();
            break;
        case 'r':
            resetGame();
            break;
    }
}

function togglePause() {
    game.paused = !game.paused;
}

// Food management
function spawnFood() {
    const food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
        color: colorKeys[Math.floor(Math.random() * colorKeys.length)]
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of game.snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return spawnFood(); // Try again
        }
    }
    
    game.foods.push(food);
}

function initializeFoods() {
    game.foods = [];
    for (let i = 0; i < 5; i++) {
        spawnFood();
    }
}

// Game logic
function updateGame() {
    if (!game.gameRunning || game.paused) return;

    // Don't move if no direction is set yet
    if (game.nextDirection.x === 0 && game.nextDirection.y === 0) return;

    // Update direction
    game.direction = { ...game.nextDirection };

    // Move snake
    const head = { ...game.snake[0] };
    head.x += game.direction.x;
    head.y += game.direction.y;

    // Check wall collision
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of game.snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    game.snake.unshift(head);

    // Check food collision
    let foodEaten = false;
    for (let i = game.foods.length - 1; i >= 0; i--) {
        const food = game.foods[i];
        if (head.x === food.x && head.y === food.y) {
            if (food.color === game.currentColor) {
                // Correct color - eat the food
                game.score += 10;
                game.foods.splice(i, 1);
                foodEaten = true;
                
                // Change snake color
                game.currentColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                updateColorIndicator();
                
                // Spawn new food
                spawnFood();
                
                // Increase speed slightly
                game.gameSpeed = Math.max(80, game.gameSpeed - 2);
                
            } else {
                // Wrong color - game over
                gameOver();
                return;
            }
        }
    }

    // Remove tail if no food eaten
    if (!foodEaten) {
        game.snake.pop();
    }

    // Update UI
    scoreElement.textContent = game.score;
    lengthElement.textContent = game.snake.length;
}

function updateColorIndicator() {
    const color = colors[game.currentColor];
    colorIndicator.textContent = `Current Color: ${color.name}`;
    colorIndicator.style.backgroundColor = color.hex;
    colorIndicator.style.color = color.hex === '#f9ca24' ? '#000' : '#fff';
}

function gameOver() {
    game.gameRunning = false;
    finalScoreElement.textContent = game.score;
    finalLengthElement.textContent = game.snake.length;
    gameOverScreen.style.display = 'block';
}

function resetGame() {
    game = {
        snake: [{ x: 15, y: 15 }],
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        currentColor: 'red',
        score: 0,
        foods: [],
        gameRunning: true,
        paused: false,
        lastTime: 0,
        gameSpeed: 150
    };
    
    initializeFoods();
    updateColorIndicator();
    scoreElement.textContent = '0';
    lengthElement.textContent = '1';
    gameOverScreen.style.display = 'none';
}

// Rendering
function render() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridWidth; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= gridHeight; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw foods
    for (let food of game.foods) {
        const color = colors[food.color];
        ctx.fillStyle = color.hex;
        ctx.fillRect(
            food.x * gridSize + 2,
            food.y * gridSize + 2,
            gridSize - 4,
            gridSize - 4
        );
        
        // Add glow effect
        ctx.shadowColor = color.hex;
        ctx.shadowBlur = 10;
        ctx.fillRect(
            food.x * gridSize + 4,
            food.y * gridSize + 4,
            gridSize - 8,
            gridSize - 8
        );
        ctx.shadowBlur = 0;
    }

    // Draw snake
    const snakeColor = colors[game.currentColor];
    for (let i = 0; i < game.snake.length; i++) {
        const segment = game.snake[i];
        
        // Head is brighter
        if (i === 0) {
            ctx.fillStyle = snakeColor.hex;
        } else {
            ctx.fillStyle = snakeColor.hex + '90'; // Add transparency
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
    }

    // Draw "Press arrow key to start" message
    if (game.nextDirection.x === 0 && game.nextDirection.y === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press arrow key to start!', canvas.width / 2, canvas.height / 2 + 50);
        ctx.textAlign = 'left';
    }

    // Draw pause indicator
    if (game.paused) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
}

// Game loop
function gameLoop(currentTime) {
    if (currentTime - game.lastTime >= game.gameSpeed) {
        updateGame();
        game.lastTime = currentTime;
    }
    
    render();
    requestAnimationFrame(gameLoop);
}

// Initialize and start game
initializeFoods();
updateColorIndicator();
requestAnimationFrame(gameLoop);
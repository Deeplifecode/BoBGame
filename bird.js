let move_speed = 3, gravity = 0.5;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird');

let bird_prop = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();
let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');

let game_stage = 'start';
let bird_dy = 0; // Reset bird's velocity
let pipe_interval; // To manage pipe creation interval
let isJumping = false; // Flag to track if the bird is jumping
img.style.display = 'none';
message.classList.add('messageStyle');

// Start or restart game on screen click or touch
document.addEventListener('click', startOrRestartGame);
document.addEventListener('touchstart', startOrRestartGame);

function startOrRestartGame() {
    if (game_stage !== 'play') {
        restartGame();
    }
}

function restartGame() {
    // Reset variables
    document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());
    img.style.display = 'block';
    bird.style.top = '40vh';
    game_stage = 'play';
    bird_dy = 0;
    score_val.innerHTML = '0';
    message.innerHTML = '';
    message.classList.remove('messageStyle');
    play();

    // Reattach the click/touch event listener after restart
    document.addEventListener('click', startOrRestartGame);
    document.addEventListener('touchstart', startOrRestartGame);
}

function play() {
    function move() {
        if (game_stage !== 'play') return;
        let pipe_sprites = document.querySelectorAll('.pipe_sprite');
        pipe_sprites.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_prop = bird.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                // Collision detection
                if (
                    bird_prop.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    bird_prop.left + bird_prop.width > pipe_sprite_props.left &&
                    bird_prop.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    bird_prop.top + bird_prop.height > pipe_sprite_props.top
                ) {
                    endGame();
                    return;
                } else {
                    // Increment score
                    if (pipe_sprite_props.right < bird_prop.left && !element.increase_score_counted) {
                        score_val.innerHTML = parseInt(score_val.innerHTML) + 1;
                        element.increase_score_counted = true;
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    function applyGravity() {
        if (game_stage !== 'play') return;

        bird_dy += gravity;
        bird.style.top = bird_prop.top + bird_dy + 'px';
        bird_prop = bird.getBoundingClientRect();

        // Bird controls (for mobile touch or keyboard keydown)
        const jump = () => {
            if (isJumping) return; // Prevent jump if already jumping
            isJumping = true;
            img.src = 'bird.jpg';
            bird_dy = -7.6;
            setTimeout(() => {
                isJumping = false; // Allow jumping again after a short delay
            }, 300); // Set jump duration (time before the bird can jump again)
        };

        // Respond to keydown (keyboard) and touchstart (mobile) for jump
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowUp' || e.key === ' ') && !isJumping) {
                jump();
            }
        });

        document.addEventListener('touchstart', (e) => {
            e.preventDefault();  // Prevent page scroll on touch
            jump();
        });

        // Game over if bird hits the boundaries
        if (bird_prop.top <= 0 || bird_prop.bottom >= background.bottom) {
            endGame();
            return;
        }

        requestAnimationFrame(applyGravity);
    }
    requestAnimationFrame(applyGravity);

    function createPipe() {
        if (game_stage !== 'play') return;

        let pipe_separation = Math.random() * (background.height / 2) + 50;
        let pipe_gap = 35;

        // Upper pipe
        let pipe_sprite_inv = document.createElement('div');
        pipe_sprite_inv.className = 'pipe_sprite';
        pipe_sprite_inv.style.top = `${pipe_separation - 70}vh`;
        pipe_sprite_inv.style.left = '100vw';
        document.body.appendChild(pipe_sprite_inv);

        // Lower pipe
        let pipe_sprite = document.createElement('div');
        pipe_sprite.className = 'pipe_sprite';
        pipe_sprite.style.top = `${pipe_separation + pipe_gap}vh`;
        pipe_sprite.style.left = '100vw';
        pipe_sprite.increase_score_counted = false;
        document.body.appendChild(pipe_sprite);

        if (game_stage === 'play') {
            setTimeout(createPipe, 1500);
        }
    }
    createPipe();
}

function endGame() {
    game_stage = 'End';
    message.innerHTML = '<span style="color: red;">Game Over</span><br>Tap to Restart';
    message.classList.add('messageStyle');
    img.style.display = 'none';

    // Remove the click/touch event listener after game over to prevent it from triggering again unintentionally
    document.removeEventListener('click', startOrRestartGame);
    document.removeEventListener('touchstart', startOrRestartGame);

    // Reattach the click/touch event listener after the game ends
    setTimeout(() => {
        document.addEventListener('click', startOrRestartGame);
        document.addEventListener('touchstart', startOrRestartGame);
    }, 1000); // Add a slight delay to ensure the restart message is shown
}

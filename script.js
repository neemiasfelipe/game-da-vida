
// --- NAVEGAÇÃO PRINCIPAL E DAS PERGUNTAS ---
const initialScreen = document.getElementById('initial-screen');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');

const mainTabs = {
    1: document.getElementById('tab1'), 2: document.getElementById('tab2'),
    3: document.getElementById('tab3'), final: document.getElementById('tab-final'),
};
const mainPhases = {
    1: document.getElementById('phase1'), 2: document.getElementById('phase2'),
    3: document.getElementById('phase3'), final: document.getElementById('final'),
};

const questionTabs = {
    1: document.getElementById('q-tab1'), 2: document.getElementById('q-tab2'), 3: document.getElementById('q-tab3')
};
const questionContents = {
    1: document.getElementById('q1'), 2: document.getElementById('q2'), 3: document.getElementById('q3')
};

function showPhase(phaseId) {
    Object.values(mainPhases).forEach(p => p.classList.remove('active'));
    Object.values(mainTabs).forEach(t => t.classList.remove('active'));
    mainPhases[phaseId].classList.add('active');
    mainTabs[phaseId].classList.add('active');
}

function showQuestion(questionId) {
    Object.values(questionContents).forEach(p => p.classList.remove('active'));
    Object.values(questionTabs).forEach(t => t.classList.remove('active'));
    questionContents[questionId].classList.add('active');
    questionTabs[questionId].classList.add('active');
}

startButton.addEventListener('click', () => {
    initialScreen.style.display = 'none';
    gameContainer.style.display = 'block';
    showPhase(1);
});

Object.keys(questionTabs).forEach(id => {
    questionTabs[id].addEventListener('click', () => {
        if (!questionTabs[id].disabled) showQuestion(id);
    });
});

// --- CÓDGO DA FASE 1 ---
const nextPhase1Btn = document.getElementById('next-phase-1-btn');

function checkAnswer(questionNum, answer) {
    const correctAnswersMap = { 1: 'Shopping', 2: 'Jogo de vôlei', 3: '17 de Junho' };
    const isCorrect = correctAnswersMap[questionNum] === answer;
    document.getElementById(`feedback${questionNum}`).innerHTML = isCorrect ? '<span class="heart">❤️</span>' : 'Tudo bem, tive que pesquisar também pra criar o jogo kkkk';
    document.querySelector(`#q${questionNum} .answers`).querySelectorAll('button').forEach(b => b.disabled = true);

    setTimeout(() => {
        if (questionNum < 3) {
            // Habilita a aba da próxima pergunta
            questionTabs[questionNum + 1].disabled = false;
            // MUDA AUTOMATICAMENTE PARA A PRÓXIMA ABA
            showQuestion(questionNum + 1);
        } else {
            // Se for a última pergunta, mostra o botão para a próxima FASE
            nextPhase1Btn.classList.remove('hidden');
        }
    }, 1200);
}

nextPhase1Btn.addEventListener('click', () => {
    mainTabs[2].disabled = false;
    showPhase(2);
    startGame();
});

// --- CÓDIGO FASE 2 (COM IMAGENS PNG PARA O PIPOCA) ---
const nextPhase2Btn = document.getElementById('next-phase-2-btn');
const retryButton = document.getElementById('retry-button');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMsg = document.getElementById('game-message');

let player, pipoca, obstacles, keys = {}, frameCount, gameLoop;
const gravity = 0.5, groundHeight = 30;

//Reseta o jogo se clicar enten
document.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
        document.getElementById("retry-button").click();
    }
});

// Imagem do gATO
const pipocaImage = new Image();
pipocaImage.src = 'pipoca.png'; // Fundo transparente é melhor.

// Imagem do Personagem Principal
const playerImage = new Image();
// Troque o link abaixo pela URL da sua imagem PNG do personagem !!!
playerImage.src = 'mariana-kids.png'; // Fundo transparente é melhor.

function drawPlayer() {
    // Verifica se a imagem do jogador foi carregada antes de desenhar
    if (playerImage.complete && playerImage.naturalHeight !== 0) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    } else {
        // Desenha um retângulo rosa como fallback enquanto a imagem carrega
        ctx.fillStyle = "#d63384";
        ctx.fillRect(player.x, player.y + 10, player.width, player.height - 10);
        ctx.fillStyle = "#ffdbac";
        ctx.fillRect(player.x, player.y, player.width, 10);
    }
}

function drawPipoca() {
    if (pipocaImage.complete && pipocaImage.naturalHeight !== 0) {
        const pipocaY = pipoca.y + 2 * Math.sin(0.1 * frameCount); // Efeito de flutuar 
        ctx.drawImage(pipocaImage, pipoca.x, pipocaY, pipoca.width, pipoca.height);
    }
}

function drawObstacles() {
    ctx.fillStyle = "#795548";
    obstacles.forEach(t => { ctx.fillRect(t.x, t.y, t.width, t.height) });
}

function startGame() {
    gameMsg.textContent = "";
    retryButton.classList.add("hidden");
    nextPhase2Btn.classList.add("hidden");
    player = { x: 50, y: canvas.height - groundHeight - 45, width: 30, height: 40, dy: 0, onGround: true }; // Se quiser ajusta um pouco o tamanho
    pipoca = { x: canvas.width - 60, y: canvas.height - groundHeight - 50, width: 45, height: 45 }; // Aqui tbem
    obstacles = [{ x: 300, y: canvas.height - groundHeight - 20, width: 30, height: 20 }, { x: 500, y: canvas.height - groundHeight - 35, width: 40, height: 35 }];
    frameCount = 0;
    document.addEventListener("keydown", t => keys[(t.key === 'Enter' ? ' ' : t.key)] = true); // Use space para pular ou Enter para reiniciar
    document.addEventListener("keyup", t => keys[(t.key === 'Enter' ? ' ' : t.key)] = false);
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateGame, 1000 / 60);
}

function updateGame() {
    frameCount++;
    (keys.ArrowUp || keys[' ']) && player.onGround && (player.dy = -10, player.onGround = false);
    keys.ArrowLeft && player.x > 0 && (player.x -= 3);
    keys.ArrowRight && player.x < canvas.width - player.width && (player.x += 3);
    player.dy += gravity;
    player.y += player.dy;
    player.y + player.height >= canvas.height - groundHeight && (player.y = canvas.height - groundHeight - player.height, player.dy = 0, player.onGround = true);

    obstacles.forEach(t => {
        t.x -= 3;
        t.x + t.width < 0 && (t.x = canvas.width + 100 * Math.random());
        if (player.x < t.x + t.width && player.x + player.width > t.x && player.y < t.y + t.height && player.y + player.height > t.y) {
            clearInterval(gameLoop);
            gameMsg.textContent = "Oh não! Tente de novo!";
            retryButton.classList.remove("hidden");
        }
    });

    if (player.x < pipoca.x + pipoca.width && player.x + player.width > pipoca.x && player.y < pipoca.y + pipoca.height && player.y + player.height > pipoca.y) {
        clearInterval(gameLoop);
        gameMsg.textContent = "O Pipoca foi resgatado! Obrigadoo!";
        nextPhase2Btn.classList.remove("hidden");
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5cb85c";
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    drawPlayer();
    drawPipoca();
    drawObstacles();
}

nextPhase2Btn.addEventListener('click', () => { mainTabs[3].disabled = false; showPhase(3); });

// --- CÓDIGO FASE 2 TAMBÉM (SÓ QUE SEM A IMAGEM. APENAS UM DESENHO EM JS) ---
// Pra usar é só comentar o código de cima e descomentar esse. Usam os mesmos IDS. Muda nada.
/*const nextPhase2Btn = document.getElementById('next-phase-2-btn');
const retryButton = document.getElementById('retry-button');
//Ao clicar enter o Jogo reseta
document.addEventListener("keydown", function (event) {
    if (event.keyCode === 13) {
        document.getElementById("retry-button").click();
    }
});
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMsg = document.getElementById('game-message');
let player, pipoca, obstacles, keys = {}, frameCount, gameLoop;
const gravity = 0.5, groundHeight = 30;

function drawPlayer() { ctx.fillStyle = "#d63384"; ctx.fillRect(player.x, player.y + 10, player.width, player.height - 10); ctx.fillStyle = "#ffdbac"; ctx.fillRect(player.x, player.y, player.width, 10) }
function drawPipoca() { const t = pipoca.y + 2 * Math.sin(.1 * frameCount); ctx.fillStyle = "#ffc107", ctx.fillRect(pipoca.x, t, pipoca.width, pipoca.height), ctx.fillRect(pipoca.x + 5, t - 10, 20, 10), ctx.fillRect(pipoca.x + 5, t - 15, 5, 5), ctx.fillRect(pipoca.x + 20, t - 15, 5, 5), ctx.fillRect(Math.floor(frameCount / 20) % 2 == 0 ? pipoca.x - 5 : pipoca.x - 5, Math.floor(frameCount / 20) % 2 == 0 ? t : t + 5, 5, 15) }
function drawObstacles() { ctx.fillStyle = "#795548", obstacles.forEach(t => { ctx.fillRect(t.x, t.y, t.width, t.height) }) }
function startGame() { gameMsg.textContent = "", retryButton.classList.add("hidden"), nextPhase2Btn.classList.add("hidden"), player = { x: 50, y: canvas.height - groundHeight - 40, width: 20, height: 30, dy: 0, onGround: !0 }, pipoca = { x: canvas.width - 50, y: canvas.height - groundHeight - 25, width: 30, height: 20 }, obstacles = [{ x: 300, y: canvas.height - groundHeight - 20, width: 30, height: 20 }, { x: 500, y: canvas.height - groundHeight - 35, width: 40, height: 35 }], frameCount = 0, document.addEventListener("keydown", t => keys[t.key] = !0), document.addEventListener("keyup", t => keys[t.key] = !1), gameLoop && clearInterval(gameLoop), gameLoop = setInterval(updateGame, 1e3 / 60) }
function updateGame() { frameCount++, (keys.ArrowUp || keys[' ']) && player.onGround && (player.dy = -10, player.onGround = !1), keys.ArrowLeft && player.x > 0 && (player.x -= 3), keys.ArrowRight && player.x < canvas.width - player.width && (player.x += 3), player.dy += gravity, player.y += player.dy, player.y + player.height >= canvas.height - groundHeight && (player.y = canvas.height - groundHeight - player.height, player.dy = 0, player.onGround = !0), obstacles.forEach(t => { t.x -= 3, t.x + t.width < 0 && (t.x = canvas.width + 100 * Math.random()), player.x < t.x + t.width && player.x + player.width > t.x && player.y < t.y + t.height && player.y + player.height > t.y && (clearInterval(gameLoop), gameMsg.textContent = "Oh não! Tente de novo!", retryButton.classList.remove("hidden")) }), player.x < pipoca.x + pipoca.width && player.x + player.width > pipoca.x && (clearInterval(gameLoop), gameMsg.textContent = "O Pipoca foi resgatado! Obrigadoo!", nextPhase2Btn.classList.remove("hidden")), ctx.clearRect(0, 0, canvas.width, canvas.height), ctx.fillStyle = "#5cb85c", ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight), drawPlayer(), drawPipoca(), drawObstacles() }

nextPhase2Btn.addEventListener('click', () => {
    mainTabs[3].disabled = false;
    showPhase(3);
});*/

// --- FASE 3 ---
const nextPhase3Btn = document.getElementById('next-phase-3-btn');

function checkPassword() {
    const passwordInput = document.getElementById('password-input');
    if (passwordInput.value.toLowerCase().trim() === 'família') {
        document.getElementById('password-feedback').textContent = 'Exatamente isso! O cofre está aberto!!';
        passwordInput.disabled = true;
        nextPhase3Btn.classList.remove('hidden');
    } else {
        document.getElementById('password-feedback').textContent = 'Senha incorreta. Tente novamente.';
    }
}

nextPhase3Btn.addEventListener('click', () => {
    mainTabs.final.disabled = false;
    showPhase('final');
});

// --- FASE FINAL ---
const finalButtons = document.getElementById('final-buttons');
const finalResponseDiv = document.getElementById('final-response');

document.getElementById('yes-button').addEventListener('click', () => {
    finalButtons.classList.add('hidden');
    finalResponseDiv.textContent = 'Ela disse SIMMMMM ❤️';
    triggerConfetti();
});
document.getElementById('think-button').addEventListener('click', () => {
    finalButtons.classList.add('hidden');
    finalResponseDiv.textContent = 'Brincadeira! Sei que é um SIM! 😄';
    setTimeout(() => { finalResponseDiv.textContent = 'Ela disse Simmmmm 🎉'; triggerConfetti(); }, 2000);
});

// --- O CONFETE CHAVE NO FINAL ---
const confettiCanvas = document.getElementById("confetti-canvas"), confettiCtx = confettiCanvas.getContext("2d"); let confettiParticles = [], animationFrameId; function triggerConfetti() { confettiCanvas.width = window.innerWidth, confettiCanvas.height = window.innerHeight, confettiParticles = []; for (let e = 0; e < 200; e++)confettiParticles.push(createParticle()); animationFrameId && cancelAnimationFrame(animationFrameId), animateConfetti() } function createParticle() { const e = Math.random() * confettiCanvas.width, t = Math.random() * confettiCanvas.height - confettiCanvas.height, n = `hsl(${360 * Math.random()}, 100%, 70%)`; return { x: e, y: t, size: 5 * Math.random() + 2, speed: 3 * Math.random() + 2, color: n } } function animateConfetti() { confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height), confettiParticles.forEach((e, t) => { e.y += e.speed, e.y > confettiCanvas.height && (confettiParticles[t] = createParticle()), confettiCtx.fillStyle = e.color, confettiCtx.fillRect(e.x, e.y, e.size, 2 * e.size) }), animationFrameId = requestAnimationFrame(animateConfetti) }

const button = document.getElementById('start-button');
const element = document.getElementById('content'); // Elemento a ser exibido em tela cheia

button.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
});

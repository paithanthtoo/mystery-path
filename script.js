const SAVE_KEY = 'mysteryPathSave';
const SETTINGS_KEY = 'mysteryPathSettings';

const storyNodes = [
    {
        id: 1,
        title: 'Enter the Forest',
        chapter: 'Chapter 1',
        sceneLabel: 'Fog-Covered Crossroads',
        image: 'images/scene1.jpg',
        text: 'You stand at the edge of a dense, fog-covered forest. The path splits in two. A cold wind blows from the north.',
        options: [
            { text: 'Take the left path into the shadows', nextId: 2 },
            { text: 'Take the right path towards the faint light', nextId: 3 }
        ]
    },
    {
        id: 2,
        title: 'Shadows of the Forest',
        chapter: 'Chapter 1',
        sceneLabel: 'Shadow Path',
        image: 'images/scene2.jpg',
        text: 'The trees are thick here. You hear rustling in the bushes. Suddenly, you spot a glint of metal on the ground.',
        options: [
            { text: 'Pick up the Silver Dagger', getItem: 'Silver Dagger', nextId: 8, hint: 'This may help later.' },
            { text: 'Ignore it and move deeper', nextId: 5 }
        ]
    },
    {
        id: 3,
        title: 'The Abandoned Cabin',
        chapter: 'Chapter 2',
        sceneLabel: 'Cabin Clearing',
        image: 'images/scene3.jpg',
        text: 'The light leads you to an old abandoned cabin. The door is slightly ajar. You feel eyes watching you from the trees.',
        options: [
            { text: 'Enter the cabin', nextId: 6 },
            { text: 'Walk around the back', nextId: 7 }
        ]
    },
    {
        id: 4,
        title: 'Driven Back',
        chapter: 'Ending',
        sceneLabel: 'Wolf Ambush',
        image: 'images/scene4.jpg',
        text: 'A wild wolf jumps out. You are unprepared and forced to flee back to the forest edge. Ending unlocked: Driven Back.',
        endingId: 'driven-back',
        endingName: 'Driven Back',
        options: [
            { text: 'Restart', nextId: 1, resetRun: true }
        ]
    },
    {
        id: 5,
        title: 'Lost Forever',
        chapter: 'Ending',
        sceneLabel: 'Ravine of Darkness',
        image: 'images/scene5.jpg',
        text: 'The darkness swallows you. Without a weapon or light, you stumble into a deep ravine. Ending unlocked: Lost Forever.',
        endingId: 'lost-forever',
        endingName: 'Lost Forever',
        options: [
            { text: 'Restart', nextId: 1, resetRun: true }
        ]
    },
    {
        id: 6,
        title: 'Treasure Path',
        chapter: 'Ending',
        sceneLabel: 'Inside the Cabin',
        image: 'images/scene6.jpg',
        text: 'Inside the cabin, you find a chest of gold and a map home. You have survived. Ending unlocked: Treasure Path.',
        endingId: 'treasure-path',
        endingName: 'Treasure Path',
        options: [
            { text: 'Play Again', nextId: 1, resetRun: true }
        ]
    },
    {
        id: 7,
        title: 'The Hidden Cellar',
        chapter: 'Chapter 2',
        sceneLabel: 'Behind the Cabin',
        image: 'images/scene7.jpg',
        text: 'Behind the cabin, you find a hidden cellar door covered in vines. It looks locked from the inside.',
        options: [
            { text: 'Bang on the door', nextId: 9 },
            { text: 'Go back to the front', nextId: 3 }
        ]
    },
    {
        id: 8,
        title: 'Face the Wolf',
        chapter: 'Chapter 3',
        sceneLabel: 'Moonlit Encounter',
        image: 'images/scene8.jpg',
        text: 'With the Silver Dagger in hand, you feel braver. A massive wolf blocks your path, growling fiercely.',
        options: [
            { text: 'Fight the wolf with the Dagger', requiredItem: 'Silver Dagger', nextId: 10, hint: 'A weapon changes everything.' },
            { text: 'Try to climb a tree', nextId: 4 }
        ]
    },
    {
        id: 9,
        title: 'The Hermit’s Shelter',
        chapter: 'Ending',
        sceneLabel: 'Safe Cellar',
        image: 'images/scene9.jpg',
        text: 'The cellar door opens. A hermit lives here and offers you warm soup and a safe path out of the forest. Ending unlocked: Hermit’s Friend.',
        endingId: 'hermits-friend',
        endingName: 'Hermit’s Friend',
        options: [
            { text: 'Play Again', nextId: 1, resetRun: true }
        ]
    },
    {
        id: 10,
        title: 'Hero of the Woods',
        chapter: 'Ending',
        sceneLabel: 'Hidden Meadow',
        image: 'images/scene10.jpg',
        text: 'You defend yourself successfully. The wolf retreats, revealing a hidden path to a beautiful moonlit meadow. Ending unlocked: Hero of the Woods.',
        endingId: 'hero-of-the-woods',
        endingName: 'Hero of the Woods',
        options: [
            { text: 'Play Again', nextId: 1, resetRun: true }
        ]
    }
];

const endingDefinitions = [
    { id: 'driven-back', label: 'Driven Back' },
    { id: 'lost-forever', label: 'Lost Forever' },
    { id: 'treasure-path', label: 'Treasure Path' },
    { id: 'hermits-friend', label: 'Hermit’s Friend' },
    { id: 'hero-of-the-woods', label: 'Hero of the Woods' }
];

const state = {
    currentNodeId: 1,
    inventory: [],
    endings: [],
    visitedNodes: [1],
    isMuted: false,
    textSpeed: 30
};

let typingTimer = null;
let fullNodeText = '';
let isTyping = false;
let toastTimer = null;
let typeAudioPool = [];
let poolIndex = 0;

const elements = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    createTypeAudioPool();
    restoreSettings();
    restoreProgress();
    bindEvents();
    updateResumeButton();
    updateSidebar();
    setBackgroundImage(getNodeById(state.currentNodeId)?.image || 'images/scene1.jpg');
    showSection('home');
    hideLoadingScreen();
});

function cacheElements() {
    elements.sections = document.querySelectorAll('main section');
    elements.navButtons = document.querySelectorAll('.nav-btn');
    elements.startBtn = document.getElementById('start-btn');
    elements.resumeBtn = document.getElementById('resume-btn');
    elements.gameNavBtn = document.getElementById('game-nav-btn');
    elements.storyText = document.getElementById('story-text');
    elements.choicesContainer = document.getElementById('choices-container');
    elements.inventoryList = document.getElementById('inventory-list');
    elements.endingList = document.getElementById('ending-list');
    elements.endingCount = document.getElementById('ending-count');
    elements.chapterLabel = document.getElementById('chapter-label');
    elements.gameTitle = document.getElementById('game-title');
    elements.sceneLabel = document.getElementById('scene-label');
    elements.progressLabel = document.getElementById('progress-label');
    elements.progressFill = document.getElementById('progress-fill');
    elements.restartBtn = document.getElementById('restart-btn');
    elements.saveHomeBtn = document.getElementById('save-home-btn');
    elements.skipBtn = document.getElementById('skip-btn');
    elements.muteBtn = document.getElementById('mute-btn');
    elements.textSpeed = document.getElementById('text-speed');
    elements.toast = document.getElementById('toast');
    elements.clickSound = document.getElementById('click-sound');
    elements.bgMusic = document.getElementById('bg-music');
    elements.typingSound = document.getElementById('typing-sound');
    elements.loadingScreen = document.getElementById('loading-screen');
}

function createTypeAudioPool() {
    typeAudioPool = [];
    for (let i = 0; i < 5; i += 1) {
        typeAudioPool.push(new Audio('typing-click.mp3'));
    }
}

function bindEvents() {
    document.querySelectorAll('[data-section-target]').forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.sectionTarget;
            showSection(target);
        });
    });

    elements.startBtn?.addEventListener('click', startGame);
    elements.resumeBtn?.addEventListener('click', loadGame);
    elements.gameNavBtn?.addEventListener('click', handleGameNav);
    elements.restartBtn?.addEventListener('click', restartRun);
    elements.saveHomeBtn?.addEventListener('click', saveAndReturnHome);
    elements.skipBtn?.addEventListener('click', skipTyping);
    elements.muteBtn?.addEventListener('click', toggleMute);
    elements.textSpeed?.addEventListener('input', handleTextSpeedChange);

    document.addEventListener('click', firstInteractionAudioKickstart, { once: true });
}

function showSection(sectionId) {
    elements.sections.forEach(section => {
        const shouldShow = section.id === sectionId;
        section.classList.toggle('active-section', shouldShow);
        section.classList.toggle('hidden-section', !shouldShow);
    });

    elements.navButtons.forEach(button => {
        const target = button.dataset.sectionTarget;
        const isGameButton = button.id === 'game-nav-btn' && sectionId === 'game';
        button.classList.toggle('active-nav', target === sectionId || isGameButton);
    });
}

function startGame() {
    playClick();
    playBackgroundMusic();
    state.currentNodeId = 1;
    state.inventory = [];
    state.visitedNodes = [1];
    renderNode(1);
    showSection('game');
    showToast('A new journey begins.');
}

function restartRun() {
    playClick();
    state.currentNodeId = 1;
    state.inventory = [];
    state.visitedNodes = [1];
    renderNode(1);
    showToast('Run restarted.');
}

function saveAndReturnHome() {
    playClick();
    saveProgress();
    showSection('home');
    updateResumeButton();
    showToast('Progress saved.');
}

function handleGameNav() {
    playBackgroundMusic();
    if (hasSaveData()) {
        loadGame();
    } else {
        startGame();
    }
}

function loadGame() {
    playClick();
    playBackgroundMusic();

    const saved = getSavedProgress();
    if (!saved) {
        showToast('No saved game found. Starting a new run.');
        startGame();
        return;
    }

    applySavedState(saved);
    renderNode(state.currentNodeId);
    showSection('game');
    showToast('Journey resumed.');
}

function renderNode(nodeId) {
    const node = getNodeById(nodeId);
    if (!node) {
        showToast('Scene data is missing.');
        return;
    }

    state.currentNodeId = node.id;
    if (!state.visitedNodes.includes(node.id)) {
        state.visitedNodes.push(node.id);
    }

    unlockEndingIfNeeded(node);
    setBackgroundImage(node.image);
    updateHeader(node);
    renderProgress();
    renderChoices(node.options);
    typeWriterEffect(node.text);
    updateSidebar();
    saveProgress();
}

function updateHeader(node) {
    elements.chapterLabel.textContent = node.chapter;
    elements.gameTitle.textContent = node.title;
    elements.sceneLabel.textContent = node.sceneLabel;
}

function renderChoices(options) {
    elements.choicesContainer.innerHTML = '';

    options.forEach(option => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'choice-btn';
        button.innerHTML = option.hint
            ? `${option.text}<small>${option.hint}</small>`
            : option.text;

        button.addEventListener('click', () => {
            playClick();
            selectOption(option);
        });

        elements.choicesContainer.appendChild(button);
    });
}

function selectOption(option) {
    if (option.requiredItem && !state.inventory.includes(option.requiredItem)) {
        showToast(`You need the ${option.requiredItem} to do that.`);
        return;
    }

    if (option.getItem && !state.inventory.includes(option.getItem)) {
        state.inventory.push(option.getItem);
        showToast(`${option.getItem} added to inventory.`);
    }

    if (option.resetRun) {
        state.inventory = [];
        state.visitedNodes = [1];
    }

    renderNode(option.nextId);
}

function typeWriterEffect(text) {
    clearTyping();
    fullNodeText = text;
    isTyping = true;
    elements.storyText.textContent = '';

    let index = 0;
    const speed = Math.max(10, Number(state.textSpeed) || 30);

    function typeNext() {
        if (index >= text.length) {
            isTyping = false;
            return;
        }

        playTypeSound();
        elements.storyText.textContent += text.charAt(index);
        index += 1;
        typingTimer = setTimeout(typeNext, speed);
    }

    typeNext();
}

function skipTyping() {
    playClick();
    if (!isTyping) {
        showToast('The full text is already visible.');
        return;
    }

    clearTyping();
    elements.storyText.textContent = fullNodeText;
    isTyping = false;
}

function clearTyping() {
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
}

function renderProgress() {
    const progressPercentage = Math.round((state.visitedNodes.length / storyNodes.length) * 100);
    elements.progressLabel.textContent = `${progressPercentage}%`;
    elements.progressFill.style.width = `${progressPercentage}%`;
}

function updateSidebar() {
    renderInventory();
    renderEndings();
    if (elements.textSpeed) {
        elements.textSpeed.value = String(state.textSpeed);
    }
    if (elements.muteBtn) {
        elements.muteBtn.textContent = state.isMuted ? 'Sound: Off' : 'Sound: On';
    }
}

function renderInventory() {
    elements.inventoryList.innerHTML = '';

    if (!state.inventory.length) {
        const item = document.createElement('li');
        item.className = 'empty-item';
        item.textContent = 'No items collected yet.';
        elements.inventoryList.appendChild(item);
        return;
    }

    state.inventory.forEach(entry => {
        const item = document.createElement('li');
        item.textContent = entry;
        elements.inventoryList.appendChild(item);
    });
}

function renderEndings() {
    elements.endingList.innerHTML = '';
    elements.endingCount.textContent = `${state.endings.length} / ${endingDefinitions.length}`;

    endingDefinitions.forEach(ending => {
        const item = document.createElement('li');
        const unlocked = state.endings.includes(ending.id);
        item.textContent = unlocked ? ending.label : 'Locked';
        if (!unlocked) {
            item.classList.add('locked-ending');
        }
        elements.endingList.appendChild(item);
    });
}

function unlockEndingIfNeeded(node) {
    if (node.endingId && !state.endings.includes(node.endingId)) {
        state.endings.push(node.endingId);
        showToast(`New ending unlocked: ${node.endingName}`);
    }
}

function setBackgroundImage(imagePath) {
    document.documentElement.style.setProperty('--scene-image', `url('${imagePath}')`);
}

function getNodeById(nodeId) {
    return storyNodes.find(node => node.id === nodeId);
}

function saveProgress() {
    const payload = {
        currentNodeId: state.currentNodeId,
        inventory: state.inventory,
        endings: state.endings,
        visitedNodes: state.visitedNodes
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    updateResumeButton();
}

function getSavedProgress() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('Save data could not be parsed.', error);
        return null;
    }
}

function restoreProgress() {
    const saved = getSavedProgress();
    if (!saved) {
        return;
    }

    applySavedState(saved);
}

function applySavedState(saved) {
    state.currentNodeId = Number(saved.currentNodeId) || 1;
    state.inventory = Array.isArray(saved.inventory) ? saved.inventory : [];
    state.endings = Array.isArray(saved.endings) ? saved.endings : [];
    state.visitedNodes = Array.isArray(saved.visitedNodes) && saved.visitedNodes.length ? saved.visitedNodes : [1];
}

function hasSaveData() {
    return Boolean(localStorage.getItem(SAVE_KEY));
}

function updateResumeButton() {
    if (!elements.resumeBtn) {
        return;
    }
    elements.resumeBtn.hidden = !hasSaveData();
}

function handleTextSpeedChange(event) {
    state.textSpeed = Number(event.target.value) || 30;
    saveSettings();
}

function toggleMute() {
    playClick();
    state.isMuted = !state.isMuted;

    if (elements.bgMusic) {
        elements.bgMusic.muted = state.isMuted;
    }

    typeAudioPool.forEach(sound => {
        sound.muted = state.isMuted;
    });

    if (elements.clickSound) {
        elements.clickSound.muted = state.isMuted;
    }

    if (elements.typingSound) {
        elements.typingSound.muted = state.isMuted;
    }

    updateSidebar();
    saveSettings();
}

function playClick() {
    if (!elements.clickSound || state.isMuted) {
        return;
    }

    elements.clickSound.currentTime = 0;
    elements.clickSound.play().catch(() => {});
}

function playTypeSound() {
    if (state.isMuted || !typeAudioPool.length) {
        return;
    }

    const sound = typeAudioPool[poolIndex];
    sound.volume = 0.35;
    sound.currentTime = 0;
    sound.play().catch(() => {});
    poolIndex = (poolIndex + 1) % typeAudioPool.length;
}

function playBackgroundMusic() {
    if (!elements.bgMusic) {
        return;
    }

    elements.bgMusic.volume = 0.45;
    elements.bgMusic.muted = state.isMuted;
    elements.bgMusic.play().catch(() => {});
}

function firstInteractionAudioKickstart() {
    playBackgroundMusic();
}

function saveSettings() {
    const payload = {
        isMuted: state.isMuted,
        textSpeed: state.textSpeed
    };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
}

function restoreSettings() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
        return;
    }

    try {
        const settings = JSON.parse(raw);
        state.isMuted = Boolean(settings.isMuted);
        state.textSpeed = Number(settings.textSpeed) || 30;
    } catch (error) {
        console.error('Settings could not be parsed.', error);
    }
}

function showToast(message) {
    if (!elements.toast) {
        return;
    }

    elements.toast.textContent = message;
    elements.toast.classList.add('show');

    if (toastTimer) {
        clearTimeout(toastTimer);
    }

    toastTimer = setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2300);
}

function hideLoadingScreen() {
    setTimeout(() => {
        elements.loadingScreen?.classList.add('hidden');
    }, 450);
}

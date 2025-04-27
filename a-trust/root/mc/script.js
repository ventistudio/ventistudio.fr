document.addEventListener('DOMContentLoaded', () => {
    // Create audio context on user interaction
    let audioContext = null;

    // Function to initialize audio context
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Function to create and play a simple "click" sound
    function playClickSound() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Function to create and play a simple "hover" sound
    function playHoverSound() {
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.05);
    }

    // Initialize audio context on first user interaction
    document.body.addEventListener('click', () => {
        initAudioContext();
    }, { once: true });

    // Add hover and click sound effects to buttons
    const buttons = document.querySelectorAll('.minecraft-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (audioContext) playHoverSound();
        });
        
        button.addEventListener('click', () => {
            if (audioContext) playClickSound();
        });
    });
});
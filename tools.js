// Tools overview page management
class ToolsManager {
    static init() {
        console.log('ToolsManager.init() called');
        this.setupEventListeners();
        console.log('ToolsManager.init() completed');
    }

    static setupEventListeners() {
        console.log('Setting up tools event listeners...');
        
        // Add click event listeners to tool cards
        const toolCards = document.querySelectorAll('.tool-card');
        console.log('Tool cards found:', toolCards.length);
        
        toolCards.forEach(card => {
            const link = card.querySelector('.open-tool-btn');
            if (link) {
                console.log('Adding click listener to:', link.href);
                // The links should work automatically, but let's add some visual feedback
                card.addEventListener('click', (e) => {
                    // Don't interfere with the link click
                    if (e.target.tagName === 'A') return;
                    
                    // If clicking the card itself, trigger the link
                    const link = card.querySelector('.open-tool-btn');
                    if (link) {
                        window.location.href = link.href;
                    }
                });
            }
        });
        
        console.log('Tools event listeners setup completed');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ToolsManager...');
    ToolsManager.init();
});

// Make ToolsManager globally available
window.ToolsManager = ToolsManager;

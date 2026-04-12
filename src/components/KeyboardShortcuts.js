import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input field
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
      
      // Don't trigger shortcuts while typing
      if (isTyping && !(e.ctrlKey || e.metaKey)) {
        return;
      }

      // Ctrl+N or Cmd+N - New Asset
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/landing');
        // Dispatch event to open create asset modal
        window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
          detail: { action: 'createAsset' } 
        }));
      }

      // Ctrl+G or Cmd+G - Go to Analytics/Goals
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        navigate('/landing');
        window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
          detail: { action: 'analytics' } 
        }));
      }

      // Ctrl+H or Cmd+H - Go to Home
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        navigate('/landing');
        window.dispatchEvent(new CustomEvent('vaultknight-navigate', { 
          detail: { action: 'home' } 
        }));
      }

      // Ctrl+S or Cmd+S - Save (prevent default browser save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Dispatch save event - components can listen for this
        window.dispatchEvent(new CustomEvent('vaultknight-save'));
      }

      // ? - Show help modal with all shortcuts
      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        showShortcutsHelp();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const showShortcutsHelp = () => {
    const shortcuts = [
      { keys: ['Ctrl', 'K'], description: 'Open search' },
      { keys: ['Ctrl', 'N'], description: 'Create new asset' },
      { keys: ['Ctrl', 'G'], description: 'Go to analytics' },
      { keys: ['Ctrl', 'H'], description: 'Go to home' },
      { keys: ['Ctrl', 'S'], description: 'Save current form' },
      { keys: ['Esc'], description: 'Close modal/search' },
      { keys: ['?'], description: 'Show this help' },
    ];

    const helpHTML = `
      <div class="shortcuts-help-overlay" onclick="this.remove()">
        <div class="shortcuts-help-modal" onclick="event.stopPropagation()">
          <div class="shortcuts-help-header">
            <h3>Keyboard Shortcuts</h3>
            <button class="shortcuts-help-close" onclick="this.closest('.shortcuts-help-overlay').remove()">×</button>
          </div>
          <div class="shortcuts-help-content">
            ${shortcuts.map(shortcut => `
              <div class="shortcut-item">
                <div class="shortcut-keys">
                  ${shortcut.keys.map(key => `<kbd>${key}</kbd>`).join(' + ')}
                </div>
                <span class="shortcut-description">${shortcut.description}</span>
              </div>
            `).join('')}
          </div>
          <div class="shortcuts-help-footer">
            <p>Press <kbd>?</kbd> to open this help, <kbd>Esc</kbd> or click outside to close</p>
          </div>
        </div>
      </div>
    `;

    // Remove existing help modal if any
    const existing = document.querySelector('.shortcuts-help-overlay');
    if (existing) {
      existing.remove();
    }

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .shortcuts-help-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.2s ease;
      }
      
      .shortcuts-help-modal {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 480px;
        width: 90%;
        animation: slideUp 0.3s ease;
      }
      
      .shortcuts-help-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .shortcuts-help-header h3 {
        margin: 0;
        font-size: 18px;
        color: #1f2937;
      }
      
      .shortcuts-help-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      
      .shortcuts-help-close:hover {
        color: #374151;
      }
      
      .shortcuts-help-content {
        padding: 16px 24px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .shortcut-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .shortcut-item:last-child {
        border-bottom: none;
      }
      
      .shortcut-keys {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      
      .shortcut-keys kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        padding: 4px 8px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        color: #374151;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .shortcut-description {
        font-size: 14px;
        color: #6b7280;
      }
      
      .shortcuts-help-footer {
        padding: 16px 24px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
        border-radius: 0 0 12px 12px;
      }
      
      .shortcuts-help-footer p {
        margin: 0;
        font-size: 13px;
        color: #6b7280;
        text-align: center;
      }
      
      .shortcuts-help-footer kbd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 6px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        font-size: 12px;
        font-family: inherit;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @media (prefers-color-scheme: dark) {
        .shortcuts-help-modal {
          background: #1f2937;
        }
        
        .shortcuts-help-header h3 {
          color: #f9fafb;
        }
        
        .shortcuts-help-close {
          color: #9ca3af;
        }
        
        .shortcuts-help-close:hover {
          color: #e5e7eb;
        }
        
        .shortcut-item {
          border-bottom-color: #374151;
        }
        
        .shortcut-keys kbd {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }
        
        .shortcut-description {
          color: #9ca3af;
        }
        
        .shortcuts-help-footer {
          background: #111827;
          border-top-color: #374151;
        }
        
        .shortcuts-help-footer p {
          color: #9ca3af;
        }
        
        .shortcuts-help-footer kbd {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }
      }
    `;
    document.head.appendChild(style);

    // Remove style when modal is closed
    setTimeout(() => {
      const overlay = document.querySelector('.shortcuts-help-overlay');
      if (overlay) {
        const observer = new MutationObserver(() => {
          if (!document.body.contains(overlay)) {
            style.remove();
            observer.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }, 100);

    document.body.insertAdjacentHTML('beforeend', helpHTML);
  };

  return null;
};

export default KeyboardShortcuts;
export class Input {
  constructor(element, onAction, onFocusLoss) {
    this.held = new Set();
    this.jumpPressed = false;
    element.addEventListener('keydown', (event) => {
      const code = event.code;
      if (['ArrowLeft', 'ArrowRight', 'Space', 'Escape'].includes(code) && event.target.tagName !== 'BUTTON') event.preventDefault();
      if (event.repeat || this.held.has(code)) return;
      this.held.add(code);
      if (code === 'Space' && event.target.tagName === 'BUTTON') return;
      onAction(code);
    });
    window.addEventListener('keyup', (event) => this.held.delete(event.code));
    const loseFocus = () => { this.clear(); onFocusLoss(); };
    window.addEventListener('blur', loseFocus);
    document.addEventListener('visibilitychange', () => { if (document.hidden) loseFocus(); });
    element.addEventListener('focusout', (event) => { if (!element.contains(event.relatedTarget)) loseFocus(); });
  }
  get direction() {
    return Number(this.held.has('ArrowRight') || this.held.has('KeyD')) - Number(this.held.has('ArrowLeft') || this.held.has('KeyA'));
  }
  consumeJump() { const pressed = this.jumpPressed; this.jumpPressed = false; return pressed; }
  clear() { this.held.clear(); this.jumpPressed = false; }
}

// @ts-nocheck
/*
 * <test-header>

 * Toggling between the hamburger/close icons and showing/hiding the panel that
 * contains the tagline + CTA is driven entirely by `aria-expanded` on the
 * toggle button and the `hidden` attribute on the panel (see assets/ecom-test.css,
 * which keys off both with a `:has()` selector) — there's no separate JS
 * state to keep in sync.
*/

console.log('connected js file')

class TestHeader extends HTMLElement {
  toggleButton = null;
  panel = null;

  constructor() {
    super();

    this.handleToggleClick = this.handleToggleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  connectedCallback() {
    this.toggleButton = this.querySelector('[data-header-toggle]');
    this.panel = this.querySelector('[data-header-panel]');

    console.log(this.toggleButton)

    this.toggleButton?.addEventListener('click', this.handleToggleClick);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    this.toggleButton?.removeEventListener('click', this.handleToggleClick);
    this.removeEventListener('keydown', this.handleKeydown)
  }

  get isOpen() {
    return this.toggleButton?.getAttribute('aria-expanded') === 'true'
  }

  open() {
    this.toggleButton?.setAttribute('aria-expanded', 'true');
    if (this.panel) this.panel.hidden = false;
  }

  close() {
    this.toggleButton?.setAttribute('aria-expanded', 'false');
    if (this.panel) this.panel.hidden = true;
  }

  handleToggleClick() {
    if (this.isOpen) {
      this.close();
      console.log('clicked')
    }
    else {
      this.open();
    }
  }

  handleKeydown(event) {
    if(event.key == 'Escape' && this.isOpen) {
      this.close();
      this.toggleButton?.focus();
    }
  }
}

if(!customElements.get('test-header')) {
  customElements.define('test-header', TestHeader);
}

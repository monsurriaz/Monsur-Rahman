// @ts-nocheck
/*
 * <test-header>

 * Toggling between the hamburger/close icons and showing/hiding the panel that
 * contains the tagline + CTA is driven entirely by `aria-expanded` on the
 * toggle button and the `hidden` attribute on the panel (see assets/ecom-test.css,
 * which keys off both with a `:has()` selector) — there's no separate JS
 * state to keep in sync.
*/

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


function isColorOption(name) {
  return /^colou?r$/i.test(name)
}

function isSizeOption(name) {
  return /^size$/i.test(name);
}

class TestProductGrid {
  constructor(element) {
    this.element = element;
    this.checkUpsellInCart();
  }

  async checkUpsellInCart() {
    const upsellProductId = this.element.dataset.upsellProductId;

    if(!upsellProductId) return;

    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();

      const upsellInCart = cart.items.some(
        item => String(item.product_id) === String(upsellProductId)
      );

      this.setUpsellState(upsellInCart);
    } catch (error) {
      console.log('Failed to check cart:', error);
    }
  }

  setUpsellState(value) {
    this.element.dataset.upsellInCart = String(value)
  }

  isUpsellInCart() {
    return this.element.dataset.upsellInCart === 'true';
  }
}

const productGrid = document.querySelector('[data-product-grid]');

if (productGrid) {
  new TestProductGrid(productGrid);
}


class TestQuickView extends HTMLElement {
  constructor() {
    super();

    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleContentClick = this.handleContentClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.currentTrigger = null;
  }

  connectedCallback() {
    this.content = this.querySelector('[data-quick-view-content]');
    this.overlay = this.querySelector('[data-quick-view-overlay]');
    this.closeButton = this.querySelector('[data-quick-view-close]');

    document.addEventListener('click', this.handleTriggerClick);
    this.overlay.addEventListener('click', this.handleOverlayClick);
    this.closeButton.addEventListener('click', this.handleCloseClick);
    this.content.addEventListener('click', this.handleContentClick);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleTriggerClick);
    this.overlay.removeEventListener('click', this.handleOverlayClick);
    this.closeButton.removeEventListener('click', this.handleCloseClick);
    this.content.removeEventListener('click', this.handleContentClick);
    this.removeEventListener('keydown', this.handleKeydown);
  }

  handleTriggerClick(event) {
    const trigger = event.target.closest('[data-quick-view-trigger]');

    if(!trigger) return;

    const card = trigger.closest('[data-product-card]');
    const template = card?.querySelector('[data-quick-view-template]');

    if(!template) return;

    this.currentTrigger = trigger;

    this.content.replaceChildren(template.content.cloneNode(true));

    this.updateAddToCartState();
    this.open();
  }

  handleOverlayClick() {
    this.close();
  }

  handleCloseClick() {
    this.close();
  }

  handleKeydown(event) {
    if(event.key == 'Escape' && !this.hidden) {
      this.close();
    }
  }

  handleContentClick(event) {
    const toggle = event.target.closest('.ecom-test-quick-view__select-toggle');
    if(toggle) {
      this.toggleSelect(toggle);
      return;
    }

    const openToggle = this.content.querySelector(
      `.ecom-test-quick-view__select-toggle[aria-expanded="true"]`
    )

    if(openToggle && !openToggle.closest('.ecom-test-quick-view__select').contains(event.target)) {
      this.closeSelect(openToggle);
    }

    const option = event.target.closest('[data-option-value]');
    const addButton = event.target.closest('[data-quick-view-add]');

    if(option) {
      this.selectOption(option);
      return;
    }

    if(addButton) {
      this.addToCart(addButton);
    }
  }

  toggleSelect(toggle) {
    const list = toggle.closest('.ecom-test-quick-view__select')?.querySelector(
      '.ecom-test-quick-view__select-list'
    );
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';

    this.content.querySelectorAll('.ecom-test-quick-view__select-toggle[aria-expanded="true"]').forEach(el => {
      if (el != toggle) this.closeSelect(el);
    })

    toggle.setAttribute('aria-expanded', String(!isOpen));
    if (list) list.hidden = isOpen;
  }

  closeSelect(toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    const list = toggle.closest('.ecom-test-quick-view__select')?.querySelector(
      '.ecom-test-quick-view__select-list'
    );
    if (list) list.hidden = true;
  }

  selectOption(option) {
    const group = option.closest('[data-option-group]');
    if (!group) return;

    group.querySelectorAll('[data-option-value]').forEach(button => {
      button.classList.remove('is-selected');
      if (button.hasAttribute('aria-pressed')) button.setAttribute('aria-pressed', 'false');
    });

    option.classList.add('is-selected');
    if (option.hasAttribute('aria-pressed')) option.setAttribute('aria-pressed', 'true');

    // Listbox selection (Size/fallback): reflect the choice in the toggle
    // and close the list. Swatch selection (Color) has no toggle to close.
    const select = option.closest('.ecom-test-quick-view__select');
    if (select) {
      const toggle = select.querySelector('.ecom-test-quick-view__select-toggle');
      const valueLabel = toggle?.querySelector('[data-select-value]');
      if (valueLabel) valueLabel.textContent = option.dataset.optionValue ?? '';
      if (toggle) this.closeSelect(toggle);
    }

    this.updateAddToCartState();
  }

  /**
   * One entry per rendered option group, in DOM order — which is Shopify's
   * real, unreordered option order (CSS `order` only changes how these
   * look, e.g. Color before Size regardless of a product's own admin
   * configuration — it never touches DOM order), so this stays positionally
   * correct against variant.options without needing to know option names.
   */
  getSelectedOptionsDetailed() {
    const groups = [...this.content.querySelectorAll('[data-option-group]')];

    return groups.map(group => {
      const selected = group.querySelector('.is-selected');

      return {
        name: group.dataset.optionName || '',
        value: selected?.dataset.optionValue || null,
      };
    });
  }

  getSelectedOptions() {
    return this.getSelectedOptionsDetailed().map(option => option.value);
  }

  getSelectedVariant() {
    const variantsElement = this.content.querySelector(
      '[data-quick-view-variants]'
    );

    if (!variantsElement) return null;

    const variants = JSON.parse(variantsElement.textContent);
    const selectedOptions = this.getSelectedOptions();

    return variants.find(variant => {
      return variant.options.every((value, index) => {
        return value === selectedOptions[index];
      });
    });
  }

  updateAddToCartState() {
    const addToCartButton = this.content.querySelector('[data-quick-view-add]');
    if (!addToCartButton) return;

    const variant = this.getSelectedVariant();
    addToCartButton.disabled = !variant || !variant.available;
  }

  /**
   * Black + M on the MAIN product -> resolve the matching (or first
   * available, if that exact combination doesn't exist) variant on the
   * merchant-configured upsell product. Matches option names, not fixed
   * positions — the upsell product's own option order isn't guaranteed to
   * be [Color, Size] just because a given main product's happens to be.
   */
  getUpsellVariant() {
    const options = this.getSelectedOptionsDetailed();
    const colorOption = options.find(option => isColorOption(option.name));
    const sizeOption = options.find(option => isSizeOption(option.name));

    if (!colorOption?.value || !sizeOption?.value) return null;
    if (colorOption.value.toLowerCase() !== 'black' || sizeOption.value.toLowerCase() !== 'm') {
      return null;
    }

    const grid = document.querySelector('[data-product-grid]');
    if (!grid || grid.dataset.upsellInCart === 'true') return null;

    const upsellElement = grid.querySelector('[data-upsell-product]');
    if (!upsellElement) return null;

    const upsell = JSON.parse(upsellElement.textContent);
    const optionNames = upsell.optionNames || [];
    const upsellColorIndex = optionNames.findIndex(isColorOption);
    const upsellSizeIndex = optionNames.findIndex(isSizeOption);

    let matchedVariant;
    if (upsellColorIndex !== -1 && upsellSizeIndex !== -1) {
      matchedVariant = upsell.variants.find(variant => (
        variant.available &&
        variant.options[upsellColorIndex]?.toLowerCase() === 'black' &&
        variant.options[upsellSizeIndex]?.toLowerCase() === 'm'
      ));
    }

    // Exact Black/M combination doesn't exist on the upsell product —
    // fall back to its first available variant instead.
    matchedVariant ??= upsell.variants.find(variant => variant.available);

    return matchedVariant || null;
  }

  async addToCart(button) {
    const mainVariant = this.getSelectedVariant();

    if (!mainVariant) {
      return;
    }

    const label = button.querySelector('.ecom-test-quick-view__add-to-cart-text');
    const originalLabel = label?.textContent ?? 'Add to cart';

    button.disabled = true;
    if (label) label.textContent = 'Adding...';

    const items = [
      {
        id: mainVariant.id,
        quantity: 1
      }
    ];

    const upsellVariant = this.getUpsellVariant();

    if (upsellVariant) {
      items.push({
        id: upsellVariant.id,
        quantity: 1
      });
    }

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error('Add to cart failed');
      }

      /*
       * If we added the upsell, remember it.
       * We don't need to check /cart.js again later.
       */
      if (upsellVariant) {
        const grid = document.querySelector('[data-product-grid]');

        if (grid) {
          grid.dataset.upsellInCart = 'true';
        }
      }

      // Stays open on success — AJAX add-to-cart shouldn't force the popup
      // closed, per the "no cart drawer, no redirect" requirement. Shows a
      // brief confirmation on the button instead, then resets it so
      // another item/quantity can still be added without reopening.

      if (label) label.textContent = 'Added';
      window.setTimeout(() => {
        if (label) label.textContent = originalLabel;
        button.disabled = false;
      }, 1500);

    } catch (error) {
      console.error('Add to cart failed:', error);

      button.disabled = false;
      if (label) label.textContent = originalLabel;
    }
  }

  open() {
    this.hidden = false;
    this.classList.add('is-open');
    document.body.classList.add('scroll-hidden');
    this.closeButton?.focus();
  }

  close() {
    this.classList.remove('is-open');
    this.hidden = true;

    document.body.classList.remove('scroll-hidden');

    this.content.replaceChildren();

    this.currentTrigger?.focus();
    this.currentTrigger = null;
  }
}


if (!customElements.get('test-quick-view')) {
  customElements.define('test-quick-view', TestQuickView);
}
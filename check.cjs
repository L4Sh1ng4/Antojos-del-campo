const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const checks = [
  {name: 'cart-float button', test: content.includes('id="cart-float"')},
  {name: 'cart-drawer', test: content.includes('id="cart-drawer"')},
  {name: 'cart-items container', test: content.includes('id="cart-items"')},
  {name: 'cart-drawer__close', test: content.includes('cart-drawer__close')},
  {name: 'checkout-btn', test: content.includes('id="checkout-btn"')},
  {name: 'checkout-modal', test: content.includes('id="checkout-modal"')},
  {name: 'checkout-form', test: content.includes('id="checkout-form"')},
  {name: 'checkout-form__submit', test: content.includes('id="checkout-submit"')},
  {name: 'checkout-form__back', test: content.includes('checkout-form__back')},
  {name: 'toast-container', test: content.includes('id="toast-container"')},
  {name: 'cart.js script', test: content.includes('src="js/cart.js"')},
];

let passed = 0;
for (const check of checks) {
  if (check.test) {
    console.log('✅', check.name);
  } else {
    console.log('❌', check.name);
  }
}
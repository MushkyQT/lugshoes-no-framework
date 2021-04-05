let data;
let xmlhttp = new XMLHttpRequest()
xmlhttp.onreadystatechange = function () {
  if (this.readyState === 4 && this.status === 200) {
    data = JSON.parse(this.responseText)
    pageReady(data) // Hoist data into outer functional scope (global here)
  }
}

function pageReady(data) {
  document.querySelector('.product-info-headline h1').innerHTML = data.product.title
  document.querySelector('.product-info-description').innerHTML = data.product.description
  let radios = document.querySelectorAll('input[type="radio"]')
  radios.forEach(function (radio) {
    if (radio.checked) {
      requestShoesByColor(radio.value)
    }
    radio.addEventListener('click', function () {
      requestShoesByColor(this.value)
    })
  })
}


function setClass(el, className, fnName) {
  for (let i = 0; i < el.length; i++) {
    el[i].classList[fnName](className)
  }
}

function toggleCart(disabled) {
  let toToggle = document.querySelector('.product-actions')
  if (disabled) {
    toToggle.classList.add('btn-disabled')
    toToggle.childNodes[1].innerHTML = 'Out of stock'
  } else {
    toToggle.classList.remove('btn-disabled')
    toToggle.childNodes[1].innerHTML = "Add to cart"
  }
}

function requestShoeBySizeAndColor(size, color, shoes) {
  let selectedShoe;
  for (let i = 0; i < shoes.length; i++) {
    if (shoes[i].size === size && shoes[i].color === color) {
      selectedShoe = shoes[i];
      break;
    }
  }
  let shoePrice = parseInt(selectedShoe.price)
  document.querySelector('.product-image img').src = 'https://lugus-hiring.frb.io/storage/shoes-' + color + '.png'
  document.querySelector('.pricetag').innerHTML = shoePrice + "&#128;"
  document.querySelector('.add-to-cart').dataset.value = selectedShoe.id
}

function setAvailableSizes(shoes, color) {
  let sizeOptions = document.querySelectorAll('.product-info-sizes li')
  let defaultSelection = null;

  sizeOptions.forEach(function (size) {
    size.addEventListener('click', function () {
      if (!this.classList.contains('selected')) {
        setClass(sizeOptions, 'selected', 'remove')
        this.classList.toggle('selected')
        if (!this.classList.contains('disabled')) {
          toggleCart(false)
        } else {
          toggleCart(true)
        }
      }
      requestShoeBySizeAndColor(size.dataset.value, color, shoes)
    })
  })

  setClass(sizeOptions, 'selected', 'remove')
  for (let i = 0; i < shoes.length; i++) {
    if (shoes[i].quantity === 0) {
      sizeOptions[i].classList.add('disabled')
    } else {
      sizeOptions[i].classList.remove('disabled')
      if (defaultSelection === null) {
        defaultSelection = sizeOptions[i].dataset.value
        document.querySelector('[data-value="' + defaultSelection + '"]').classList.toggle('selected')
        toggleCart(false)
        requestShoeBySizeAndColor(defaultSelection, color, shoes)
      }
    }
  }
}

function requestShoesByColor(color) {
  let variants = data.product.variants
  let matchedShoes = []
  variants.forEach(function (variant) {
    if (variant.color === color) {
      matchedShoes.push(variant)
    }
  })
  setAvailableSizes(matchedShoes, color)
}

xmlhttp.open("GET", "https://lugus-hiring.frb.io/product", true)
xmlhttp.send()

document.querySelector('.product-actions').addEventListener('click', function () {
  if (!this.classList.contains('btn-disabled')) {
    let shoeForQuery = this.childNodes[1].dataset.value
    xmlhttp.open("POST", "https://lugus-hiring.frb.io/cart/add", true)
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 200) {
        document.querySelector('.product-actions').childNodes[1].innerHTML = "Added to cart"
      }
    }
    xmlhttp.send(JSON.stringify({
      variant_id: shoeForQuery,
      quantity: 1
    }))
  }
})
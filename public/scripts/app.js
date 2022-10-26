const order = {
  customer: {
    name: "John Smith",
    phone: "1236667777",
  },
  total_cost: 0,
  cart_items: [],
  beverages: {},
};
//  ******************* START ********************
$(document).ready(function() {
  loadProducts();

  $(document).on("click", ".price", onPriceClick);
  $(document).on("click", ".placeOrder", onOrderClick);
  $(document).on("click", "#cartButton", onCartClick);
  $(document).on("click", ".plus", onPlusClick);
  $(document).on("click", ".minus", onMinusClick);
});
//************End of DOCUMENT READY  **************

let productsResponse = {};

const $products = $(".product-container");
const $items = $(".modal-body");
const $admin = $(".admin-container");

const loadProducts = function() {
  $.get("/api/products")
    .then((products) => {
      //Adding product's info to productsResponse, so it could be used to generate cart items.
      products.info.forEach((product) => {
        productsResponse[product.id] = product;
      });
      renderProducts(products.info);
    })
    .catch((error) => {
      console.log("error", error.message);
    });
};

const onPlusClick = function() {
  //find product id
  const $id = $(this).closest("article").attr("key");
  //change quantity
  order.beverages[$id]++;
  //update quantity in HTML
  $(this).next().text(order.beverages[$id]);
};

const onMinusClick = function() {
  const $id = $(this).closest("article").attr("key");
  //check if quantity is 0.
  order.beverages[$id] === 0 ? 0 : order.beverages[$id]--;
  $(this).prev().text(order.beverages[$id]);
};

const onPriceClick = function() {
  const $id = $(this).attr("key");
  order.beverages = {
    ...order.beverages,
    //if quantity is 0, quantity will be 1. If not, quantity will be increased by 1.
    [$id]: order.beverages[$id] ? order.beverages[$id] + 1 : 1,
  };
};

const calculateTotalCost = function(order, productInfo) {
  let result = 0;
  for (item in order) {
    console.log(item);
    const cost = productInfo[item].price * order[item];
    result += cost;
  }
  //tax rate is 5%
  const tax = result * 0.05;
  result += tax;
  result = Math.round(result) / 100;
  return result;
};

const onOrderClick = function() {
  const cart_items = Object.keys(order.beverages).map((key) => ({
    product_id: key,
    quantity: order.beverages[key],
  }));
  order.cart_items = cart_items;
  $.post("api/orders", order).then((result) => {
    const $successMessage = $(`<p>${result.message}</p>`);
    $items.empty();
    $(".placeOrder").hide();
    $items.append($successMessage);
    order.beverages = {};
  });
};

const createOrderItem = function(itemId, quantity) {
  const $item = $(`
    <article key=${itemId}>
    <div class="item-price" key=${itemId}>$${(productsResponse[itemId].price * quantity) / 100
    }</div>
    <div class="item-info">
    <div class="product-name">${productsResponse[itemId].name}</div>
    <div class="quantity">Quantity: <button class="plus">+</button><span class="quantity-value">${quantity}</span><button class="minus">-</button></div>
    </div>
    </article>`);
  return $item;
};

const createProductElement = function(product) {
  const $product = $(`
    <article>
    <div class="price" key=${product.id}>Add 1 to cart ($${product.price / 100
    })</div>
    <div class="product">
    <img src=${product.photo_url} alt="photo_url">
        <div class="productInfo">
          <div class="productName">${product.name}</div>
          <div class="description">${product.description}</div>
          </div>
          </div>
          </article>`);
  return $product;
};

const renderProducts = function(products) {
  products.forEach((product) => {
    const $product = createProductElement(product);
    $products.append($product);
  });
};

const renderOrderItems = function(items) {
  $items.empty();
  for (item in items) {
    //item is the id of item, items[item] is the quantity of item.
    const $item = createOrderItem(item, items[item]);
    $items.append($item);
  }
};

const onCartClick = function() {
  renderOrderItems(order.beverages);
  $(".placeOrder").show();
  const totalCost = calculateTotalCost(order.beverages, productsResponse);
  const $totalCost = $(`
    <p class=total-cost>Total: $${totalCost}<p>
    `);

  //Save total cost to the order so that it can be sent to backend;
  order.total_cost = totalCost * 100;
  $items.append($totalCost);
};


const loadOrders = function() {
  $.get("/api/orders")
    .then((orders) => {
      renderOrders(orders);
    })
    .catch((error) => {
      console.log("error", error.message);
    });
};

const renderOrders = function(orders) {
  orders.forEach((order) => {
    const $order = $(`
    <article>
    <div class="newOrder" key=${orders.id}>You received a new order!</div>
    <div class="order">
        <div class="orderInfo">
        <div class="orderID">${orders.id}</div>
        <div class="orderName">${cart_items.id}</div>
          <div class="quantity">${cart_items.quantity}</div>
          <div><form>
          <label for="time">How long will this take? Please enter a time.</label><br>
          <input type="text" id="time" name="time" value="John"><br>
          </form>
          <button type="button">Order is Ready!</button>
          </div>
          </div>
          </div>
    </article>`);
    return $order;
  });
};

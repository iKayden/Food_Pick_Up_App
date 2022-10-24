/* eslint-disable camelcase */
/* eslint-disable no-undef */
$(document).ready(function () {
  const order = {
    customer: { name: "John Smith", phone: "1236667777", total_cost: 69420 },
    cart_items: { order_id: 5, product_id: 3, quantity: 4 },
    beverages: {},
    total_cost: 0,
  };

  //productsResponse is used to store the data we get from database (products table)
  let productsResponse = {};

  const $products = $(".product-container");
  const $items = $(".modal-body");

  const createProductElement = function (product) {
    const $product = $(`
    <article>
      <div class="price" key=${product.id}>Add 1 to cart ($${
      product.price / 100
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

  const renderProducts = function (products) {
    products.forEach((product) => {
      const $product = createProductElement(product);
      $products.append($product);
    });

    //adding products to cart
    const $addToCart = $(".price");
    $addToCart.click(function () {
      const $id = $(this).attr("key");
      order.beverages = {
        ...order.beverages,
        //if quantity is 0, quantity will be 1. If not, quantity will be increased by 1.

        [$id]: order.beverages[$id] ? order.beverages[$id] + 1 : 1,
      };
    });

    const calculateTotalCost = function (order, productInfo) {
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

    const createOrderItem = function (itemId, quantity) {
      const $item = $(`
      <article>
        <div class="item-price" key=${itemId}>$${
        (productsResponse[itemId].price * quantity) / 100
      }</div>
        <div class="item-info">
            <div class="product-name">${productsResponse[itemId].name}</div>
            <div class="quantity">quantity:${quantity}</div>
        </div>
      </article>`);
      return $item;
    };

    const renderOrderItems = function (items) {
      for (item in items) {
        //item is the id of item, items[item] is the quantity of item.
        const $item = createOrderItem(item, items[item]);
        $items.append($item);
      }
    };

    const $placeOrder = $(".placeOrder");
    $placeOrder.click(function () {
      $.ajax({
        url: "/orders",
        method: "POST",
        data: JSON.stringify(order),
        dataType: "json",
        contentType: "application/json",
      });
    });

    const $cartButton = $("#cartButton");
    $cartButton.click(function () {
      renderOrderItems(order.beverages);

      const totalCost = calculateTotalCost(order.beverages, productsResponse);
      const $totalCost = $(`
      <p class=total-cost>Total: $${totalCost}<p>
      `);

      //Save total cost to the order so that it can be sent to backend;
      order.total_cost = totalCost * 100;
      $items.append($totalCost);
    });
  };

  const loadProducts = function () {
    $.ajax({
      url: "/products",
      method: "GET",
    })
      .then((products) => {
        //Adding product's info to productsResponse, so it could be used to generate cart items.
        products.info.forEach((product) => {
          productsResponse[product.id] = product;
        });

        renderProducts(products.info);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  loadProducts();
});

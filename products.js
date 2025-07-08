{
  let products = null;
  let favorites = null;
  const STORAGE_KEY = "productData";
  const url = "https://dummyjson.com/products";

  const productList = document.querySelector(".products");
  const modal = document.querySelector(".modal-favourite");
  const btnShow = document.querySelector(".show-btn");
  const favouriteBtn = document.querySelector(".favourite-btn");

  function initializeData(url) {
    products = getProductData(STORAGE_KEY);
    updateCountLiked();

    if (!products) {
      fetchProductData(url);
    } else {
      renderProductList(products);
    }
  }

  function fetchProductData(url) {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        products = data.products;
        updateProductData(products);
        renderProductList(products);
      })
      .catch((error) => console.error("Lỗi fetch:", error));
  }

  function getProductData(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  function updateProductData(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function renderProductList(products) {
    if (productList) {
      productList.innerHTML = products.map(renderProduct).join("");
    }
  }

  function renderProduct(product) {
    const liked = `${product.category === "liked" ? "heart-red" : "heart"}`;
    updateCountLiked();
    if (product)
      return `
      <div class="card-contain col-10 col-sm-6 col-md-4 col-lg-3 col">
          <article data-id="${product.id}" class="card-item d-flex flex-column justify-content-between bg-secondary-subtle border border-black border-opacity-10 overflow-hidden rounded-5 shadow">
              <div class="card-thumbs position-relative pt-100 rounded-top-5">
                  <a class="thumb-link link-detail position-absolute inset-full flex-center p-4 border-bottom" href="./product-details.html?id=${product.id}">
                      <img loading="lazy" class="card-img object-fit-contain rounded-4" src="${product.thumbnail}" alt="Product Image" />
                  </a>
                  <span class="card-favourite flex-center position-absolute shadow cursor-pointer z-3">
                      <svg name="${liked}" class="svg-icon ${liked} fs-11 z-9">
                          <use xlink:href="#${liked}"></use>
                      </svg>
                  </span>
              </div>
              <div class="card-content w-100 pt-3 pb-4 d-flex flex-column justify-content-between flex-grow-1">
                  <h3 class="card-title text-body text-opacity-75">${product.title}</h3>
                  <p class="card-desc">${product.description}</p>
                  <div>
                      <span class="brand text-body text-opacity-50 fst-italic">${product.brand}</span>
                      <div class="card-assess d-flex align-items-center justify-content-between text-body text-opacity-75">
                          <span class="price fw-medium">${product.price}</span>
                          <span class="d-flex align-items-center gap-2">
                              <span class="star">
                                  <svg name="star-full" class="svg-icon text-warning pb-1">
                                      <use xlink:href="#star-full"></use>
                                  </svg>
                              </span>
                              <span>${product.rating}</span>
                          </span>
                      </div>
                  </div>
              </div>
          </article>
      </div>
      `;
  }

  function favoritesManagement(e) {
    favorites = getProductData("favorites") || [];

    const target = e.target.closest(".svg-icon");

    if (target) {
      const isLiked = target.classList.contains("heart-red");
      const productId = parseInt(target.closest(".card-item").dataset.id);
      const product = products.find((p) => p.id === productId);

      fetch(`https://dummyjson.com/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: `${isLiked ? "unLiked" : "liked"}` }),
      })
        .then((res) => res.json())
        .then((newProduct) => {
          product.category = newProduct.category;
          if (product.category === "liked" && !favorites.find((p) => p.id === productId)) {
            favorites.push(product);
          } else {
            favorites = favorites.filter((p) => p.id !== productId);
          }
          localStorage.setItem("favorites", JSON.stringify(favorites));
          updateCountLiked();
          updateProductData(products);
        });
      updateUIFavorite(target, isLiked);
    }
  }

  productList?.addEventListener("click", favoritesManagement);

  function updateCountLiked() {
    favorites = getProductData("favorites") || [];
    const countLiked = document.querySelector(".count-liked");
    if (countLiked) countLiked.innerText = favorites.length;
  }

  function updateUIFavorite(target, isLiked) {
    const liked = `${isLiked ? "heart" : "heart-red"}`;
    target.children[0].setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${liked}`);
    target.classList.remove("heart", "heart-red");
    target.classList.add(`${liked}`);
  }

  const handleFavourite = () => {
    if (modal) {
      displayFavorites(modal);
      renderFavourite(modal);
    }
  };

  modal?.addEventListener("mouseleave", () => {
    displayFavorites(modal);
  });

  if (favouriteBtn) favouriteBtn.addEventListener("click", handleFavourite);

  function displayFavorites(modal) {
    modal.classList.toggle("show");
  }

  function renderFavourite(modal) {
    favorites = getProductData("favorites") || [];

    const favoriteList = favorites?.length > 3 ? favorites.slice(0, 3) : favorites;
    const itemsList = modal.querySelector(".favourite-items-list");
    const itemCount = modal.querySelector(".favourite-count");

    if (itemCount) itemCount.innerText = `${favorites.length} item(s)`;
    if (itemsList)
      itemsList.innerHTML = `<p class="flex-grow-1 px-5 py-3 fs-2 border border-2 border-danger rounded-3">Bạn chưa chọn sản phẩm nào!</p>`;

    const isDetailPage = window.location.pathname.includes("product-details.html");
    if ((btnShow && isDetailPage) || (favorites?.length === 0 && !isDetailPage)) {
      btnShow.href = `./index.html`;
      btnShow.innerText = "View All Products";
    } else if (favorites?.length !== 0) {
      btnShow.href = `./product-details.html?id=${favorites[0].id}`;
      btnShow.innerText = "Show Details";
    }

    if (favoriteList?.length !== 0 && itemsList) {
      itemsList.innerHTML = favoriteList
        .map((favorite) => {
          return `
            <div class="card-contain card-favorite-contain col col">
              <article class="card-item d-flex flex-column">
                <div class="card-thumbs position-relative pt-100 mb-2 border border-black border-opacity-50 rounded-4">
                  <a class="thumb-link link-detail position-absolute inset-full flex-center p-2" href="./product-details.html?id=${favorite.id}">
                    <img loading="lazy" class="card-img object-fit-contain p-4 bg-black bg-opacity-05 rounded-4" src="${favorite.thumbnail}" alt="${favorite.title}" />
                  </a>
                </div>
                <div class="card-content w-100 px-2 d-flex flex-column justify-content-between flex-grow-1">
                  <h3 class="card-title py-3 fs-4 fw-normal">${favorite.brand}</h3>
                  <div class="card-body mb-3 text-body text-opacity-75">
                    <span class="card-price fs-3 fw-medium">$ ${favorite.price}</span>
                  </div>
                </div>
              </article>
            </div>
          `;
        })
        .join("");
    }
  }

  function handleActiveNav() {
    const navList = [...document.querySelectorAll(".nav-link")];

    navList.forEach((item) => {
      item.classList.remove("active");
      const itemPath = new URL(item.href).pathname;
      if (window.location.pathname.includes(itemPath)) {
        item.classList.add("active");
      }
    });
  }

  function manageProductDetail(e) {
    const link = e.target.closest(".link-detail");
    if (link) {
      e.preventDefault();
      const urlParams = new URLSearchParams(new URL(link.href).search);
      const productId = parseInt(urlParams.get("id"));

      let productDetail = products.find((p) => p.id === productId);
      if (!productDetail && products.length > 0) productDetail = products[0];
      if (productDetail) localStorage.setItem("productDetail", JSON.stringify(productDetail));

      setTimeout(() => {
        window.location.href = link.href;
      }, 100);
    }
  }

  function renderProductDetail(detail, element) {
    if (element) {
      const liked = `${detail.category === "liked" ? "heart-red" : "heart"}`;
      element.innerHTML = `
        <div class="container mx-auto d-flex py-3 row">
          <div class="mt-5 col-lg-6 col-xl-5 col-12 col-md-10 mx-auto h-100 col" style="min-height: 386px">
            <div class="position-relative pt-90 pt-3 rounded-4 shadow-sm">
              <div class="slider-details px-5 🌺 position-absolute inset-full">
                <img src="${detail.thumbnail}" alt="${detail.title}" />
              </div>
            </div>
            <p class="text-center px-4 mt-3">Shipping: ${detail.description}</p>
          </div>
          <div class="mt-5 col-lg-6 col-xl-7 col-12 col-md-10 mx-auto d-flex justify-content-between align-items-stretch col">
            <div class="p-5 flex-grow-1 rounded-4 bg-secondary shadow-sm d-flex flex-column">
              <h2 class="text-body fs-1">Featured Shops Modi, est rem voluptas nam!</h2>
              <h3 class="text-body mt-4 fs-2">${detail.title}</h3>
              <div class="p-3 mt-3 border border-2 rounded-4 shadow-sm d-flex flex-column flex-grow-1 justify-content-between">
                <div class="d-flex align-items-center justify-content-between px-4 py-3 fs-4">
                  $ ${detail.price}
                  <span class="ms-3 pt-1 pb-2 px-3 rounded-3 fs-5 text-success border text-bg-success bg-opacity-10">
                    10%
                  </span>
                  <div class="fs-2 fw-medium px-4 py-3">$ ${detail.discountPercentage || 0}</div>
                </div>
                <div class="d-flex align-items-center px-4 fs-3">
                  <div class="flex-grow-1">
                    <p class="">Brand: ${detail.brand || "Không xác định"}</p>
                    <p class="">Shipping: ${detail.shippingInformation || "Không có"}</p>
                  </div>
                  <div class="p-4 w-25">
                    <img src="${detail.meta?.qrCode || "default-qr.png"}" alt="Qr Code">
                  </div>
                </div>
                <div class="d-flex px-4 py-3 gap-4">
                  <a class="flex-center fs-3 w-100 fw-medium px-4 py-3 text-bg-warning text-center rounded-3" href="/products/checkout">
                    Add to cart
                  </a>
                  <span class="icon-heart-detail cursor-pointer flex-center ms-4 rounded-3">
                    <svg name="${liked}" class="svg-icon ${liked} fs-11 z-9">
                      <use xlink:href="#${liked}"></use>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  function loadProductDetail(detailEl) {
    const productDetail = JSON.parse(localStorage.getItem("productDetail"));
    if (productDetail !== null) {
      renderProductDetail(productDetail, detailEl);
    } else {
      fetchProductDetail(detailEl);
    }
  }

  function fetchProductDetail(detailEl) {
    const params = new URLSearchParams(window.location.search);
    const randomId = Math.floor(Math.random() * (products?.length || 100));
    const id = params.get("id") || randomId;

    fetch(`https://dummyjson.com/products/${id}`)
      .then((res) => res.json())
      .then((product) => renderProductDetail(product, detailEl))
      .catch((error) => {
        detailEl.innerHTML = `<p class="flex-center px-5 py-3 fs-2 border border-2 border-danger rounded-3">Không tìm thấy sản phẩm.</p>`;
        console.error(error);
      });
  }

  function clearProductDetail() {
    if (!window.location.pathname.includes("product-details.html")) {
      localStorage.removeItem("productDetail");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const detailEl = document.querySelector(".product-detail");
    const isProductDetailPage = window.location.pathname.includes("product-details.html");
    handleActiveNav();

    if (isProductDetailPage && detailEl) {
      loadProductDetail(detailEl);
    } else {
      clearProductDetail();
    }
  });
  document.addEventListener("click", manageProductDetail);

  initializeData(url);
}

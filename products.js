let products = null;
let favorites = null;
const STORAGE_KEY = "productData";
const url = "https://dummyjson.com/products";

const productList = document.querySelector(".products");

// Khởi tạo dữ liệu
function initializeData(url) {
    products = getProductData(STORAGE_KEY);

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
        productList.innerHTML = products
            .map((product) => {
                return renderProduct(product);
            })
            .join("");
    }
}

function renderProduct(product) {
    const liked = `${product.category === "liked" ? "heart-red" : "heart"}`;
    updateCountLiked();
    if (product)
        return `
    <div class="card-contain col-10 col-sm-6 col-md-4 col-lg-3 col">
        <article
            data-id="${product.id}"
            class="card-item d-flex flex-column justify-content-between bg-secondary-subtle border border-black border-opacity-10 overflow-hidden rounded-5 shadow">
            <div class="card-thumbs position-relative pt-100 rounded-top-5">
                <a
                    class="thumb-link position-absolute inset-full flex-center p-4 border-bottom"
                    href="/product-details.html">
                    <img
                        loading="lazy"
                        class="card-img object-fit-contain rounded-4"
                        src=${product.thumbnail}
                        alt="Product Image" />
                </a>
                <span class="card-favourite flex-center position-absolute shadow cursor-pointer z-3">
                    <svg name= ${liked} class="svg-icon ${liked} fs-11 z-9">
                        <use xlink:href=#${liked}></use>
                    </svg>
                </span>
            </div>
            <div class="card-content w-100 pt-3 pb-4 d-flex flex-column justify-content-between flex-grow-1">
                <h3 class="card-title text-body text-opacity-75">
                    ${product.title}
                </h3>
                <p class="card-desc">${product.description}</p>
                <div>
                    <span class="brand text-body text-opacity-50 fst-italic"> ${product.brand}</span>
                    <div
                        class="card-assess d-flex align-items-center justify-content-between text-body text-opacity-75">
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

productList.addEventListener("click", favoritesManagement);

function updateCountLiked() {
    favorites = getProductData("favorites") || [];
    const countLiked = document.querySelector(".count-liked");
    countLiked.innerText = favorites.length;
}

function updateUIFavorite(target, isLiked) {
    const liked = `${isLiked ? "heart" : "heart-red"}`;
    target.children[0].setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${liked}`);
    target.classList.remove("heart", "heart-red");
    target.classList.add(`${liked}`);
}

function manageProductDetails() {}

initializeData(url);

function normalizeQuery(q){
  return (q || "")
    .toLowerCase()
    .replace("post", "")
    .replace(/\s+/g, " ")
    .trim();
}

function codeVariants(id){
  const n = String(id).trim();
  return [n, `ul-${n}`];
}

function matchesProduct(product, query){
  if(!query) return true;
  const q = normalizeQuery(query);

  const id = String(product.id || "").trim();
  const code = `UL-${id}`;
  const name = (product.name || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();

  // direct code match: 111, ul-111, "post 111"
  if(codeVariants(id).some(v => q.includes(v))) return true;

  // keyword match
  return name.includes(q) || cat.includes(q);
}

function renderProducts(products, mountEl, query, category){
  const filtered = products
    .filter(p => (p.status || "Active") === "Active")
    .filter(p => category ? (p.category === category) : true)
    .filter(p => matchesProduct(p, query));

  mountEl.innerHTML = filtered.map(p => {
    const id = String(p.id).trim();
    const code = `UL-${id}`;
    const img = p.image || "";
    const alt = p.alt || (p.name ? p.name : code);
    const name = p.name ? p.name : "";
    return `
      <div class="card">
        <img class="img" src="${img}" alt="${alt}">
        <div class="cardBody">
          <div class="code">${code}</div>
          <div class="name">${name}</div>
          <a class="buy" href="${p.affiliate}" rel="nofollow sponsored noopener" target="_blank">BUY</a>
        </div>
      </div>
    `;
  }).join("");

  if(filtered.length === 0){
    mountEl.innerHTML = `<div class="empty">No products found.</div>`;
  }
}

function main(){
  const products = window.__PRODUCTS__ || [];
  const mount = document.querySelector("[data-products]");
  const input = document.querySelector("[data-search]");
  const category = document.body.getAttribute("data-category") || "";

  function update(){
    renderProducts(products, mount, input.value, category || "");
    // update URL for shareable searches (home + category)
    const params = new URLSearchParams(location.search);
    if(input.value){
      params.set("q", input.value);
    } else {
      params.delete("q");
    }
    const newUrl = `${location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
    window.history.replaceState({}, "", newUrl);
  }

  input.addEventListener("input", update);

  // Support URL query: ?q=111
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if(q){
    input.value = q;
  }

  update();
}

document.addEventListener("DOMContentLoaded", main);

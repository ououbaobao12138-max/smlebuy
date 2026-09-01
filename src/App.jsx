import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { convertLink, SUPPORTED_AGENTS } from "../files/linkConverter.js";
import * as XLSX from "xlsx";

const products = [
  {
    id: 1,
    shopId: "main",
    name: "Field Shell Jacket",
    category: "Outerwear",
    price: 148,
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    tone: "olive",
  },
  {
    id: 2,
    shopId: "main",
    name: "Form Runner 02",
    category: "Footwear",
    price: 96,
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    tone: "red",
  },
  {
    id: 3,
    shopId: "main",
    name: "Studio Knit Polo",
    category: "Tops",
    price: 72,
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
    tone: "cream",
  },
  {
    id: 4,
    shopId: "main",
    name: "Transit Tote",
    category: "Accessories",
    price: 84,
    tag: "Limited",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85",
    tone: "black",
  },
  {
    id: 5,
    shopId: "main",
    name: "Everyday Overshirt",
    category: "Outerwear",
    price: 110,
    tag: "Restocked",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
    tone: "blue",
  },
  {
    id: 6,
    shopId: "main",
    name: "Canvas Court Low",
    category: "Footwear",
    price: 88,
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85",
    tone: "white",
  },
  {
    id: 7,
    shopId: "main",
    name: "Heavyweight Crew",
    category: "Tops",
    price: 64,
    tag: "Core",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85",
    tone: "grey",
  },
  {
    id: 8,
    shopId: "main",
    name: "Utility Cap",
    category: "Accessories",
    price: 38,
    tag: "Core",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=85",
    tone: "green",
  },
];

const categories = [
  "All products",
  "Trending",
  "New arrivals",
  "Shoes",
  "Coats / jackets",
  "Hoodies",
  "Polo",
  "Sweatpants",
  "Shorts",
  "Short Sleeve Suit",
  "Jeans",
  "T-shirts",
  "Watches",
  "Hats",
  "Accessories",
  "Electronics",
];
const categoryMap = {
  "All products": "All pieces",
  Shoes: "Footwear",
  "Coats / jackets": "Outerwear",
  Hoodies: "Tops",
  Polo: "Polo",
  Sweatpants: "Sweatpants",
  Shorts: "Shorts",
  Jeans: "Jeans",
  "T-shirts": "T-shirts",
  "Short Sleeve Suit": "Short Sleeve Suit",
  Watches: "Watches",
  Hats: "Hats",
  Accessories: "Accessories",
  Electronics: "Electronics",
};
const normalizeCategory = (value) => {
  const category = String(value || "").trim().toLowerCase();
  const compactCategory = category.replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
  if (compactCategory.includes("shortsleevesuit") || compactCategory.includes("shortsleeveset") || compactCategory.includes("短袖套装")) return "Short Sleeve Suit";
  if (compactCategory.includes("shorts") || compactCategory.includes("短裤")) return "Shorts";
  if (compactCategory.includes("polo")) return "Polo";
  if (compactCategory.includes("tshirt") || compactCategory.includes("tee") || compactCategory.includes("t恤")) return "T-shirts";
  if (compactCategory.includes("watch") || compactCategory.includes("手表") || compactCategory.includes("腕表")) return "Watches";
  if (compactCategory.includes("hat") || compactCategory.includes("cap") || compactCategory.includes("帽子") || compactCategory.includes("帽")) return "Hats";
  if (compactCategory.includes("downjacket") || compactCategory.includes("jacket") || compactCategory.includes("vest") || compactCategory.includes("外套") || compactCategory.includes("夹克") || compactCategory.includes("羽绒")) return "Outerwear";
  if (["shoes", "shoe", "鞋类", "鞋子"].includes(category)) return "Footwear";
  if (["sliders", "slides", "slippers", "拖鞋"].includes(category)) return "Footwear";
  if (["coats / jackets", "outerwear", "jackets", "外套", "夹克"].includes(category)) return "Outerwear";
  if (["hoodies", "hoodie", "tops", "上衣", "连帽衫"].includes(category)) return "Tops";
  if (["polo", "polo shirt", "polo shirts"].includes(category)) return "Polo";
  if (["t-shirts", "t-shirt", "tee", "tees", "t恤"].includes(category)) return "T-shirts";
  if (["sweatpants", "sweatpant", "运动裤"].includes(category)) return "Sweatpants";
  if (["shorts", "短裤"].includes(category)) return "Shorts";
  if (["short sleeve suit", "short sleeve set", "短袖套装"].includes(category)) return "Short Sleeve Suit";
  if (["jeans", "牛仔裤"].includes(category)) return "Jeans";
  if (["watch", "watches", "手表", "腕表"].includes(category)) return "Watches";
  if (["hat", "hats", "cap", "caps", "帽子", "帽"].includes(category)) return "Hats";
  if (["accessories", "accessory", "配饰"].includes(category)) return "Accessories";
  if (["electronics", "电子产品"].includes(category)) return "Electronics";
  return String(value || "Tops").trim() || "Tops";
};
const inferCategory = (product) => {
  const text = `${product.name || ""} ${product.category || ""}`.toLowerCase();
  if (/shoe|sneaker|trainer|af1|aj1|jordan|yeezy|runner|slide|slipper|loafer|鞋|拖鞋/.test(text)) return "Footwear";
  if (/jacket|coat|parka|vest|hoodie|cardigan|windbreaker|夹克|外套|羽绒/.test(text)) return text.includes("hoodie") ? "Tops" : "Outerwear";
  if (/short sleeve suit|short sleeve set|短袖套装/.test(text)) return "Short Sleeve Suit";
  if (/shorts|短裤/.test(text)) return "Shorts";
  if (/pants|trouser|jean|sweatpant|cargo|运动裤|牛仔/.test(text)) return text.includes("jean") || text.includes("牛仔") ? "Jeans" : "Sweatpants";
  if (/polo/.test(text)) return "Polo";
  if (/t-shirt|tee|t恤/.test(text)) return "T-shirts";
  if (/watch|watches|手表|腕表/.test(text)) return "Watches";
  if (/hat|hats|cap|caps|帽子|帽/.test(text)) return "Hats";
  if (/bracelet|bag|tote|cap|wallet|case|belt|accessor|手链|包|帽|配饰/.test(text)) return "Accessories";
  if (/electronic|phone|earbud|headphone|speaker|电子|耳机/.test(text)) return "Electronics";
  return normalizeCategory(product.category);
};
const resolveCategory = (product) => product.category && String(product.category).trim() ? normalizeCategory(product.category) : inferCategory(product);
const isImageSource = (value) => /^(https?:\/\/|data:image\/)/i.test(String(value || "").trim());
const splitImageSources = (value) => String(value || "").split(/\r?\n|;(?=\s*(?:https?:\/\/|data:image\/))/i).map((image) => image.trim()).filter(Boolean);
const getProductImages = (product) => {
  const values = Array.isArray(product.images) ? product.images : splitImageSources(product.image || "");
  return [...new Set(values.map((image) => String(image).trim()).filter(isImageSource))];
};
const currencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  BRL: 5.45,
  DKK: 6.87,
  GHS: 15.2,
  JPY: 149.5,
  MXN: 18.7,
  NZD: 1.66,
  NOK: 10.7,
  PLN: 3.95,
  RUB: 92,
  SEK: 10.5,
  CHF: 0.88,
  KRW: 1380,
  CNY: 1,
};
const defaultAffiliateCodes = {
  kakobuy: { code: "wrt8j" },
  joyagoo: { code: "300998378" },
  usfans: { code: "VENEBG" },
  litbuy: { code: "7W9RUM05J" },
  mulebuy: { code: "200912184" },
  oopbuy: { code: "L06YKDLID" },
  gtbuy: { code: "WCVBWCN8T" },
  hipobuy: { code: "N7JFK753S" },
  cssbuy: { code: "289af327d7f1ccd1" },
  lovegobuy: { code: "4RE5ZO" },
  ossbuy: { code: "YYWLHGHB" },
  vigorbuy: { code: "aP7B6oG0" },
  itaobuy: { code: "YCAKGHZW" },
  rizzitgo: { code: "C7F16C" },
  hubbuy: { code: "lXQZJDZE" },
  bbdbuy: { code: "OLJ967" },
  boonbuy: { code: "H7FJFCPCP" },
};

const formatPrice = (price, currency) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
  }).format(price * currencyRates[currency]);
const formatProductPrice = (product, currency) => {
  const amount = product.priceCurrency === "CNY" ? product.price / 7.2 : product.price;
  return formatPrice(amount, currency);
};
const PRODUCTS_PER_PAGE = 30;
const STOREFRONT_DOMAIN = "xsomsiadd.net";

const getStoreSubdomain = () => {
  const hostname = window.location.hostname.toLowerCase();
  const suffix = `.${STOREFRONT_DOMAIN}`;
  if (!hostname.endsWith(suffix)) return "";
  const subdomain = hostname.slice(0, -suffix.length);
  return subdomain === "www" ? "" : subdomain;
};

function App() {
  const [activeCategory, setActiveCategory] = useState("All products");
  const [sort, setSort] = useState("Featured");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const [viewPath, setViewPath] = useState(() => window.location.pathname);
  const [inventory, setInventory] = useState(() => {
    const stored = localStorage.getItem("north-form-inventory");
    return stored
      ? JSON.parse(stored).map((product) => ({ ...product, priceCurrency: product.priceCurrency || (product.id <= 8 ? "USD" : "CNY") }))
      : products.map((product, index) => ({
          ...product,
          priceCurrency: "USD",
          status: index === 3 ? "Draft" : "Live",
        }));
  });
  const [localeOpen, setLocaleOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [adminTab, setAdminTab] = useState("catalog");
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Tops",
    price: "",
    image: "",
    qcAvailable: false,
    qcPhotos: "",
  });
  const [sourceUrl, setSourceUrl] = useState("");
  const [targetAgent, setTargetAgent] = useState("kakobuy");
  const [convertedUrl, setConvertedUrl] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [agentUrls, setAgentUrls] = useState({});
  const [uploadMessage, setUploadMessage] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkCategory, setBulkCategory] = useState("Shoes");
  const [selectedStore, setSelectedStore] = useState("");
  const [browseShopId, setBrowseShopId] = useState("all");
  const [storefrontShopId, setStorefrontShopId] = useState(() => new URLSearchParams(window.location.search).get("shop") || "main");
  const [productPage, setProductPage] = useState(1);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [qcEditProduct, setQcEditProduct] = useState(null);
  const [qcEditForm, setQcEditForm] = useState({ qcAvailable: false, qcPhotos: "" });
  const [shopForm, setShopForm] = useState({ name: "", username: "", password: "", role: "partner" });
  const [shops, setShops] = useState(() => {
    const storedShops = JSON.parse(localStorage.getItem("north-form-shops") || "null");
    const mainShop = { id: "main", name: "smlebuy", username: "主店账号", role: "main", owner: true };
    if (!storedShops) return [mainShop];
    const otherShops = storedShops.filter((shop) => shop.id !== "main" && shop.name.toLowerCase() !== "smlebuy");
    return [mainShop, ...otherShops];
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Editor" });
  const [accounts, setAccounts] = useState(() => JSON.parse(localStorage.getItem("north-form-accounts") || "null") || [
    { id: "owner", email: "you@northform.store", title: "所有者账号", role: "Owner", lastActive: "刚刚", access: "全部权限", owner: true },
    { id: "anna", email: "anna@northform.store", title: "商品管理员", role: "Editor", lastActive: "今天 09:42", access: "仅商品" },
    { id: "mika", email: "mika@northform.store", title: "客服团队", role: "Viewer", lastActive: "昨天", access: "仅订单" },
  ]);
  const [displayAgents, setDisplayAgents] = useState(() => JSON.parse(localStorage.getItem("north-form-display-agents") || "null") || SUPPORTED_AGENTS.map((agent) => agent.value));
  const [affiliateCodes, setAffiliateCodes] = useState(() => JSON.parse(localStorage.getItem("north-form-affiliate-codes") || "null") || defaultAffiliateCodes);
  const [affiliateDraft, setAffiliateDraft] = useState(affiliateCodes);
  const isAdmin = viewPath === "/admin";

  const languages = [
    "English",
    "简体中文",
    "Čeština",
    "Français",
    "Deutsch",
    "Italiano",
    "日本語",
    "Polski",
    "Português",
    "Русский",
    "Español",
    "한국어",
    "Svenska",
    "Dansk",
    "Norsk",
  ];
  const currencies = [
    "USD",
    "EUR",
    "GBP",
    "AUD",
    "CAD",
    "BRL",
    "DKK",
    "GHS",
    "JPY",
    "MXN",
    "NZD",
    "NOK",
    "PLN",
    "RUB",
    "SEK",
    "CHF",
    "KRW",
  ];
  const chinese = language === "简体中文" || isAdmin;
  const categoryText = {
    "All products": "全部商品",
    Shoes: "鞋类",
    Sliders: "拖鞋",
    "Coats / jackets": "外套 / 夹克",
    Hoodies: "连帽衫",
    Polo: "Polo",
    Sweatpants: "运动裤",
    Shorts: "短裤",
    Jeans: "牛仔裤",
    "T-shirts": "T恤",
    Watches: "手表",
    Hats: "帽子",
    Accessories: "配饰",
    Electronics: "电子产品",
  };
  const productText = {
    Outerwear: "外套",
    Footwear: "鞋类",
    Tops: "上衣",
    Polo: "Polo",
    "T-shirts": "T恤",
    "Short Sleeve Suit": "短袖套装",
    Accessories: "配饰",
    Watches: "手表",
    Hats: "帽子",
    Sweatpants: "运动裤",
    Shorts: "短裤",
    Jeans: "牛仔裤",
    Electronics: "电子产品",
  };
  const frontendCategories = useMemo(() => {
    const productCategories = inventory
      .filter((product) => product.status !== "Draft")
      .map((product) => resolveCategory(product))
      .filter(Boolean);
    const dynamicCategories = productCategories.map((category) =>
      Object.keys(categoryMap).find((key) => categoryMap[key] === category) || category,
    );
    return [...new Set([...categories, ...dynamicCategories])];
  }, [inventory]);

  useEffect(() => {
    const subdomain = getStoreSubdomain();
    if (!subdomain) return;
    const matchedShop = shops.find((shop) => String(shop.username || "").toLowerCase() === subdomain);
    if (matchedShop) setStorefrontShopId(String(matchedShop.id));
  }, [shops]);

  const visibleProducts = useMemo(() => {
    const visibleShopId = isAdmin ? browseShopId : storefrontShopId;
    const filtered = inventory.filter((product) => {
      if (product.status === "Draft") return false;
      if (visibleShopId !== "all" && String(product.shopId || "main") !== String(visibleShopId)) return false;
      const targetCategory = categoryMap[activeCategory] || activeCategory;
      const matchesCategory =
        targetCategory === "All pieces" ||
        resolveCategory(product) === targetCategory ||
        (activeCategory === "Accessories" && resolveCategory(product) === "Accessories") ||
        (activeCategory === "Trending" && product.tag === "Popular") ||
        (activeCategory === "New arrivals" && product.tag === "New");
      const matchesQuery = product.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "Price: low") return a.price - b.price;
      if (sort === "Price: high") return b.price - a.price;
      return a.id - b.id;
    });
  }, [activeCategory, browseShopId, inventory, isAdmin, query, sort, storefrontShopId]);
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE));
  const currentProductPage = Math.min(productPage, pageCount);
  const paginatedProducts = visibleProducts.slice((currentProductPage - 1) * PRODUCTS_PER_PAGE, currentProductPage * PRODUCTS_PER_PAGE);
  useEffect(() => { setProductPage(1); }, [activeCategory, query, sort]);

  const toggleSaved = (id) =>
    setSaved((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  const updateInventory = (items) => {
    setInventory(items);
    localStorage.setItem("north-form-inventory", JSON.stringify(items));
  };
  const completeCategories = () => {
    const next = inventory.map((product) => ({ ...product, category: inferCategory(product) }));
    updateInventory(next);
    setUploadMessage(`已核对并补全 ${next.length} 件产品的分类。`);
  };
  const toggleProductTag = (product, tag) => {
    updateInventory(
      inventory.map((item) =>
        item.id === product.id
          ? { ...item, tag: item.tag === tag ? "Imported" : tag }
          : item,
      ),
    );
  };
  const deleteProduct = (product) => {
    const message = chinese
      ? `确定要删除“${product.name}”吗？`
      : `Delete "${product.name}"?`;
    if (window.confirm(message)) {
      updateInventory(inventory.filter((item) => item.id !== product.id));
    }
  };
  const deleteProductsByShop = () => {
    const targetProducts = inventory.filter((product) => browseShopId === "all" || (product.shopId || "main") === browseShopId);
    if (!targetProducts.length) return;
    const shopName = browseShopId === "all" ? "全部店铺" : shops.find((shop) => shop.id === browseShopId)?.name || "当前店铺";
    if (!window.confirm(`确定要删除${shopName}的全部 ${targetProducts.length} 件产品吗？此操作不可恢复。`)) return;
    updateInventory(inventory.filter((product) => browseShopId !== "all" && (product.shopId || "main") !== browseShopId));
    setUploadMessage(`已删除${shopName}的 ${targetProducts.length} 件产品。`);
  };
  const importRows = (rows) => {
    let headers = rows[0]?.map((header) =>
      String(header)
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase(),
    );
    const requiredHeaders = ["name", "price", "image", "category", "weidian_url"];
    const headerIndexes = Object.fromEntries(requiredHeaders.map((header) => [header, headers?.indexOf(header)]));
    if (headers?.length === 1 && /name\s+price\s+image\s+category\s+weidian_url/i.test(headers[0])) {
      headers = requiredHeaders;
      requiredHeaders.forEach((header, index) => { headerIndexes[header] = index; });
    }
    if (!headers || requiredHeaders.some((header) => headerIndexes[header] < 0)) {
      setUploadMessage(
        chinese
          ? "导入失败：表头必须为 name, price, image, category, weidian_url。"
          : "Import failed: use headers name, price, image, category, weidian_url.",
      );
      return;
    }
    const qcAvailableIndex = headers.indexOf("qc_available");
    const qcPhotosIndex = headers.indexOf("qc_photos");
    const imported = rows
      .slice(1)
      .filter((row) => row[headerIndexes.name] && row[headerIndexes.price])
      .map((row, index) => ({
        id: Date.now() + index,
        shopId: selectedStore || "main",
        name: String(row[headerIndexes.name] || row[0]).trim(),
        price: Number(row[headerIndexes.price] ?? row[1]) || 0,
        priceCurrency: "CNY",
        image: String(row[headerIndexes.image] || row[2] || "").split(/[;|\n]/)[0].trim() || products[2].image,
        images: getProductImages({ image: row[headerIndexes.image] || row[2] || "" }),
        category: inferCategory({ name: row[headerIndexes.name] || row[0], category: row[headerIndexes.category] || bulkCategory }),
        tag: "Imported",
        status: "Live",
        weidian_url: String(row[headerIndexes.weidian_url] || row[4] || "").trim(),
        qcAvailable: qcAvailableIndex >= 0 && ["true", "yes", "1", "y"].includes(String(row[qcAvailableIndex] || "").trim().toLowerCase()),
        qcPhotos: qcPhotosIndex >= 0 ? splitImageSources(row[qcPhotosIndex]).filter(isImageSource) : [],
      }));
    if (!imported.length) {
      setUploadMessage(
        chinese
          ? "导入失败：没有找到有效商品。"
          : "Import failed: no valid products found.",
      );
      return;
    }
    updateInventory([...inventory, ...imported]);
    setUploadMessage(
      chinese
        ? `导入成功：已添加 ${imported.length} 件商品。`
        : `Import successful: ${imported.length} product(s) added.`,
    );
    setBulkText("");
  };
  const parseSheetText = (text) =>
    String(text || "")
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter((row) => row.trim())
      .map((row, rowIndex, rows) => {
        if (!row.includes("\t") && !row.includes(",") && rowIndex > 0 && rows[0].match(/name\s+price\s+image\s+category\s+weidian_url/i)) {
          const match = row.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s+(https?:\/\/\S+)\s+([A-Za-z][A-Za-z /_-]*)\s+(https?:\/\/\S+)$/i);
          if (match) return [match[1], match[2], match[3], match[4].trim(), match[5]];
        }
        const separator = row.includes("\t")
          ? /\t/
          : row.includes(",")
            ? /,/
            : /\s{2,}/;
        return row
          .split(separator)
          .map((cell) => cell.trim().replace(/^"|"$/g, ""));
      });
  const importPastedProducts = () => {
    importRows(parseSheetText(bulkText));
  };
  const addProduct = (event) => {
    event.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    updateInventory([
      ...inventory,
      {
        ...newProduct,
        id: Date.now(),
        shopId: selectedStore || "main",
        price: Number(newProduct.price),
        priceCurrency: "CNY",
        tag: "New",
        status: "Live",
        image: String(newProduct.image || "").split(/[;|\n]/)[0].trim() || products[2].image,
        images: getProductImages({ image: newProduct.image || products[2].image }),
        qcAvailable: newProduct.qcAvailable,
        qcPhotos: splitImageSources(newProduct.qcPhotos).filter(isImageSource),
      },
    ]);
    setNewProduct({ name: "", category: "Tops", price: "", image: "", qcAvailable: false, qcPhotos: "" });
    setSourceUrl("");
    setConvertedUrl("");
    setAddProductOpen(false);
  };
  const handleConvert = async () =>
    setConvertedUrl(await convertLink(sourceUrl, targetAgent));
  const appendImageFiles = (event, field, setter) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    }))).then((images) => {
      setter((current) => ({ ...current, [field]: [current[field], ...images].filter(Boolean).join("\n") }));
      event.target.value = "";
    });
  };
  const appendQcFiles = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    Promise.all(files.map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    }))).then((images) => {
      setQcEditForm((current) => ({ ...current, qcAvailable: true, qcPhotos: [current.qcPhotos, ...images].filter(Boolean).join("\n") }));
      event.target.value = "";
    });
  };
  const downloadTemplate = () => {
    const blob = new Blob(
      [
        "name,price,image,category,weidian_url\nDaily Transit Jacket,120,https://example.com/image.jpg,Outerwear,https://weidian.com/item.html?itemID=123456789",
      ],
      { type: "text/csv;charset=utf-8" },
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product-upload-template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const importProducts = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileName = file.name.toLowerCase();
    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls") &&
      !fileName.endsWith(".txt")
    ) {
      setUploadMessage(
        chinese
          ? "上传失败：请选择 CSV、Excel 或 TXT 文件。"
          : "Upload failed: please choose a CSV, Excel, or TXT file.",
      );
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      let rows;
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const workbook = XLSX.read(reader.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils
          .sheet_to_json(sheet, { header: 1, defval: "", raw: false })
          .map((row) => row.map((cell) => String(cell).trim()));
      } else {
        rows = parseSheetText(reader.result);
      }
      importRows(rows);
      event.target.value = "";
    };
    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))
      reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };
  const uploadTools = (
    <div className="upload-tools">
      <button type="button" onClick={downloadTemplate}>
        {chinese ? "下载 CSV 模板" : "Download CSV template"}
      </button>
      <label>
        {chinese ? "上传商品表" : "Import product sheet"}
        <input
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={importProducts}
        />
      </label>
      <small>
        {chinese
          ? "格式：name, price, image, category, weidian_url（支持 CSV / Excel）"
          : "Columns: name, price, image, category, weidian_url (CSV / Excel)"}
      </small>
      {uploadMessage && (
        <strong
          className={
            uploadMessage.includes(chinese ? "失败" : "failed")
              ? "upload-error"
              : "upload-success"
          }
        >
          {uploadMessage}
        </strong>
      )}
    </div>
  );
  const switchView = (admin) => {
    window.history.pushState({}, "", admin ? "/admin" : "/");
    setViewPath(admin ? "/admin" : "/");
  };
  const selectStorefrontShop = (shopId) => {
    const url = new URL(window.location.href);
    if (shopId === "main") url.searchParams.delete("shop");
    else url.searchParams.set("shop", shopId);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    setStorefrontShopId(shopId);
  };
  const openProduct = (product) => setSelectedProduct(product);
  const agentUrlFor = (product, agent) =>
    product.weidian_url ? agentUrls[agent] || "#" : "#";
  useEffect(() => {
    let cancelled = false;
    if (!selectedProduct?.weidian_url) {
      setAgentUrls({});
      return undefined;
    }
    Promise.all(
      SUPPORTED_AGENTS.filter((agent) => displayAgents.includes(agent.value)).map(async (agent) => [
        agent.value,
        await convertLink(selectedProduct.weidian_url, agent.value, affiliateCodes),
      ]),
    ).then((entries) => {
      if (!cancelled) setAgentUrls(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedProduct, affiliateCodes, displayAgents]);
  const saveAffiliateSettings = () => {
    setAffiliateCodes(affiliateDraft);
    localStorage.setItem("north-form-affiliate-codes", JSON.stringify(affiliateDraft));
    localStorage.setItem("north-form-display-agents", JSON.stringify(displayAgents));
    setUploadMessage(chinese ? "联盟代码和展示平台已保存。" : "Affiliate codes and display platforms saved.");
  };
  const addAccount = (event) => {
    event.preventDefault();
    if (!inviteForm.email.trim()) return;
    const access = inviteForm.role === "Editor" ? "仅商品" : "仅查看";
    const next = [...accounts, { id: Date.now(), email: inviteForm.email.trim(), title: inviteForm.role === "Editor" ? "商品管理员" : "查看账号", role: inviteForm.role, lastActive: "尚未登录", access }];
    setAccounts(next);
    localStorage.setItem("north-form-accounts", JSON.stringify(next));
    setInviteForm({ email: "", role: "Editor" });
    setInviteOpen(false);
  };
  const removeAccount = (account) => {
    if (account.owner) return;
    if (!window.confirm(`确定要删除子账号 ${account.email} 吗？`)) return;
    const next = accounts.filter((item) => item.id !== account.id);
    setAccounts(next);
    localStorage.setItem("north-form-accounts", JSON.stringify(next));
  };
  const addShop = (event) => {
    event.preventDefault();
    if (!shopForm.name.trim() || !shopForm.username.trim() || !shopForm.password.trim()) return;
    const username = shopForm.username.trim().toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(username)) {
      setUploadMessage("店铺子域名只能使用英文小写字母、数字和短横线。");
      return;
    }
    if (shops.some((shop) => String(shop.username || "").toLowerCase() === username)) {
      setUploadMessage("该店铺子域名已被使用，请更换一个。");
      return;
    }
    const next = [...shops, { id: username, name: shopForm.name.trim(), username, password: shopForm.password, role: shopForm.role }];
    setShops(next);
    localStorage.setItem("north-form-shops", JSON.stringify(next));
    setShopForm({ name: "", username: "", password: "", role: "partner" });
    setShopModalOpen(false);
  };
  const removeShop = (shop) => {
    if (shop.owner) return;
    if (!window.confirm(`确定要删除合作店铺“${shop.name}”吗？`)) return;
    const next = shops.filter((item) => item.id !== shop.id);
    setShops(next);
    localStorage.setItem("north-form-shops", JSON.stringify(next));
  };
  const openQcEditor = (product) => {
    setQcEditProduct(product);
    setQcEditForm({ qcAvailable: Boolean(product.qcAvailable), qcPhotos: (product.qcPhotos || []).join(";") });
  };
  const saveQcEdit = (event) => {
    event.preventDefault();
    const qcPhotos = splitImageSources(qcEditForm.qcPhotos).filter(isImageSource);
    const productImages = new Set(getProductImages(qcEditProduct));
    updateInventory(inventory.map((item) => {
      const sharesProductImage = getProductImages(item).some((image) => productImages.has(image));
      return sharesProductImage
        ? { ...item, qcAvailable: qcEditForm.qcAvailable, qcPhotos }
        : item;
    }));
    setQcEditProduct(null);
  };

  // 调试：打印产品列表
  useEffect(() => {
    console.log("当前库存:", inventory);
    console.log("可见产品:", visibleProducts);
    console.log("分页产品:", paginatedProducts);
  }, [inventory, visibleProducts, paginatedProducts]);

  return (
    <div className="storefront">
      <header className="site-header">
        <button className="mobile-menu" aria-label="Open menu">
          =
        </button>
        <a className="wordmark" href="#top">
          {chinese ? "商店" : "Store"}
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="#shop" onClick={() => switchView(false)}>
            {chinese ? "新品" : "New Arrivals"}
          </a>
        </nav>
        <div className="header-actions">
          <button className="locale" onClick={() => setLocaleOpen(true)}>
            {isAdmin ? "简体中文" : language} / {currency}
          </button>
          <label className="search">
            <span>{chinese ? "搜索商品..." : "Search products..."}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={chinese ? "搜索商品..." : "Search products..."}
              aria-label={chinese ? "搜索商品" : "Search products"}
            />
          </label>
        </div>
      </header>

      {selectedProduct ? (
        <main className="product-detail-page">
          <button
            className="back-button"
            onClick={() => setSelectedProduct(null)}
            aria-label="返回商品列表"
          >
            ←
          </button>
          <div className="detail-locale">
            <button className="locale" onClick={() => setLocaleOpen(true)}>
              {isAdmin ? "简体中文" : language} / {currency}
            </button>
          </div>
          <section className="product-detail">
            <div className="detail-image">
              <img className="zoomable-image" src={getProductImages(selectedProduct)[0] || selectedProduct.image} alt={selectedProduct.name} onClick={() => setLightboxImage(getProductImages(selectedProduct)[0] || selectedProduct.image)} />
              {getProductImages(selectedProduct).length > 1 && <div className="detail-thumbnails">{getProductImages(selectedProduct).map((image) => <img className="zoomable-image" src={image} alt="" key={image} onClick={() => setLightboxImage(image)} />)}</div>}
            </div>
            <div className="detail-info">
              <p className="breadcrumb">
                {chinese ? "首页 › 新品 › " : "Home › New Arrivals › "}
                {chinese
                  ? productText[selectedProduct.category] ||
                    selectedProduct.category
                  : selectedProduct.category}
              </p>
              <h1>{selectedProduct.name}</h1>
              <strong className="detail-price">
                {formatProductPrice(selectedProduct, currency)}
              </strong>
              <div className="agent-links">
                <p>{chinese ? "选择代理购买" : "Choose an agent"}</p>
                {SUPPORTED_AGENTS.filter((agent) => displayAgents.includes(agent.value)).map((agent) => (
                  <a
                    className="agent-button"
                    key={agent.value}
                    href={agentUrlFor(selectedProduct, agent.value)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img className="agent-icon" src={agent.icon} alt="" />
                    {chinese
                      ? `通过 ${agent.label} 购买`
                      : `Buy on ${agent.label}`}
                  </a>
                ))}
              </div>
            </div>
          </section>
              {selectedProduct.qcPhotos?.length > 0 && <section className="qc-section"><div className="qc-heading"><h2>QC Photo</h2><span>{selectedProduct.qcPhotos.length} photos</span></div><div className="qc-gallery">{selectedProduct.qcPhotos.map((photo) => <img className="zoomable-image" src={photo} alt={`${selectedProduct.name} QC`} key={photo} onClick={() => setLightboxImage(photo)} />)}</div></section>}
        </main>
      ) : isAdmin ? (
        <main className="admin-page">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">
                {chinese
                  ? "管理后台 / 商品工作区"
                  : "Admin / Product workspace"}
              </p>
              <h1>
                {chinese ? (
                  <>
                    商品管理
                    <br />
                    <em>控制台</em>
                  </>
                ) : (
                  <>
                    Product
                    <br />
                    <em>dashboard</em>
                  </>
                )}
              </h1>
            </div>
            <button
              className="primary-action"
              onClick={() => setAddProductOpen(true)}
            >
              + {chinese ? "添加商品" : "Add product"}
            </button>
          </section>
          <div className="admin-tabs">
            <button
              onClick={() => {
                setAdminTab("add");
                setAddProductOpen(true);
              }}
            >
              {chinese ? "添加产品" : "Add product"}
            </button>
            <button
              className={adminTab === "bulk" ? "active" : ""}
              onClick={() => setAdminTab("bulk")}
            >
              {chinese ? "批量导入" : "Bulk import"}
            </button>
            <button
              className={adminTab === "catalog" ? "active" : ""}
              onClick={() => setAdminTab("catalog")}
            >
              {chinese ? "产品列表" : "Product list"}
            </button>
            <button
              className={adminTab === "accounts" ? "active" : ""}
              onClick={() => setAdminTab("accounts")}
            >
              {chinese ? "子账号管理" : "Team accounts"}
            </button>
            <button className={adminTab === "shops" ? "active" : ""} onClick={() => setAdminTab("shops")}>商店管理</button>
            <button
              className={adminTab === "affiliates" ? "active" : ""}
              onClick={() => setAdminTab("affiliates")}
            >
              联盟代码
            </button>
            <span>{chinese ? "管理后台" : "Admin panel"}</span>
          </div>
          {adminTab === "catalog" && uploadTools}
          {adminTab === "bulk" && (
            <section className="bulk-import-page">
              <label>
                {chinese ? "选择商店" : "Select store"}
                <select
                  value={selectedStore}
                  onChange={(event) => setSelectedStore(event.target.value)}
                >
                  <option value="">
                    -- {chinese ? "选择商店" : "Select store"} --
                  </option>
                  {shops.map((shop) => <option value={shop.id} key={shop.id}>{shop.name}</option>)}
                </select>
              </label>
              <label>
                {chinese ? "产品大分类" : "Product category"}
                <input
                  value={bulkCategory}
                  onChange={(event) => setBulkCategory(event.target.value)}
                  placeholder={
                    chinese
                      ? "如：服装、鞋类、配饰等..."
                      : "e.g. Clothing, Shoes, Accessories..."
                  }
                />
              </label>
              <label>
                {chinese ? "粘贴或上传表格数据" : "Paste or upload sheet data"}
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={importProducts}
                />
                <textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  placeholder={
                    chinese
                      ? "在这里粘贴 CSV 或从 Excel 复制的表格数据..."
                      : "Paste CSV or copied Excel table data here..."
                  }
                />
              </label>
              <p className="upload-format">
                {chinese
                  ? "格式：name, price, image, category, weidian_url"
                  : "Format: name, price, image, category, weidian_url"}
              </p>
              <button
                className="primary-action"
                type="button"
                disabled={!selectedStore || !bulkText.trim()}
                onClick={importPastedProducts}
              >
                {chinese ? "导入产品" : "Import products"}
              </button>
              {uploadMessage && (
                <strong
                  className={
                    uploadMessage.includes(chinese ? "失败" : "failed")
                      ? "upload-error"
                      : "upload-success"
                  }
                >
                  {uploadMessage}
                </strong>
              )}
            </section>
          )}
          {adminTab === "affiliates" && (
            <section className="affiliate-page">
              <div className="affiliate-heading"><div><p className="eyebrow">联盟设置 / 前台展示</p><h2>联盟代码管理</h2></div><button className="primary-action" onClick={saveAffiliateSettings}>保存设置</button></div>
              <label className="store-field">选择商店<select value={selectedStore} onChange={(event) => setSelectedStore(event.target.value)}><option value="">-- 选择商店 --</option>{shops.map((shop) => <option value={shop.id} key={shop.id}>{shop.name}</option>)}</select></label>
              <div className="affiliate-panel"><h3>前台显示平台</h3><p>勾选的平台会显示在商品详情页。</p><div className="agent-check-grid">{SUPPORTED_AGENTS.map((agent) => <label key={agent.value}><input type="checkbox" checked={displayAgents.includes(agent.value)} onChange={(event) => setDisplayAgents(event.target.checked ? [...displayAgents, agent.value] : displayAgents.filter((value) => value !== agent.value))} /><img className="agent-icon" src={agent.icon} alt="" /><span>{agent.label}</span></label>)}</div></div>
              <div className="affiliate-codes"><h3>为该商店配置联盟代码</h3>{SUPPORTED_AGENTS.map((agent) => <label key={agent.value}><b><img className="agent-icon" src={agent.icon} alt="" />{agent.label}</b><input value={affiliateDraft[agent.value]?.code || ""} onChange={(event) => setAffiliateDraft({ ...affiliateDraft, [agent.value]: { code: event.target.value } })} placeholder={`输入 ${agent.label} 联盟代码或完整链接`} /><small>支持直接填写代码，或粘贴完整联盟链接。</small></label>)}</div>
            </section>
          )}
          {adminTab === "catalog" ? (
            <section className="admin-table-wrap">
              <div className="table-heading">
                <div>
                  <p className="eyebrow">
                    {chinese
                      ? `商品目录 / ${inventory.filter((product) => browseShopId === "all" || (product.shopId || "main") === browseShopId).length} 件商品`
                      : `Catalog / ${inventory.filter((product) => browseShopId === "all" || (product.shopId || "main") === browseShopId).length} products`}
                  </p>
                  <h2>{chinese ? "全部商品" : "All products"}</h2>
                </div>
                <div className="table-tools">
                  <select value={browseShopId} onChange={(event) => setBrowseShopId(event.target.value)} aria-label="选择店铺"><option value="all">全部店铺</option>{shops.map((shop) => <option value={shop.id} key={shop.id}>{shop.name}{shop.owner ? "（主店）" : ""}</option>)}</select>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={chinese ? "搜索商品" : "Search catalog"}
                    aria-label={chinese ? "搜索商品" : "Search catalog"}
                  />
                  <button>{chinese ? "筛选" : "Filter"}</button>
                  <button className="bulk-delete-button" type="button" onClick={deleteProductsByShop}>一键删除</button>
                  <button type="button" onClick={completeCategories}>补全分类</button>
                </div>
              </div>
              <div className="admin-table">
                <div className="table-row table-label">
                  <span>{chinese ? "商品" : "Product"}</span>
                  <span>{chinese ? "分类" : "Category"}</span>
                  <span>{chinese ? "价格" : "Price"}</span>
                  <span>{chinese ? "状态" : "Status"}</span>
                  <span>{chinese ? "操作" : "Action"}</span>
                </div>
                {inventory
                  .filter((product) =>
                    (browseShopId === "all" || (product.shopId || "main") === browseShopId) &&
                    product.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((product) => (
                    <div className="table-row" key={product.id}>
                      <span className="admin-product">
                        <img src={product.image} alt="" />
                        <b>{product.name}</b>
                      </span>
                      <span>
                        {chinese
                          ? productText[resolveCategory(product)] || resolveCategory(product)
                          : resolveCategory(product)}
                      </span>
                      <span>{formatProductPrice(product, currency)}</span>
                      <span>
                        <i className={product.status.toLowerCase()}>
                          {chinese
                            ? product.status === "Live"
                              ? "在售"
                              : "草稿"
                            : product.status}
                        </i>
                      </span>
                      <button
                        className="edit-button"
                        onClick={() =>
                          updateInventory(
                            inventory.map((item) =>
                              item.id === product.id
                                ? {
                                    ...item,
                                    status:
                                      item.status === "Live" ? "Draft" : "Live",
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        {product.status === "Live"
                          ? chinese
                            ? "下架"
                            : "Unpublish"
                          : chinese
                            ? "上架"
                            : "Publish"}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteProduct(product)}
                      >
                        删除
                      </button>
                      <button className="qc-edit-button" onClick={() => openQcEditor(product)}>设置 QC</button>
                      <button className={product.tag === "Popular" ? "featured-toggle active" : "featured-toggle"} onClick={() => toggleProductTag(product, "Popular")}>{product.tag === "Popular" ? "取消热门" : "设为热门"}</button>
                      <button className={product.tag === "New" ? "featured-toggle active" : "featured-toggle"} onClick={() => toggleProductTag(product, "New")}>{product.tag === "New" ? "取消新品" : "设为新品"}</button>
                    </div>
                  ))}
              </div>
            </section>
          ) : adminTab === "shops" ? (
            <section className="accounts-section shops-section">
              <div className="table-heading"><div><p className="eyebrow">商店管理 / {shops.length} 家店铺</p><h2>主店与合作店铺</h2></div><button className="primary-action" onClick={() => setShopModalOpen(true)}>+ 添加合作店铺</button></div>
              <div className="account-list"><div className="account-row account-label"><span>店铺</span><span>访问域名</span><span>类型</span><span>状态</span><span>操作</span></div>{shops.map((shop) => <div className="account-row" key={shop.id}><span><b>{shop.name}</b><small>{shop.owner ? "主店" : "合作店铺"}</small></span><span>{shop.owner ? STOREFRONT_DOMAIN : `${shop.username}.${STOREFRONT_DOMAIN}`}</span><span>{shop.owner ? "主店" : "合作店"}</span><i className="live">正常</i>{!shop.owner && <button className="delete-button" onClick={() => removeShop(shop)}>删除</button>}</div>)}</div>
            </section>
          ) : (
            <section className="accounts-section">
              <div className="table-heading">
                <div>
                  <p className="eyebrow">权限 / Supabase Auth</p>
                  <h2>{chinese ? "团队账号" : "Team accounts"}</h2>
                </div>
              </div>
              <div className="affiliate-panel">
                <h3>账号由 Supabase 管理</h3>
                <p>在 Supabase 的 Authentication &gt; Users 创建成员账号后，将该成员的用户 UUID 添加到 team_members 表，并分配 admin 或 editor 角色。</p>
                <p>只有已分配角色的团队成员能登录此后台；成员权限不保存在浏览器中。</p>
              </div>
            </section>
          )}
        </main>
      ) : (
        <main id="shop">
          <div className="toolbar">
            <div className="categories">
              {frontendCategories.map((category) => (
                <button
                  className={activeCategory === category ? "active" : ""}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {chinese
                    ? {
                        Trending: "热门商品",
                        "New arrivals": "新品上市",
                        ...categoryText,
                      }[category] || category
                    : category}
                </button>
              ))}
            </div>
            <label className="sort">
              {chinese ? "排序" : "Sort by"}{" "}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="Featured">
                  {chinese ? "推荐" : "Featured"}
                </option>
                <option value="Price: low">
                  {chinese ? "价格：从低到高" : "Price: low"}
                </option>
                <option value="Price: high">
                  {chinese ? "价格：从高到低" : "Price: high"}
                </option>
              </select>
            </label>
          </div>

          <section className="product-grid" aria-live="polite">
            {paginatedProducts.map((product, index) => (
              <article
                className="product-card"
                key={product.id}
                style={{ "--delay": `${index * 60}ms` }}
                onClick={() => openProduct(product)}
              >
                <div className={`product-image ${product.tone}`}>
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.qcPhotos?.length > 0 && <span className="qc-badge">QC AVAILABLE!</span>}
                  <button
                    className={`save ${saved.includes(product.id) ? "selected" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleSaved(product.id);
                    }}
                    aria-label={`Save ${product.name}`}
                  >
                    {saved.includes(product.id) ? "♥" : "♡"}
                  </button>
                </div>
                <div className="product-info">
                  <h2>{product.name}</h2>
                  <strong>{formatProductPrice(product, currency)}</strong>
                </div>
              </article>
            ))}
          </section>
          {visibleProducts.length === 0 && (
            <p className="empty-state">
              {chinese
                ? "没有找到匹配的商品。"
                : "No pieces match your search."}
            </p>
          )}
          {visibleProducts.length > PRODUCTS_PER_PAGE && <nav className="pagination" aria-label="商品分页"><button type="button" disabled={currentProductPage === 1} onClick={() => setProductPage((page) => Math.max(1, page - 1))}>{chinese ? "上一页" : "Previous"}</button><span>{chinese ? `第 ${currentProductPage} / ${pageCount} 页` : `Page ${currentProductPage} of ${pageCount}`} · {visibleProducts.length} {chinese ? "件商品" : "products"}</span><button type="button" disabled={currentProductPage === pageCount} onClick={() => setProductPage((page) => Math.min(pageCount, page + 1))}>{chinese ? "下一页" : "Next"}</button></nav>}
        </main>
      )}

      <footer>
        <span>NORTH / FORM</span>
        <span>
          {chinese
            ? "为日常生活而设计的独立商品。"
            : "Independent goods, thoughtfully made."}
        </span>
        <span>Instagram &nbsp; {chinese ? "联系" : "Contact"}</span>
      </footer>
      {addProductOpen && (
        <div className="modal-overlay" onClick={() => setAddProductOpen(false)}>
          <form
            className="product-modal"
            onSubmit={addProduct}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>添加商品</h2>
              <button type="button" onClick={() => setAddProductOpen(false)}>
                x
              </button>
            </div>
            <label>
              商品名称
              <input
                required
                value={newProduct.name}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, name: event.target.value })
                }
                placeholder="例如：日常通勤夹克"
              />
            </label>
            <label>
              分类
              <select
                value={newProduct.category}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, category: event.target.value })
                }
              >
                <option value="Tops">上衣</option>
                <option value="Outerwear">外套</option>
                <option value="Footwear">鞋类</option>
                <option value="Watches">手表</option>
                <option value="Accessories">配饰</option>
              </select>
            </label>
            <label>
              价格（人民币）
              <input
                required
                type="number"
                min="0"
                value={newProduct.price}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, price: event.target.value })
                }
                placeholder="120"
              />
            </label>
            <label>
              图片链接
              <input type="file" accept="image/*" multiple onChange={(event) => appendImageFiles(event, "image", setNewProduct)} />
              <textarea
                value={newProduct.image}
                onChange={(event) =>
                  setNewProduct({ ...newProduct, image: event.target.value })
                }
                placeholder="每行一张，或用分号 ; 分隔图片地址"
              />
            </label>
            <label>
              商品源链接
              <input
                value={sourceUrl}
                onChange={(event) => {
                  setSourceUrl(event.target.value);
                  setConvertedUrl("");
                }}
                placeholder="https://weidian.com/item.html?itemID=..."
              />
            </label>
            <label className="qc-setting"><span><input type="checkbox" checked={newProduct.qcAvailable} onChange={(event) => setNewProduct({ ...newProduct, qcAvailable: event.target.checked })} /> 显示 QC AVAILABLE</span><small>开启后，前台商品卡片会显示 QC 标识。</small></label>
            <label>
              QC 图片链接
              <input value={newProduct.qcPhotos} onChange={(event) => setNewProduct({ ...newProduct, qcPhotos: event.target.value })} placeholder="多张链接用分号 ; 分隔" />
              <small>详情页会显示这些 QC 图片。</small>
            </label>
            <div className="converter-row">
              <select
                value={targetAgent}
                onChange={(event) => setTargetAgent(event.target.value)}
                aria-label="选择代理"
              >
                {SUPPORTED_AGENTS.map((agent) => (
                  <option value={agent.value} key={agent.value}>
                    {agent.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="convert-button"
                onClick={handleConvert}
              >
                转换链接
              </button>
            </div>
            {convertedUrl && (
              <div className="converted-result">
                <span>转换结果</span>
                <input
                  readOnly
                  value={convertedUrl}
                  onFocus={(event) => event.target.select()}
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(convertedUrl)}
                >
                  复制
                </button>
              </div>
            )}
            <button className="primary-action" type="submit">
              发布商品
            </button>
          </form>
        </div>
      )}
      {inviteOpen && (
        <div className="modal-overlay" onClick={() => setInviteOpen(false)}>
          <form className="product-modal" onSubmit={addAccount} onClick={(event) => event.stopPropagation()}>
            <div className="modal-heading"><h2>添加子账号</h2><button type="button" onClick={() => setInviteOpen(false)}>x</button></div>
            <label>邮箱地址<input required type="email" value={inviteForm.email} onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })} placeholder="staff@example.com" /></label>
            <label>账号角色<select value={inviteForm.role} onChange={(event) => setInviteForm({ ...inviteForm, role: event.target.value })}><option value="Editor">编辑者：仅管理商品</option><option value="Viewer">查看者：仅查看订单</option></select></label>
            <button className="primary-action" type="submit">添加账号</button>
          </form>
        </div>
      )}
      {shopModalOpen && <div className="modal-overlay" onClick={() => setShopModalOpen(false)}><form className="product-modal" onSubmit={addShop} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><h2>创建合作店铺</h2><button type="button" onClick={() => setShopModalOpen(false)}>x</button></div><label>店铺名称<input required value={shopForm.name} onChange={(event) => setShopForm({ ...shopForm, name: event.target.value })} placeholder="例如：PINK" /></label><label>店铺子域名<input required value={shopForm.username} onChange={(event) => setShopForm({ ...shopForm, username: event.target.value.toLowerCase() })} placeholder="例如：pink" /><small>访问地址：pink.xsomsiadd.net</small></label><label>密码<input required type="password" value={shopForm.password} onChange={(event) => setShopForm({ ...shopForm, password: event.target.value })} placeholder="输入店铺密码" /></label><label>角色<select value={shopForm.role} onChange={(event) => setShopForm({ ...shopForm, role: event.target.value })}><option value="partner">合作客（可上架产品）</option><option value="admin">管理员（可管理所有功能）</option></select></label><button className="primary-action" type="submit">创建店铺</button></form></div>}
      {qcEditProduct && <div className="modal-overlay" onClick={() => setQcEditProduct(null)}><form className="product-modal" onSubmit={saveQcEdit} onClick={(event) => event.stopPropagation()}><div className="modal-heading"><h2>设置 QC</h2><button type="button" onClick={() => setQcEditProduct(null)}>x</button></div><p className="qc-product-name">{qcEditProduct.name}</p><label className="qc-setting"><span><input type="checkbox" checked={qcEditForm.qcAvailable} onChange={(event) => setQcEditForm({ ...qcEditForm, qcAvailable: event.target.checked })} /> 显示 QC AVAILABLE</span></label><label>选择本地 QC 图片<input type="file" accept="image/*" multiple onChange={appendQcFiles} /></label>{splitImageSources(qcEditForm.qcPhotos).filter(isImageSource).length > 0 && <div className="qc-edit-preview">{splitImageSources(qcEditForm.qcPhotos).filter(isImageSource).map((image) => <img src={image} alt="QC 预览" key={image} />)}</div>}<label>或填写 QC 图片链接<textarea value={qcEditForm.qcPhotos} onChange={(event) => setQcEditForm({ ...qcEditForm, qcPhotos: event.target.value })} placeholder="每行一张，或使用分号 ; 分隔" /></label><small className="qc-help">选择本地图片后会自动开启 QC，并同步显示到前台商品详情页。</small><button className="primary-action" type="submit">保存 QC 设置</button></form></div>}
      {localeOpen && (
        <div className="locale-overlay" onClick={() => setLocaleOpen(false)}>
          <section
            className="locale-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="locale-close"
              onClick={() => setLocaleOpen(false)}
              aria-label="Close language and currency settings"
            >
              x
            </button>
            <div className="locale-section">
              <h2>{chinese ? "语言" : "Language"}</h2>
              <div className="choice-grid">
                {languages.map((item) => (
                  <button
                    className={language === item ? "chosen" : ""}
                    key={item}
                    onClick={() => setLanguage(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="locale-section">
              <h2>{chinese ? "货币" : "Currency"}</h2>
              <div className="choice-grid">
                {currencies.map((item) => (
                  <button
                    className={currency === item ? "chosen" : ""}
                    key={item}
                    onClick={() => setCurrency(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
      {lightboxImage && <div className="lightbox" onClick={() => setLightboxImage(null)}><button type="button" className="lightbox-close" onClick={() => setLightboxImage(null)} aria-label="关闭图片预览">x</button><img src={lightboxImage} alt="放大预览" onClick={(event) => event.stopPropagation()} /></div>}
    </div>
  );
}

export default App;

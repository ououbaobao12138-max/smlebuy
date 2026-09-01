import { supabase } from './supabaseClient.js';

// 生成产品内容哈希
export const generateProductHash = (name, price, images) => {
  const imageStr = Array.isArray(images) ? images.join('|') : String(images || '');
  const content = `${name}::${price}::${imageStr}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `product-${Math.abs(hash).toString(16)}`;
};

// 从 Supabase 加载所有产品
export const loadProductsFromSupabase = async () => {
  try {
    const { data: shopProducts, error: spError } = await supabase
      .from('shop_products')
      .select('product_id, status')
      .eq('status', 'Live');
    
    if (spError) throw spError;

    const productIds = [...new Set(shopProducts.map(sp => sp.product_id))];
    
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('*');
    
    if (pError) throw pError;

    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.images?.[0] || '',
      images: p.images || [],
      qcPhotos: p.qc_photos || [],
      qcAvailable: (p.qc_photos || []).length > 0,
      tag: 'Popular',
      status: 'Live',
      weidian_url: '',
      tone: 'cream'
    }));
  } catch (error) {
    console.error('加载产品失败:', error);
    return [];
  }
};

// 保存产品到 Supabase
export const saveProductToSupabase = async (product, shopId) => {
  try {
    const productHash = generateProductHash(product.name, product.price, product.images);
    
    // 检查是否已存在此产品
    const { data: existing } = await supabase
      .from('products')
      .select('*')
      .eq('id', productHash)
      .single();

    if (!existing) {
      // 创建新产品
      const { error: insertError } = await supabase
        .from('products')
        .insert([{
          id: productHash,
          name: product.name,
          price: product.price,
          category: product.category,
          images: product.images || [],
          qc_photos: product.qcPhotos || [],
          weidian_urls: { [shopId]: product.weidian_url }
        }]);
      
      if (insertError) throw insertError;
    } else {
      // 更新现有产品的 weidian_urls
      const updatedUrls = {
        ...existing.weidian_urls,
        [shopId]: product.weidian_url
      };
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ weidian_urls: updatedUrls })
        .eq('id', productHash);
      
      if (updateError) throw updateError;
    }

    // 创建或更新店铺-产品关联
    const { error: spError } = await supabase
      .from('shop_products')
      .upsert({
        shop_id: shopId,
        product_id: productHash,
        status: 'Live'
      });

    if (spError) throw spError;
    
    return productHash;
  } catch (error) {
    console.error('保存产品失败:', error);
    throw error;
  }
};

// 更新QC图
export const updateQCPhotos = async (productId, qcPhotos) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ qc_photos: qcPhotos })
      .eq('id', productId);

    if (error) throw error;
    
    console.log('QC 图已更新，所有店铺可以看到');
  } catch (error) {
    console.error('更新 QC 图失败:', error);
    throw error;
  }
};

// 获取店铺产品
export const getShopProducts = async (shopId) => {
  try {
    const { data: shopProducts, error: spError } = await supabase
      .from('shop_products')
      .select('product_id, status')
      .eq('shop_id', shopId);

    if (spError) throw spError;

    const productIds = shopProducts.map(sp => sp.product_id);
    
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (pError) throw pError;

    return products;
  } catch (error) {
    console.error('获取店铺产品失败:', error);
    return [];
  }
};

/**
 * Weidian/Taobao/1688 link converter.
 * Supports encoded URLs, nested agent URLs and all supported agents.
 */

const SUPPORTED_AGENTS = [
  { value: 'kakobuy', label: 'KakoBuy', icon: '/agent-icons/kakobuy.webp' },
  { value: 'joyagoo', label: 'JoyaGoo', icon: '/agent-icons/joyagoo.webp' },
  { value: 'usfans', label: 'USFans', icon: '/agent-icons/usfans.png' },
  { value: 'litbuy', label: 'LitBuy', icon: '/agent-icons/litbuy.webp' },
  { value: 'mulebuy', label: 'MuleBuy', icon: '/agent-icons/mulebuy.webp' },
  { value: 'oopbuy', label: 'OopBuy', icon: '/agent-icons/oopbuy.webp' },
  { value: 'gtbuy', label: 'GTBuy', icon: '/agent-icons/gtbuy.webp' },
  { value: 'hipobuy', label: 'HipoBuy', icon: '/agent-icons/hipobuy.webp' },
  { value: 'cssbuy', label: 'CSSBuy', icon: '/agent-icons/cssbuy.png' },
  { value: 'lovegobuy', label: 'Lovegobuy', icon: '/agent-icons/lovegobuy.png' },
  { value: 'ossbuy', label: 'ossbuy', icon: '/agent-icons/ossbuy.png' },
  { value: 'vigorbuy', label: 'Vigorbuy', icon: '/agent-icons/vigorbuy.png' },
  { value: 'itaobuy', label: 'iTaobuy', icon: '/agent-icons/itaobuy.png' },
  { value: 'rizzitgo', label: 'Rizzitgo', icon: '/agent-icons/rizzitgo.png' },
  { value: 'hubbuy', label: 'hubbuy', icon: '/agent-icons/hubbuy.png' },
  { value: 'bbdbuy', label: 'BBDbuy', icon: '/agent-icons/bbdbuy.png' },
  { value: 'boonbuy', label: 'Boonbuy', icon: '/agent-icons/boonbuy.png' },
]

function decodeRepeated(value) {
  let result = String(value || '').trim()
  for (let index = 0; index < 3; index += 1) {
    try {
      const decoded = decodeURIComponent(result)
      if (decoded === result) break
      result = decoded
    } catch {
      break
    }
  }
  return result
}

function detectPlatform(url) {
  const value = decodeRepeated(url).toLowerCase()
  if (!value) return 'auto'
  if (value.includes('weidian.com') || value.includes('weidiancdn.com')) return 'weidian'
  if (value.includes('taobao.com')) return 'taobao'
  if (value.includes('1688.com')) return '1688'
  if (value.includes('tmall.com')) return 'tmall'
  return 'unknown'
}

function extractItemId(url) {
  const input = decodeRepeated(url)
  if (!input) return ''
  try {
    const parsed = new URL(input)
    for (const [key, value] of parsed.searchParams.entries()) {
      if (/^(itemid|id)$/i.test(key) && /^\d+$/.test(value)) return value
    }
    const pathMatch = parsed.pathname.match(/\/product\/[a-z0-9_-]+\/(\d+)|\/item\/(\d+)/i)
    if (pathMatch) return pathMatch[1] || pathMatch[2]
  } catch {
    // Regex fallback handles partial pasted URLs.
  }
  const match = input.match(/(?:itemid|id)(?:%3d|=)(\d+)|\/product\/[a-z0-9_-]+\/(\d+)|\/item\/(\d+)/i)
  return match ? match[1] || match[2] || match[3] : ''
}

function unwrapUrl(originalUrl) {
  const decoded = decodeRepeated(originalUrl)
  try {
    const parsed = new URL(decoded)
    const nested = parsed.searchParams.get('url')
    return nested ? decodeRepeated(nested) : decoded
  } catch {
    return decoded
  }
}

function getAffiliateCode(target, affiliateCodes) {
  const key = Object.keys(affiliateCodes || {}).find((name) => name.toLowerCase() === target)
  return key ? affiliateCodes[key]?.code || '' : ''
}

async function convertLink(originalUrl, target, affiliateCodes = {}) {
  if (!originalUrl) return ''
  const cleanUrl = unwrapUrl(originalUrl)
  const itemId = extractItemId(cleanUrl)
  if (!itemId) return cleanUrl
  const targetLower = String(target || '').toLowerCase()
  const affCode = getAffiliateCode(targetLower, affiliateCodes)
  const aff = (key, separator = '&') => affCode ? `${separator}${key}=${encodeURIComponent(affCode)}` : ''
  switch (targetLower) {
    case 'kakobuy': return `https://www.kakobuy.com/item/details?url=${encodeURIComponent(cleanUrl)}${aff('affcode')}`
    case 'joyagoo': return `https://joyagoo.com/product?id=${itemId}&platform=${detectPlatform(cleanUrl).toUpperCase()}${aff('ref')}`
    case 'usfans': return `https://www.usfans.com/product/3/${itemId}${aff('ref', '?')}`
    case 'litbuy': return `https://litbuy.com/product/weidian/${itemId}${aff('inviteCode', '?')}`
    case 'mulebuy': return `https://t.mulebuy.com?t=t1000017&id=${itemId}&shop_type=WEIDIAN${aff('ref')}`
    case 'oopbuy': return `https://oopbuy.com/product/2/${itemId}${aff('inviteCode', '?')}`
    case 'gtbuy': return `https://gtbuy.com/product/2/${itemId}${aff('inviteCode', '?')}`
    case 'hipobuy': return `https://hipobuy.com/product/weidian/${itemId}${aff('inviteCode', '?')}`
    case 'cssbuy': return `https://www.cssbuy.com/shop/goodsDetail?promotionCode=${encodeURIComponent(affCode)}&item-micro-${itemId}.html&id=${itemId}&type=weidian`
    case 'lovegobuy': return `https://www.lovegobuy.com/product?id=${itemId}&shop_type=weidian${aff('invite_code')}`
    case 'ossbuy': return `https://www.ossbuy.com/product-detail?url=${encodeURIComponent(cleanUrl)}&spider_token=4572${aff('inviteCode')}`
    case 'vigorbuy': return `https://vigorbuy.com/product/2/${itemId}?utm_source=website&utm_medium=share&utm_campaign=product_details&utm_content=${itemId}${aff('inviteCode')}`
    case 'itaobuy': return `https://www.itaobuy.com/product-detail?url=${encodeURIComponent(cleanUrl)}&spider_token=4572${aff('inviteCode')}`
    case 'rizzitgo': return `https://rizzitgo.com/detail-page/?goodsId=${itemId}&source=3${aff('rno')}`
    case 'hubbuy': return `https://www.hubbuy.com/product/2/${itemId}?utm_source=website&utm_medium=share&utm_campaign=product_details&utm_content=${itemId}${aff('inviteCode')}`
    case 'bbdbuy': return `https://www.bbdbuyeu.com/goods/WEIDIAN/${itemId}?from=search${aff('inviteCode')}`
    case 'boonbuy': return `https://boonbuy.com/product/2/${itemId}${aff('inviteCode', '?')}`
    default: return cleanUrl
  }
}

export { convertLink, detectPlatform, extractItemId, SUPPORTED_AGENTS }

# Weidian Link Converter Instructions

Use `files/linkConverter.js` to convert Weidian, Taobao, 1688, and Tmall product links into supported agent URLs.

The converter must:

- Extract numeric IDs from `itemID`, `itemId`, `itemid`, `id`, and `ID` parameters.
- Support `/product/platform/123456`, `/item/123456`, encoded URLs, and nested `url` parameters.
- Detect `weidian`, `taobao`, `1688`, `tmall`, or `unknown` platforms.
- Support KakoBuy, JoyaGoo, USFans, AllChinaBuy/acbuy, LitBuy, MuleBuy, OopBuy, GTBuy, and HipoBuy.
- Treat agent names case-insensitively.
- Append optional affiliate codes without breaking URLs.
- Return the cleaned source URL when conversion cannot be completed.

Example:

```js
const result = await convertLink(
  'https://weidian.com/item.html?itemID=7495253217',
  'kakobuy',
  { kakobuy: { code: 'xfrostyy' } },
)
```

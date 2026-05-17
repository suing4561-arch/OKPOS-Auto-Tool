/**
 * site_franchise.html 에 추가할 Firebase 연동 패치
 * 기존 PRODUCTS 하드코딩 배열을 본사 등록 품목으로 교체
 * 
 * site_franchise.html의 </body> 바로 앞에 아래 내용을 추가하세요.
 * 또는 기존 <script> 맨 아래에 추가.
 */

// ── 본사 품목 Firebase 연동 ────────────────────────────────
async function loadHqProducts() {
  const [menus, prices] = await Promise.all([
    window.SmartBaljuAuth.loadMenus(),
    window.SmartBaljuAuth.loadPrices(),
  ]);

  if(!menus.length) return; // 본사 품목 없으면 기존 목업 유지

  // 카테고리 → id 매핑
  const catMap = {'육류':'meat','곡류':'grain','유지류':'oil','소스류':'sauce','음료':'drink','포장재':'pack','기타':'other'};
  const emojiMap = {'육류':'🍗','곡류':'🌾','유지류':'🫙','소스류':'🍶','음료':'🧃','포장재':'📦','기타':'📋'};

  // PRODUCTS 배열 교체
  const newProducts = menus.map((m, i) => {
    const priceObj = prices.find(p => p.menuId === m.id);
    const cat = catMap[m.category] || 'other';
    return {
      id:        m.id,
      cat,
      emoji:     emojiMap[m.category] || '📦',
      name:      m.name,
      spec:      m.spec || '-',
      supplier:  priceObj?.partnerName || '-',
      price:     Number(priceObj?.price) || 0,
      unit:      priceObj?.unit || '개',
      stock:     70, // 기본값 (재고 연동 시 수정)
      minOrder:  Number(priceObj?.minQty) || 1,
      maxOrder:  999,
      code:      m.code || '',
      isNew:     false,
      isBest:    false,
      isSale:    false,
    };
  });

  // 전역 PRODUCTS 교체
  PRODUCTS.length = 0;
  PRODUCTS.push(...newProducts);

  // 카테고리 탭도 실제 데이터 기반으로 갱신
  const usedCats = [...new Set(newProducts.map(p => p.cat))];
  const allCats = [
    {id:'all',label:'전체',icon:'ti-layout-grid'},
    {id:'meat',label:'육류',icon:'ti-meat'},
    {id:'grain',label:'곡류',icon:'ti-grain'},
    {id:'oil',label:'유지류',icon:'ti-droplet'},
    {id:'sauce',label:'소스류',icon:'ti-bottle'},
    {id:'drink',label:'음료',icon:'ti-cup'},
    {id:'pack',label:'포장재',icon:'ti-box'},
    {id:'other',label:'기타',icon:'ti-package'},
  ];
  CATEGORIES.length = 0;
  CATEGORIES.push(allCats[0], ...allCats.slice(1).filter(c => usedCats.includes(c.id)));

  // 화면 갱신
  renderCats();
  renderProducts();
  console.log('[SmartBalju] 본사 품목 연동 완료:', newProducts.length, '개');
}

// Firebase 준비되면 품목 로드
document.addEventListener('firebaseReady', () => {
  if(window.SmartBaljuAuth) loadHqProducts();
});
if(window.SmartBaljuAuth?.isFirebaseReady) loadHqProducts();
else setTimeout(() => { if(window.SmartBaljuAuth) loadHqProducts(); }, 2000);

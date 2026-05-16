const AUTH_STORAGE_KEY = "smart_balju_users_v1";
const SESSION_STORAGE_KEY = "smart_balju_session_v1";
const DATA_STORAGE_KEY = "smart_balju_data_v1";

const ROLE_LABELS = {
  master: "대상정보통신",
  hq: "프렌차이즈 본사",
  franchise: "가맹점",
  supplier: "납품업체",
  driver: "배송기사"
};

const STATUS_LABELS = {
  active: "정상",
  inactive: "비활성",
  suspended: "사용중지",
  expired: "계약만료",
  password_reset_required: "비밀번호 재설정 필요"
};

const BLOCKED_LOGIN_STATUSES = ["inactive", "suspended", "expired"];

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "USR") {
  return prefix + "-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function simpleHash(value) {
  let hash = 2166136261;
  String(value || "").split("").forEach(ch => {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  });
  return "mock$" + (hash >>> 0).toString(36);
}

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let text = "";
  for (let i = 0; i < 8; i += 1) text += chars[Math.floor(Math.random() * chars.length)];
  return text.slice(0, 4) + "-" + text.slice(4);
}

function seedUsers() {
  const createdAt = nowIso();
  return [
    {
      uid: "MASTER-001",
      role: "master",
      name: "대상정보통신 관리자",
      businessName: "대상정보통신",
      businessNumber: "",
      phone: "010-4551-7240",
      loginId: "master",
      passwordHash: simpleHash("1234"),
      tempPassword: "",
      mustChangePassword: false,
      status: "active",
      brandId: "",
      storeId: "",
      supplierId: "",
      driverId: "",
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: "",
      passwordUpdatedAt: createdAt,
      resetBy: "",
      resetAt: ""
    },
    {
      uid: "HQ-001",
      role: "hq",
      name: "홍길동 이사",
      businessName: "맛있는 프렌차이즈 본사",
      businessNumber: "000-00-00001",
      phone: "010-1111-2222",
      loginId: "hq_demo",
      passwordHash: simpleHash("1234"),
      tempPassword: "",
      mustChangePassword: false,
      status: "active",
      brandId: "BR-001",
      storeId: "",
      supplierId: "",
      driverId: "",
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: "",
      passwordUpdatedAt: createdAt,
      resetBy: "",
      resetAt: ""
    },
    {
      uid: "FR-001",
      role: "franchise",
      name: "김가맹",
      businessName: "맛있는식당 부산점",
      businessNumber: "000-00-00002",
      phone: "010-2222-3333",
      loginId: "franchise_demo",
      passwordHash: simpleHash("1234"),
      tempPassword: "",
      mustChangePassword: false,
      status: "active",
      brandId: "BR-001",
      storeId: "ST-001",
      supplierId: "",
      driverId: "",
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: "",
      passwordUpdatedAt: createdAt,
      resetBy: "",
      resetAt: ""
    },
    {
      uid: "SUP-001",
      role: "supplier",
      name: "박납품",
      businessName: "한국식품",
      businessNumber: "000-00-00003",
      phone: "010-3333-4444",
      loginId: "supplier_demo",
      passwordHash: simpleHash("1234"),
      tempPassword: "",
      mustChangePassword: false,
      status: "active",
      brandId: "",
      storeId: "",
      supplierId: "SP-001",
      driverId: "",
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: "",
      passwordUpdatedAt: createdAt,
      resetBy: "",
      resetAt: ""
    },
    {
      uid: "DRV-001",
      role: "driver",
      name: "이배송",
      businessName: "한국식품 배송팀",
      businessNumber: "",
      phone: "010-4444-5555",
      loginId: "driver_demo",
      passwordHash: simpleHash("1234"),
      tempPassword: "",
      mustChangePassword: false,
      status: "active",
      brandId: "",
      storeId: "",
      supplierId: "SP-001",
      driverId: "DV-001",
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: "",
      passwordUpdatedAt: createdAt,
      resetBy: "",
      resetAt: ""
    }
  ];
}

function loadUsers() {
  try {
    const rows = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "[]");
    if (Array.isArray(rows) && rows.length) return rows;
  } catch {}
  const seeded = seedUsers();
  saveUsers(seeded);
  return seeded;
}

function saveUsers(users) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
}

function seedData() {
  const createdAt = nowIso();
  return {
    partners: [
      { id: "PT-001", type: "supplier", name: "한국식품", businessNumber: "000-00-00003", phone: "010-3333-4444", status: "pending", createdAt, updatedAt: createdAt },
      { id: "PT-002", type: "supplier", name: "농협유통", businessNumber: "000-00-00004", phone: "010-5555-6666", status: "active", createdAt, updatedAt: createdAt }
    ],
    brands: [{ id: "BR-001", name: "맛있는 프렌차이즈", owner: "홍길동", status: "active", createdAt, updatedAt: createdAt }],
    menus: [{ id: "MN-001", brandId: "BR-001", name: "닭가슴살 정식", category: "메인", status: "active", createdAt, updatedAt: createdAt }],
    prices: [{ id: "PR-001", menuId: "MN-001", partnerId: "PT-001", price: 9200, unit: "kg", createdAt, updatedAt: createdAt }],
    franchises: [{ id: "ST-001", supplierId: "SP-001", businessName: "맛있는식당 부산점", address: "부산시 부산진구", businessNumber: "000-00-00002", phone: "010-2222-3333", createdAt, updatedAt: createdAt }],
    drivers: [{ id: "DV-001", supplierId: "SP-001", name: "이배송", phone: "010-4444-5555", status: "active", createdAt, updatedAt: createdAt }],
    deliveries: [
      { id: "DLV-001", supplierId: "SP-001", storeId: "ST-001", storeName: "맛있는식당 부산점", address: "부산시 부산진구", driverId: "DV-001", driverName: "이배송", items: "닭가슴살 50kg / 쌀 5포대", status: "assigned", checked: false, createdAt, updatedAt: createdAt }
    ],
    permissions: {}
  };
}

function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem(DATA_STORAGE_KEY) || "null");
    if (data && typeof data === "object") return Object.assign(seedData(), data);
  } catch {}
  const seeded = seedData();
  saveData(seeded);
  return seeded;
}

function saveData(data) {
  localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
}

function addDataRow(collection, row) {
  const data = loadData();
  const now = nowIso();
  const prefix = { partners: "PT", brands: "BR", menus: "MN", prices: "PR", franchises: "ST", drivers: "DV", deliveries: "DLV" }[collection] || "ROW";
  const next = Object.assign({ id: uid(prefix), createdAt: now, updatedAt: now }, row);
  data[collection] = data[collection] || [];
  data[collection].push(next);
  saveData(data);
  return next;
}

function updateDataRow(collection, id, patch) {
  const data = loadData();
  const rows = data[collection] || [];
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error("데이터를 찾을 수 없습니다.");
  Object.assign(row, patch, { updatedAt: nowIso() });
  saveData(data);
  return row;
}

function deleteDataRow(collection, id) {
  const data = loadData();
  data[collection] = (data[collection] || []).filter(item => item.id !== id);
  saveData(data);
}

function registerPartner(input) {
  return addDataRow("partners", { type: input.type || "supplier", name: input.name || "", businessNumber: input.businessNumber || "", phone: input.phone || "", status: input.status || "active" });
}

function registerBrand(input) {
  return addDataRow("brands", { name: input.name || "", owner: input.owner || "", status: input.status || "active" });
}

function registerMenu(input) {
  return addDataRow("menus", { brandId: input.brandId || "", name: input.name || "", category: input.category || "", status: input.status || "active" });
}

function registerPrice(input) {
  return addDataRow("prices", { menuId: input.menuId || "", partnerId: input.partnerId || "", price: Number(input.price || 0), unit: input.unit || "" });
}

function registerSupplierDriver(input) {
  return addDataRow("drivers", { supplierId: input.supplierId || "SP-001", name: input.name || "", phone: input.phone || "", status: "active" });
}

function registerSupplierFranchise(input) {
  return addDataRow("franchises", { supplierId: input.supplierId || "SP-001", businessName: input.businessName || "", address: input.address || "", businessNumber: input.businessNumber || "", phone: input.phone || "" });
}

function createDelivery(input) {
  return addDataRow("deliveries", { supplierId: input.supplierId || "SP-001", storeId: input.storeId || "", storeName: input.storeName || "", address: input.address || "", driverId: input.driverId || "", driverName: input.driverName || "", items: input.items || "", status: input.status || "assigned", checked: false });
}

function assignDelivery(deliveryId, driverId) {
  const data = loadData();
  const driver = (data.drivers || []).find(item => item.id === driverId);
  return updateDataRow("deliveries", deliveryId, { driverId, driverName: driver ? driver.name : "", status: "assigned" });
}

function startDelivery(deliveryId) {
  return updateDataRow("deliveries", deliveryId, { status: "shipping", startedAt: nowIso() });
}

function markDeliveryDone(deliveryId) {
  return updateDataRow("deliveries", deliveryId, { status: "done", checked: true, doneAt: nowIso() });
}

function setPermissions(uidValue, permissions) {
  const data = loadData();
  data.permissions = data.permissions || {};
  data.permissions[uidValue] = permissions;
  saveData(data);
  return permissions;
}

function deleteUser(uidValue) {
  const users = loadUsers().filter(user => user.uid !== uidValue);
  saveUsers(users);
}

function getCurrentUser() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
    if (!session?.uid) return null;
    return loadUsers().find(user => user.uid === session.uid) || null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ uid: user.uid, role: user.role, loginAt: nowIso() }));
}

function login(loginId, password) {
  const users = loadUsers();
  const user = users.find(row => row.loginId === String(loginId || "").trim());
  if (!user) return { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." };
  if (BLOCKED_LOGIN_STATUSES.includes(user.status)) {
    return { ok: false, message: "사용이 중지된 계정입니다. 대상정보통신에 문의하세요.", status: user.status };
  }
  const isTemp = user.tempPassword && user.tempPassword === password;
  const isPassword = user.passwordHash === simpleHash(password);
  if (!isTemp && !isPassword) return { ok: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." };
  user.lastLoginAt = nowIso();
  saveUsers(users);
  setCurrentUser(user);
  if (user.status === "password_reset_required" || user.mustChangePassword || isTemp) {
    return { ok: true, user, requirePasswordChange: true };
  }
  return { ok: true, user, redirect: redirectByRole(user.role) };
}

function logout() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

function checkRole(allowedRoles) {
  const user = getCurrentUser();
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return Boolean(user && allowed.includes(user.role) && !BLOCKED_LOGIN_STATUSES.includes(user.status));
}

function redirectByRole(role) {
  return {
    master: "master.html",
    hq: "site_hq.html",
    franchise: "site_franchise.html",
    supplier: "site_supplier.html",
    driver: "site_driver.html"
  }[role] || "site_franchise.html";
}

function upsertUser(input) {
  const users = loadUsers();
  const now = nowIso();
  const existingIndex = input.uid ? users.findIndex(user => user.uid === input.uid) : -1;
  const current = existingIndex >= 0 ? users[existingIndex] : {};
  const next = {
    uid: current.uid || uid(String(input.role || "USR").toUpperCase()),
    role: input.role || current.role || "franchise",
    name: input.name || current.name || "",
    businessName: input.businessName || current.businessName || "",
    businessNumber: input.businessNumber || current.businessNumber || "",
    phone: input.phone || current.phone || "",
    loginId: input.loginId || current.loginId || "",
    passwordHash: input.password ? simpleHash(input.password) : current.passwordHash || simpleHash("1234"),
    tempPassword: current.tempPassword || "",
    mustChangePassword: Boolean(current.mustChangePassword),
    status: input.status || current.status || "active",
    brandId: input.brandId || current.brandId || "",
    storeId: input.storeId || current.storeId || "",
    supplierId: input.supplierId || current.supplierId || "",
    driverId: input.driverId || current.driverId || "",
    createdAt: current.createdAt || now,
    updatedAt: now,
    lastLoginAt: current.lastLoginAt || "",
    passwordUpdatedAt: input.password ? now : current.passwordUpdatedAt || "",
    resetBy: current.resetBy || "",
    resetAt: current.resetAt || ""
  };
  if (existingIndex >= 0) users[existingIndex] = next;
  else users.push(next);
  saveUsers(users);
  return next;
}

function updateUserStatus(uidValue, status) {
  const users = loadUsers();
  const user = users.find(row => row.uid === uidValue);
  if (!user) throw new Error("계정을 찾을 수 없습니다.");
  user.status = status;
  user.updatedAt = nowIso();
  if (status === "active") user.mustChangePassword = false;
  saveUsers(users);
  return user;
}

function resetPasswordByMaster(uidValue, masterUser) {
  const users = loadUsers();
  const user = users.find(row => row.uid === uidValue);
  if (!user) throw new Error("계정을 찾을 수 없습니다.");
  const tempPassword = generateTempPassword();
  user.tempPassword = tempPassword;
  user.mustChangePassword = true;
  user.status = "password_reset_required";
  user.resetBy = masterUser?.loginId || masterUser?.name || "master";
  user.resetAt = nowIso();
  user.updatedAt = user.resetAt;
  saveUsers(users);
  return { user, tempPassword };
}

function activateUser(uidValue) {
  return updateUserStatus(uidValue, "active");
}

function deactivateUser(uidValue) {
  return updateUserStatus(uidValue, "inactive");
}

function suspendUser(uidValue) {
  return updateUserStatus(uidValue, "suspended");
}

function expireUser(uidValue) {
  return updateUserStatus(uidValue, "expired");
}

function requirePasswordChange(uidValue) {
  const users = loadUsers();
  const user = users.find(row => row.uid === uidValue);
  if (!user) throw new Error("계정을 찾을 수 없습니다.");
  user.mustChangePassword = true;
  user.status = "password_reset_required";
  user.updatedAt = nowIso();
  saveUsers(users);
  return user;
}

function changePassword(uidValue, newPassword) {
  const users = loadUsers();
  const user = users.find(row => row.uid === uidValue);
  if (!user) throw new Error("계정을 찾을 수 없습니다.");
  if (!newPassword || String(newPassword).length < 4) throw new Error("비밀번호는 4자리 이상 입력하세요.");
  user.passwordHash = simpleHash(newPassword);
  user.tempPassword = "";
  user.mustChangePassword = false;
  user.status = "active";
  user.passwordUpdatedAt = nowIso();
  user.updatedAt = user.passwordUpdatedAt;
  saveUsers(users);
  setCurrentUser(user);
  return user;
}

window.SmartBaljuAuth = {
  ROLE_LABELS,
  STATUS_LABELS,
  BLOCKED_LOGIN_STATUSES,
  loadUsers,
  saveUsers,
  loadData,
  saveData,
  registerPartner,
  registerBrand,
  registerMenu,
  registerPrice,
  registerSupplierDriver,
  registerSupplierFranchise,
  createDelivery,
  assignDelivery,
  startDelivery,
  markDeliveryDone,
  setPermissions,
  updateDataRow,
  deleteDataRow,
  deleteUser,
  getCurrentUser,
  login,
  logout,
  checkRole,
  redirectByRole,
  upsertUser,
  resetPasswordByMaster,
  activateUser,
  deactivateUser,
  suspendUser,
  expireUser,
  requirePasswordChange,
  changePassword
};

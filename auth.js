const AUTH_STORAGE_KEY = "smart_balju_users_v1";
const SESSION_STORAGE_KEY = "smart_balju_session_v1";

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

// src/api/localDB.js
import { INITIAL_DB } from "../lib/dbSeed";

const DB_KEY = "bnc_simulation_db";

const initDB = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
  }
};

initDB();

const readStore = () => {
  if (typeof window === "undefined") {
    return INITIAL_DB;
  }

  const stored = localStorage.getItem(DB_KEY);
  return stored ? JSON.parse(stored) : INITIAL_DB;
};

const writeStore = (data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const sortList = (list, sort = "") => {
  if (!sort) return list;

  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;

  return [...list].sort((a, b) => {
    const av = a?.[field] ?? "";
    const bv = b?.[field] ?? "";

    if (field === "created_date") {
      return descending
        ? new Date(b.created_date) - new Date(a.created_date)
        : new Date(a.created_date) - new Date(b.created_date);
    }

    if (typeof av === "number" && typeof bv === "number") {
      return descending ? bv - av : av - bv;
    }

    return descending ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
  });
};

const applyFilters = (list, criteria = {}) => {
  if (!criteria || Object.keys(criteria).length === 0) {
    return list;
  }

  return list.filter((item) =>
    Object.entries(criteria).every(([key, value]) => item?.[key] === value)
  );
};

const createEntityStore = (entityName) => ({
  list: async (sort = "", limit = null) => {
    const store = readStore();
    const list = clone(store[entityName] || []);
    const sorted = sortList(list, sort);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  filter: async (criteria = {}, sort = "", limit = null) => {
    const store = readStore();
    const list = clone(store[entityName] || []);
    const filtered = applyFilters(list, criteria);
    const sorted = sortList(filtered, sort);
    return limit ? sorted.slice(0, limit) : sorted;
  },

  create: async (payload = {}) => {
    const store = readStore();
    const collection = store[entityName] || [];
    const timestamp = new Date().toISOString();
    const newRecord = {
      id: `${entityName.toLowerCase()}_${Date.now()}`,
      reference_number: Math.floor(100000000 + Math.random() * 900000000).toString(),
      status: "completada",
      created_date: timestamp,
      date: timestamp,
      ...payload,
    };

    collection.unshift(newRecord);
    store[entityName] = collection;
    writeStore(store);
    return clone(newRecord);
  },

  update: async (id, payload) => {
    const store = readStore();
    const collection = store[entityName] || [];
    const index = collection.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error(`${entityName} not found`);
    }

    collection[index] = { ...collection[index], ...payload };
    store[entityName] = collection;
    writeStore(store);
    return clone(collection[index]);
  },

  bulkUpdate: async (updates = []) => {
    const store = readStore();
    const collection = store[entityName] || [];

    updates.forEach(({ id, ...payload }) => {
      const index = collection.findIndex((item) => item.id === id);
      if (index !== -1) {
        collection[index] = { ...collection[index], ...payload };
      }
    });

    store[entityName] = collection;
    writeStore(store);
    return clone(collection);
  },
});

const auth = {
  me: async () => {
    const store = readStore();
    return clone(store.User);
  },
  loginViaEmailPassword: async () => ({ success: true }),
  loginWithProvider: async () => ({ success: true }),
  register: async () => ({ success: true }),
  verifyOtp: async () => ({ access_token: "local-token" }),
  setToken: async (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bnc_access_token", token);
    }
    return token;
  },
  resendOtp: async () => ({ success: true }),
  resetPasswordRequest: async () => ({ success: true }),
  resetPassword: async () => ({ success: true }),
  logout: async (redirectTo = "/login") => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bnc_cached_accounts");
      localStorage.removeItem("bnc_cached_user");
      localStorage.removeItem("bnc_access_token");
      window.location.href = redirectTo;
    }
    return true;
  },
  redirectToLogin: async (redirectTo = "/login") => {
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
    return true;
  },
};

export const localDB = {
  auth,
  entities: {
    User: {
      ...createEntityStore("User"),
      get: async () => clone(readStore().User),
    },
    BankAccount: createEntityStore("BankAccount"),
    Transaction: createEntityStore("Transaction"),
    Beneficiary: createEntityStore("Beneficiary"),
    Notification: createEntityStore("Notification"),
    AccountApplication: createEntityStore("AccountApplication"),
  },
  resetDatabase: () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
      window.location.reload();
    }
  },
};

export default localDB;
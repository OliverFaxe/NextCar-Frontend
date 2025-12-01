"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEYS = {
  token: "jwtToken",
  role: "userRole",
  firstName: "firstName",
  lastName: "lastName",
};

const STORAGE_TYPES = {
  local: "local",
  session: "session",
};

const readFrom = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  [window.localStorage, window.sessionStorage].forEach((storage) => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        storage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
  });
};

const persistAuthData = (data, storageType) => {
  if (typeof window === "undefined") return;
  const primary =
    storageType === STORAGE_TYPES.local
      ? window.localStorage
      : window.sessionStorage;
  const secondary =
    storageType === STORAGE_TYPES.local
      ? window.sessionStorage
      : window.localStorage;

  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      secondary.removeItem(key);
    } catch {
      /* ignore */
    }
  });

  try {
    primary.setItem(STORAGE_KEYS.token, data.token ?? "");
    primary.setItem(STORAGE_KEYS.role, data.role ?? "USER");
    primary.setItem(STORAGE_KEYS.firstName, data.firstName ?? "");
    primary.setItem(STORAGE_KEYS.lastName, data.lastName ?? "");
  } catch {
    /* ignore */
  }
};

const getStoredAuth = () => {
  if (typeof window === "undefined") return null;
  const localToken = readFrom(window.localStorage, STORAGE_KEYS.token);
  if (localToken) {
    return {
      token: localToken,
      role: readFrom(window.localStorage, STORAGE_KEYS.role) ?? "USER",
      firstName: readFrom(window.localStorage, STORAGE_KEYS.firstName) ?? "",
      lastName: readFrom(window.localStorage, STORAGE_KEYS.lastName) ?? "",
      storage: STORAGE_TYPES.local,
    };
  }

  const sessionToken = readFrom(window.sessionStorage, STORAGE_KEYS.token);
  if (sessionToken) {
    return {
      token: sessionToken,
      role: readFrom(window.sessionStorage, STORAGE_KEYS.role) ?? "USER",
      firstName: readFrom(window.sessionStorage, STORAGE_KEYS.firstName) ?? "",
      lastName: readFrom(window.sessionStorage, STORAGE_KEYS.lastName) ?? "",
      storage: STORAGE_TYPES.session,
    };
  }

  return null;
};

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredAuth());
    setLoading(false);
  }, []);

  const login = useCallback((payload, rememberMe) => {
    if (!payload?.token) return;
    const storageType = rememberMe
      ? STORAGE_TYPES.local
      : STORAGE_TYPES.session;
    persistAuthData(payload, storageType);
    setUser({
      token: payload.token,
      role: payload.role ?? "USER",
      firstName: payload.firstName ?? "",
      lastName: payload.lastName ?? "",
      storage: storageType,
    });
  }, []);

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        ...updates,
      };
      persistAuthData(next, prev.storage ?? STORAGE_TYPES.session);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      updateUser,
    }),
    [user, loading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

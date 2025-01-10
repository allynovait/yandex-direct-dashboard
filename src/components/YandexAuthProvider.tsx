import { createContext, useContext, useState, useEffect } from "react";
import { YandexUserInfo } from "@/types/yandex";

interface AuthContextType {
  isAuthenticated: boolean;
  user: YandexUserInfo | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const useYandexAuth = () => useContext(AuthContext);

export const YandexAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<YandexUserInfo | null>(null);

  const login = () => {
    const clientId = "c5110e2599f640d0bd83a4a3d0e2dbaf";
    const redirectUri = "https://preview--yandex-direct-dashboard.lovable.app/";
    // Обновляем scope для Яндекс.Директ
    const scope = "direct:api";
    
    const authUrl = `https://oauth.yandex.ru/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem("yandex_token");
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    // Проверяем наличие токена в URL после редиректа
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        localStorage.setItem("yandex_token", token);
        // Очищаем URL от токена
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Проверяем токен в localStorage
    const token = localStorage.getItem("yandex_token");
    if (token) {
      // Verify token and get user info
      fetch("https://login.yandex.ru/info", {
        headers: {
          Authorization: `OAuth ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data: YandexUserInfo) => {
          setUser(data);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("yandex_token");
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
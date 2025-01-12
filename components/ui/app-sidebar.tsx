"use client"; // Assurez-vous que cette ligne est en haut de votre fichier

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "./sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/services/sidebar/useUser";
import { useState } from "react";
import Cookies from 'js-cookie'; // Importez js-cookie pour gérer les cookies

export function AppSidebar() {
  const pathname = usePathname();
  const { user, error } = useUser();
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isCommandeOpen, setIsCommandeOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? "bg-gray-200" : "";
  };

  const handleLogout = () => {
    Cookies.remove('supabaseToken'); // Supprimer le token des cookies
    localStorage.removeItem('supabase.auth.token'); // Supprimer le token du localStorage
    window.location.href = '/login'; // Rediriger vers la page de connexion
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center space-x-2">
        <img src="/favicon.ico" alt="Logo" className="h-8 w-8" />
        <h2 className="text-xl font-bold">Ap3</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Link href="/" className={`block py-2 px-4 ${isActive("/")}`}>
            Accueil
          </Link>

          <div className="block py-2 px-4 cursor-pointer" onClick={() => setIsStockOpen(!isStockOpen)}>
            <div className="flex items-center justify-between">
              Stock
              <span className="ml-2">{isStockOpen ? "▲" : "▼"}</span>
            </div>
            {isStockOpen && (
              <div className="pl-4">
                <Link href="/medicaments" className={`block py-2 px-4 ${isActive("/medicaments")}`}>
                  Stock Médicaments
                </Link>
                <Link href="/materiel" className={`block py-2 px-4 ${isActive("/materiel")}`}>
                  Stock Matériel
                </Link>
              </div>
            )}
          </div>

          <div className="block py-2 px-4 cursor-pointer" onClick={() => setIsCommandeOpen(!isCommandeOpen)}>
            <div className="flex items-center justify-between">
              Commande
              <span className="ml-2">{isCommandeOpen ? "▲" : "▼"}</span>
            </div>
            {isCommandeOpen && (
              <div className="pl-4">
                <Link href="/commande" className={`block py-2 px-4 ${isActive("/commande")}`}>
                  Liste des Commandes
                </Link>
                <Link href="/nouvelle-commande" className={`block py-2 px-4 ${isActive("/nouvelle-commande")}`}>
                  Nouvelle Commande
                </Link>
                <Link href="/commande-en-cours" className={`block py-2 px-4 ${isActive("/commande-en-cours")}`}>
                  Commande en cours de traitement
                </Link>
                <Link href="/historique-commandes" className={`block py-2 px-4 ${isActive("/historique-commandes")}`}>
                  Historique de commande
                </Link>
              </div>
            )}
          </div>

          <Link href="/fournisseur" className={`block py-2 px-4 ${isActive("/fournisseur")}`}>
            Fournisseurs
          </Link>
        </SidebarGroup>

        <SidebarGroup>
          {user ? (
            <>
              <Link href="/settings" className={`block py-2 px-4 ${isActive("/settings")}`}>
                Paramètres
              </Link>
              <Link href="/profile" className={`block py-2 px-4 ${isActive("/profile")}`}>
                Profil
              </Link>
              <button
                className="w-full py-2 px-4 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors mt-2"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Connexion
              </Link>
              <Link href="/register">
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-2">
                  Inscription
                </button>
              </Link>
            </>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="flex flex-col items-start p-4">
        {user ? (
          <div className="w-full mb-4">
            <p className="text-sm font-semibold">Bienvenue, {user.email}</p>
          </div>
        ) : (
          <>
            <Link href="/login" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Connexion
            </Link>
            <Link href="/register">
              <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors mt-2">
                Inscription
              </button>
            </Link>
          </>
        )}
        {error && <p className="text-sm text-red-600">Erreur : {error}</p>}
        <p className="text-sm text-gray-600">© 2025 Ap3 Alain RABIE BTS SIO 2023-2025</p>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;

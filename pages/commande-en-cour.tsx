import React, { useState, useEffect } from "react";
import { createClient, User } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Commande {
  id_commande: number;
  id_user: string;
  id_stock_medicament: number;
  quantite: number;
  date_commande: string;
  etat: string;
}

const MesCommandes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);

  useEffect(() => {
    const initialize = async () => {
      await checkSession();
      await fetchCommandes();
    };
    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: userData } = await supabase
          .from('User')
          .select('id')
          .eq('email', session.user.email)
          .single();

        if (userData) {
          const role = await getUserRole(userData.id);
          setUserRole(role);
          setIsAdmin(role === "administrateur");
          await fetchCommandes();
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: userData } = await supabase
        .from('User')
        .select('id')
        .eq('email', session.user.email)
        .single();

      if (userData) {
        const role = await getUserRole(userData.id);
        setUserRole(role);
        setIsAdmin(role === "administrateur");
      }
    }
  };
  const fetchCommandes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
  
    let query = supabase
      .from("commande_médicaments")
      .select("*")
      .eq('etat', 'en attente')
      .order("date_commande", { ascending: false });
  
    const { data, error } = await query;
  
    if (error) {
      console.error("❌ Erreur Supabase:", error);
      return;
    }
  
    console.log("Commandes récupérées:", data);
    setCommandes(data || []);
  };
  

  
  const handleUpdateState = async (id_commande: number, nouvelEtat: string) => {
    if (!id_commande) {
      console.error("ID de commande manquant");
      alert("Erreur: ID de commande manquant");
      return;
    }

    try {
      // Récupérer d'abord les informations de la commande
      const { data: commandeData, error: commandeError } = await supabase
        .from('commande_médicaments')
        .select('*')
        .eq('id_commande', id_commande)
        .single();

      if (commandeError) {
        throw new Error("Erreur lors de la récupération de la commande");
      }

      // Mise à jour de l'état de la commande
      const { data, error } = await supabase
        .from('commande_médicaments')
        .update({ etat: nouvelEtat })
        .eq('id_commande', id_commande)
        .select();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de l'état: ${error.message}`);
      }

      // Si la commande est acceptée, mettre à jour le stock
      if (nouvelEtat === 'acceptée') {
        // Récupérer le stock actuel
        const { data: stockData, error: stockError } = await supabase
          .from('stock_medicaments')
          .select('quantite')
          .eq('id_stock', commandeData.id_stock_medicament)
          .single();

        if (stockError) {
          throw new Error("Erreur lors de la récupération du stock");
        }

        // Calculer la nouvelle quantité
        const newQuantity = stockData.quantite - commandeData.quantite;

        if (newQuantity < 0) {
          throw new Error("Stock insuffisant pour cette commande");
        }

        // Mettre à jour le stock
        const { error: updateError } = await supabase
          .from('stock_medicaments')
          .update({ quantite: newQuantity })
          .eq('id_stock', commandeData.id_stock_medicament);

        if (updateError) {
          throw new Error("Erreur lors de la mise à jour du stock");
        }
      }

      console.log("Commande mise à jour:", data);
      await fetchCommandes();

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erreur interne:", error.message);
        alert(`Erreur: ${error.message}`);
      } else {
        console.error("Erreur inconnue:", error);
        alert("Une erreur inconnue est survenue.");
      }
    }
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">
            {isAdmin ? "Liste des Commandes" : "Mes Commandes en Attente"}
          </h1>
          <div className="grid grid-cols-1 gap-6 mt-4">
            {commandes.map((commande) => (
              <div key={commande.id_commande} className="bg-transparent border border-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-2 text-white">
                  Commande #{commande.id_commande}
                </h2>
                <p className="text-sm text-white mb-4">
                  Quantité: {commande.quantite}
                </p>
                <p className="text-sm text-white mb-4">
                  Date de commande: {new Date(commande.date_commande).toLocaleString()}
                </p>
                <p className="text-sm text-white mb-4">
                  État: {commande.etat}
                </p>
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() => handleUpdateState(commande.id_commande, 'acceptée')}
                    >
                      Accepter
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => handleUpdateState(commande.id_commande, 'refusée')}
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MesCommandes;
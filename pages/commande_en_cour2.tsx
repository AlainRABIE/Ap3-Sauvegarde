import React, { useState, useEffect } from "react";
import { createClient, User } from '@supabase/supabase-js';
import MenubarRe from '../components/ui/MenuBarRe';
import { getUserRole } from './api/role';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Commande {
  id_commande: number;
  id_user: string;
  id_materiel: number;
  quantite: number;
  date_commande: string;
  etat: string;
  id_fournisseur: number;
}

const MesCommandesMateriel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [error, setError] = useState<string | null>(null);

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
  
    const { data, error } = await supabase
      .from("commande_materiel")
      .select("*")
      .eq('etat', 'en attente')
      .order("date_commande", { ascending: false });
  
    if (error) {
      console.error("❌ Erreur lors de la récupération des commandes:", error);
      setError(error.message);
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
        .from('commande_materiel')
        .select('*')
        .eq('id_commande', id_commande)
        .single();

      if (commandeError || !commandeData) {
        throw new Error("Erreur lors de la récupération de la commande");
      }

      // Vérifier si id_materiel est valide
      if (!commandeData.id_materiel) {
        throw new Error("ID du matériel manquant ou invalide");
      }

      // Mise à jour de l'état de la commande
      const { data, error } = await supabase
        .from('commande_materiel')
        .update({ etat: nouvelEtat })
        .eq('id_commande', id_commande)
        .select();

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de l'état: ${error.message}`);
      }

      // Mise à jour du stock selon l'état de la commande
      const adjustStock = async (adjustment: number) => {
        // Récupérer le stock actuel
        const { data: stockData, error: stockError } = await supabase
          .from('materiels')
          .select('quantite')
          .eq('id_materiel', commandeData.id_materiel)
          .single();

        if (stockError || !stockData) {
          throw new Error("Erreur lors de la récupération du stock");
        }

        // Calculer la nouvelle quantité
        const newQuantity = stockData.quantite + adjustment;

        // Mettre à jour le stock
        const { error: updateError } = await supabase
          .from('materiels')
          .update({ quantite: newQuantity })
          .eq('id_materiel', commandeData.id_materiel);

        if (updateError) {
          throw new Error("Erreur lors de la mise à jour du stock");
        }
      };

      if (nouvelEtat === 'acceptée') {
        // Retirer les matériels du stock
        await adjustStock(-commandeData.quantite);
      } else if (nouvelEtat === 'refusée') {
        // Remettre les matériels en stock
        await adjustStock(commandeData.quantite);
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

  const handleDownloadPDF = (commande: Commande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFontSize(12);
    doc.text(`Commande #${commande.id_commande}`, 20, 40);
    doc.text(`Quantité: ${commande.quantite}`, 20, 50);
    doc.text(`Date de commande: ${new Date(commande.date_commande).toLocaleString()}`, 20, 60);
    doc.text(`État: ${commande.etat}`, 20, 70);
    doc.setLineWidth(0.5);
    doc.line(20, 80, 190, 80); // Draw a line
    doc.text("Signature:", 20, 90);
    doc.line(20, 95, 80, 95); // Draw a line for signature
    doc.save(`commande_${commande.id_commande}.pdf`);
  };

  return (
    <div className="relative flex h-screen bg-opacity-40 backdrop-blur-md">
      <MenubarRe />
      <main className="flex-1 p-8 overflow-auto">
        <div className="w-full max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">
            {isAdmin ? "Liste des Commandes de Matériel" : "Mes Commandes de Matériel en Attente"}
          </h1>
          {error && <p className="text-red-500">{error}</p>}
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
                <div className="flex space-x-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleDownloadPDF(commande)}
                  >
                    Télécharger PDF
                  </button>
                  {isAdmin && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MesCommandesMateriel;
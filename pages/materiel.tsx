import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import MenubarRe from "../components/ui/MenuBarRe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MaterielPage = () => {
  const [materiels, setMateriels] = useState<any[]>([]); 
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [quantite, setQuantite] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [etat, setEtat] = useState("neuf");
  const [dateExpiration, setDateExpiration] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchMateriels = async () => {
    const { data, error } = await supabase
      .from("materiels")
      .select("*"); 

    if (error) {
      console.error("Erreur lors de la récupération des matériels:", error);
      return;
    }

    setMateriels(data); 
  };

  useEffect(() => {
    fetchMateriels(); 
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const expirationDate = dateExpiration.trim() === "" ? null : dateExpiration;

    const materielData = {
      nom,
      description,
      quantite,
      numero_serie: numeroSerie,
      etat,
      date_expiration: expirationDate, 
    };

    try {
      const { data, error } = await supabase
        .from("materiels")
        .insert([materielData]);

      if (error) {
        throw new Error(`Erreur lors de l'ajout du matériel: ${error.message}`);
      }

      setShowModal(false);
      fetchMateriels();
      setNom("");
      setDescription("");
      setQuantite("");
      setNumeroSerie("");
      setEtat("neuf");
      setDateExpiration("");
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du matériel:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="relative flex h-screen bg-gray-800">
      <div className="animated-background"></div>
      <div className="waves"></div>
      <MenubarRe />
      <main className="main-content flex-1 p-8 overflow-auto">
        <div className="w-full max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-white">Liste des matériels</h2>
          <button
            onClick={() => setShowModal(true)}
            className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ajouter un matériel
          </button>
          <table className="min-w-full table-auto mb-4">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Nom</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Quantité</th>
                <th className="px-4 py-2 border">Numéro de série</th>
                <th className="px-4 py-2 border">État</th>
                <th className="px-4 py-2 border">Date d'expiration</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materiels.map((materiel) => (
                <tr key={materiel.id}>
                  <td className="px-4 py-2 border">{materiel.nom}</td>
                  <td className="px-4 py-2 border">{materiel.description}</td>
                  <td className="px-4 py-2 border">{materiel.quantite}</td>
                  <td className="px-4 py-2 border">{materiel.numero_serie}</td>
                  <td className="px-4 py-2 border">{materiel.etat}</td>
                  <td className="px-4 py-2 border">{materiel.date_expiration}</td>
                  <td className="px-4 py-2 border">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">Modifier</button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded ml-2">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Ajouter un matériel</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700" htmlFor="nom">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700" htmlFor="description">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700" htmlFor="quantite">
                    Quantité
                  </label>
                  <input
                    type="number"
                    id="quantite"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700" htmlFor="numero_serie">
                    Numéro de série
                  </label>
                  <input
                    type="text"
                    id="numero_serie"
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700" htmlFor="etat">
                    État
                  </label>
                  <select
                    id="etat"
                    value={etat}
                    onChange={(e) => setEtat(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="neuf">Neuf</option>
                    <option value="usagé">Usagé</option>
                    <option value="endommagé">Endommagé</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700" htmlFor="date_expiration">
                    Date d'expiration
                  </label>
                  <input
                    type="date"
                    id="date_expiration"
                    value={dateExpiration}
                    onChange={(e) => setDateExpiration(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-red-500 text-gray-300 rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MaterielPage;
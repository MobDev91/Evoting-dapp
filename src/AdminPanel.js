// ✅ AdminPanel.js — avec réinitialisation complète (resetAll)
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { adminAddress } from "./config";

function AdminPanel({ account, contract, refreshAll }) {
  const [newVoter, setNewVoter] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);

  const fetchElectionStatus = async () => {
    try {
      const active = await contract.isElectionActive();
      setIsActive(active);
    } catch (err) {
      console.error("Erreur état élection :", err);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchElectionStatus();
    }
  }, [contract]);

  const registerVoter = async () => {
    if (!ethers.isAddress(newVoter)) {
      setMessage("❌ Adresse invalide");
      return;
    }

    try {
      const isAlreadyRegistered = await contract.isRegistered(newVoter);
      if (isAlreadyRegistered) {
        setMessage("⚠️ Cette adresse est déjà enregistrée");
        return;
      }

      setLoading(true);
      const tx = await contract.registerVoter(newVoter);
      await tx.wait();
      setMessage("✅ Électeur ajouté : " + newVoter);
      setNewVoter("");
    } catch (err) {
      console.error("Erreur ajout électeur :", err);
      setMessage("❌ Échec de l'ajout de l'électeur");
    } finally {
      setLoading(false);
    }
  };

  const startElection = async () => {
    try {
      setLoading(true);
      const tx = await contract.startElection();
      await tx.wait();
      setMessage("✅ Élection démarrée");
      refreshAll();
      fetchElectionStatus();
    } catch (err) {
      console.error("Erreur startElection :", err);
      setMessage("❌ Erreur lors du démarrage de l'élection");
    } finally {
      setLoading(false);
    }
  };

  const endElection = async () => {
    try {
      setLoading(true);
      const tx = await contract.endElection();
      await tx.wait();
      setMessage("✅ Élection terminée");
      refreshAll();
      fetchElectionStatus();
    } catch (err) {
      console.error("Erreur endElection :", err);
      setMessage("❌ Erreur lors de la clôture de l'élection");
    } finally {
      setLoading(false);
    }
  };

  const resetElection = async () => {
    try {
      setLoading(true);
      const tx = await contract.resetElection();
      await tx.wait();
      setMessage("✅ Élection réinitialisée");
      refreshAll();
      fetchElectionStatus();
    } catch (err) {
      console.error("Erreur resetElection :", err);
      setMessage("❌ Échec de la réinitialisation de l'élection");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = async () => {
    if (!window.confirm("⚠️ Cette action supprimera tous les électeurs et candidats. Continuer ?")) return;
    try {
      setLoading(true);
      const tx = await contract.resetAll();
      await tx.wait();
      setMessage("✅ Réinitialisation complète effectuée");
      refreshAll();
      fetchElectionStatus();
    } catch (err) {
      console.error("Erreur resetAll :", err);
      setMessage("❌ Échec de la réinitialisation complète");
    } finally {
      setLoading(false);
    }
  };

  if (!account || account.toLowerCase() !== adminAddress.toLowerCase()) return null;

  return (
    <div className="mt-12 p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md animate-fade-in">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4">🛠️ Panneau d'administration</h3>
      <p className="text-sm text-gray-600 mb-6"><strong>Adresse admin :</strong> {adminAddress}</p>

      <div className="mb-6">
        <label className="block text-gray-700 mb-1">Adresse à enregistrer :</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newVoter}
            onChange={(e) => setNewVoter(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring focus:border-blue-500"
          />
          <button
            onClick={registerVoter}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            ➕ Ajouter
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <button
          onClick={startElection}
          disabled={loading || isActive}
          className={`font-semibold px-4 py-2 rounded text-white ${loading || isActive ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          🚀 Démarrer l’élection
        </button>
        <button
          onClick={endElection}
          disabled={loading || !isActive}
          className={`font-semibold px-4 py-2 rounded text-white ${loading || !isActive ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
        >
          🛑 Terminer l’élection
        </button>
        <button
          onClick={resetElection}
          disabled={loading || isActive}
          className={`font-semibold px-4 py-2 rounded text-white ${loading || isActive ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}
        >
          🔁 Réinitialiser l’élection
        </button>
        <button
          onClick={resetAll}
          disabled={loading || isActive}
          className={`font-semibold px-4 py-2 rounded text-white ${loading || isActive ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}
        >
          🧨 Réinitialisation complète
        </button>
      </div>

      {message && (
        <p className={`mt-4 font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AdminPanel;
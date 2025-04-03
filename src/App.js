// ✅ App.js — Avec graphique camembert circulaire (Recharts)
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./contract/EVoteABI.json";
import { contractAddress, adminAddress } from "./config";
import AdminPanel from "./AdminPanel";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [electionStatus, setElectionStatus] = useState("chargement...");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const evote = new ethers.Contract(contractAddress, abi, signer);
        setContract(evote);
      } catch (err) {
        console.error("Connexion Metamask échouée :", err);
      }
    } else {
      alert("Veuillez installer Metamask !");
    }
  };

  const loadCandidates = async () => {
    if (!contract) return;
    try {
      const candidate1 = await contract.getCandidate(1);
      const candidate2 = await contract.getCandidate(2);
      const candidate3 = await contract.getCandidate(3);

      setCandidates([
        { id: 1, name: candidate1[0], votes: parseInt(candidate1[1]) },
        { id: 2, name: candidate2[0], votes: parseInt(candidate2[1]) },
        { id: 3, name: candidate3[0], votes: parseInt(candidate3[1]) },
      ]);
    } catch (err) {
      console.error("Erreur chargement candidats :", err);
    }
  };

  const checkIfVoted = async () => {
    if (!contract || !account) return;
    try {
      const voted = await contract.hasVoted(account);
      setHasVoted(voted);
    } catch (err) {
      console.error("Erreur vérification vote :", err);
    }
  };

  const checkElectionStatus = async () => {
    if (!contract) return;
    try {
      const active = await contract.isElectionActive();
      setIsElectionActive(active);
      setElectionStatus(active ? "✅ En cours" : "❌ Inactive");
    } catch (err) {
      console.error("Erreur statut élection :", err);
      setElectionStatus("Erreur lors du chargement");
    }
  };

  const voteForCandidate = async (candidateId) => {
    try {
      const tx = await contract.vote(candidateId);
      await tx.wait();
      alert("✅ Vote enregistré !");
      loadCandidates();
      checkIfVoted();
    } catch (err) {
      console.error("Erreur lors du vote :", err);
      alert("❌ Erreur : " + err.message);
    }
  };

  const refreshAll = () => {
    loadCandidates();
    checkIfVoted();
    checkElectionStatus();
  };

  useEffect(() => {
    if (contract) {
      refreshAll();
    }
  }, [contract, account]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <header className="text-center mb-8">
      <img
    src="/logo.png" alt="Logo MIAE" className="mx-auto shadow-lg"/>
        <h1 className="text-4xl font-bold mb-2">🗳️ Système de Vote Électronique</h1>
        <p className="text-lg">Basé sur la blockchain Ethereum</p>
        <div className="mt-4">
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
          >
            {account ? `✅ Connecté : ${account}` : "🔌 Connecter Metamask"}
          </button>
        </div>
        <p className="mt-2 text-sm">🕓 État de l'élection : <strong>{electionStatus}</strong></p>
      </header>

      <section className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">🗳️ Candidats</h2>
        {candidates.length === 0 && <p>Chargement des candidats...</p>}
        {candidates.map((c) => (
          <div key={c.id} className="bg-gray-50 p-4 mb-4 rounded-md">
            <p className="mb-2">👤 <strong>{c.name}</strong> — 🗳️ {c.votes} vote(s)</p>
            <button
              onClick={() => voteForCandidate(c.id)}
              disabled={hasVoted || !isElectionActive}
              className={`px-4 py-2 rounded text-white font-medium ${
                hasVoted || !isElectionActive ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {hasVoted
                ? "🛑 Vous avez déjà voté"
                : !isElectionActive
                ? "⏳ Élection inactive"
                : `🗳️ Voter pour ${c.name}`}
            </button>
          </div>
        ))}
        <button
          onClick={loadCandidates}
          className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          🔄 Rafraîchir les résultats
        </button>
      </section>

      <section className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">📊 Résultats en temps réel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={candidates}
              dataKey="votes"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {candidates.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <AdminPanel account={account} contract={contract} refreshAll={refreshAll} />

      <footer className="mt-10 text-center text-sm text-gray-500">
        <p>© 2025 Evote System | Master Intelligence Artificielle Embarqée</p>
      </footer>
    </div>
  );
}

export default App;
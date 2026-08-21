import React, { useState } from "react";
import { Users, Plus, Search, Trash2 } from "lucide-react";
import type { PlayerProfile } from "@poker-tracker/shared";

interface PlayersViewProps {
  players: PlayerProfile[];
  onAddPlayer: (name: string, tag: string, colorHex: string, notes: string) => void;
  onDeletePlayer: (id: string) => void;
}

export const PlayersView: React.FC<PlayersViewProps> = ({
  players,
  onAddPlayer,
  onDeletePlayer
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [tag, setTag] = useState("Calling Station / Passivo");
  const [colorHex, setColorHex] = useState("#10B981");
  const [notes, setNotes] = useState("");

  const filteredPlayers = players.filter((p) =>
    p.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.notes || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlayer(name, tag, colorHex, notes);
    setShowAddModal(false);
    setName("");
    setNotes("");
  };

  const presetTags = [
    { label: "Calling Station / Passivo", color: "#10B981" },
    { label: "Maniac / Ultra Agressivo", color: "#EF4444" },
    { label: "TAG (Tight Agressivo - Reg)", color: "#3B82F6" },
    { label: "Rock / Nit (Super Fechado)", color: "#9CA3AF" },
    { label: "Fish / Recreativo Alvo", color: "#F59E0B" }
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-8">
      {/* Header & Search */}
      <div className="bg-poker-card border border-poker-border rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Perfil de Oponentes / Vilões
          </h2>
          <span className="text-xs text-slate-400">
            {players.length} adversários catalogados
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar adversário..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-200"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="touch-target px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            Novo Jogador
          </button>
        </div>
      </div>

      {/* Players List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full bg-poker-card border border-poker-border rounded-xl p-8 text-center text-slate-500">
            Nenhum jogador cadastrado ou encontrado na busca.
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="bg-poker-card border border-poker-border rounded-xl p-4 space-y-3 shadow-md hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: player.colorHex }}
                  />
                  <h3 className="text-sm font-bold text-slate-100">{player.playerName}</h3>
                </div>

                <button
                  onClick={() => onDeletePlayer(player.id)}
                  className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${player.colorHex}20`,
                    color: player.colorHex,
                    borderColor: `${player.colorHex}40`,
                    borderWidth: 1
                  }}
                >
                  {player.tag}
                </span>
              </div>

              {player.notes && (
                <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                  {player.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Jogador (US09 - Cenario 01) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-poker-card border border-poker-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Adicionar Perfil de Adversário</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome / Nickname</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva, PokerMonster99"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tag / Estilo de Jogo</label>
                <div className="space-y-2">
                  <select
                    value={tag}
                    onChange={(e) => {
                      setTag(e.target.value);
                      const found = presetTags.find((t) => t.label === e.target.value);
                      if (found) setColorHex(found.color);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100"
                  >
                    {presetTags.map((p) => (
                      <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Cor do Marcador:</span>
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notas & Tells</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Tendências, 3-bet range, histórico de blefes..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="touch-target flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="touch-target flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

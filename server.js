// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🎲 Sannsynlighet for hver rarity
const rarityWeights = {
  grey: 60,   // 60% – Common
  green: 25,  // 25% – Rare
  blue: 10,   // 10% – Super Rare
  gold: 4,    // 4% – Hyper Rare
  purple: 1   // 1% – Legendary
};

// 🎁 Loot per rarity (tekst – fyll gjerne inn img senere)
const lootTable = {
  grey: [
    { item: "Common bulk-pakke (10 kort)", img: "" },
    { item: "Random reverse holo",         img: "" },
  ],
  green: [
    { item: "Random V-kort",               img: "" },
    { item: "Random EX-kort",              img: "" },
  ],
  blue: [
    { item: "Full Art / bedre hit",        img: "" },
    { item: "Bedre treningskort",          img: "" },
  ],
  gold: [
    { item: "Secret Rare / Gold-kort",     img: "" },
    { item: "To random hits",              img: "" },
  ],
  purple: [
    { item: "LEGENDARY premie – stor gevinst!", img: "" },
    { item: "Valgfri chase (etter avtale)",     img: "" },
  ],
};

// 🔑 Disse 20 kodene er gyldige (vanskeligere å gjette)
const codes = {
  "PV-7G4K-X9": { used: false },
  "PV-M2QJ-4L": { used: false },
  "PV-AX9D-73": { used: false },
  "PV-QP5L-2Z": { used: false },
  "PV-K7V2-M8": { used: false },
  "PV-R3TN-91": { used: false },
  "PV-HL8Q-5X": { used: false },
  "PV-Z9FD-06": { used: false },
  "PV-CT2M-8W": { used: false },
  "PV-N4YJ-3K": { used: false },
  "PV-W7B9-1Q": { used: false },
  "PV-UG3L-55": { used: false },
  "PV-D2XP-9V": { used: false },
  "PV-FA6R-0N": { used: false },
  "PV-LX3C-7P": { used: false },
  "PV-YP9M-12": { used: false },
  "PV-GQ4Z-88": { used: false },
  "PV-BT1H-6E": { used: false },
  "PV-S9KV-24": { used: false },
  "PV-JM8D-39": { used: false },
};

// 📦 Hjelpefunksjon: trekk rarity basert på odds
function rollRarity() {
  const entries = Object.entries(rarityWeights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    if (r < weight) return key;
    r -= weight;
  }
  return "grey";
}

// 📦 Hjelpefunksjon: velg premie innenfor rarity
function pickReward(rarity) {
  const list = lootTable[rarity] || lootTable.grey;
  return list[Math.floor(Math.random() * list.length)];
}

// 🔗 POST /api/redeem – frontenden kaller denne
app.post("/api/redeem", (req, res) => {
  const codeRaw = req.body && req.body.code;
  if (!codeRaw) {
    return res.status(400).json({ error: "Ingen kode mottatt." });
  }

  const code = String(codeRaw).trim().toUpperCase();
  const entry = codes[code];

  // Koden finnes ikke i lista → ugyldig
  if (!entry) {
    return res.status(404).json({ error: "Ugyldig kode." });
  }

  // Allerede brukt
  if (entry.used) {
    return res.status(400).json({ error: "Denne koden er allerede brukt." });
  }

  // Første gang: alltid godkjent → trekk random reward
  const rarity = rollRarity();          // følger oddsene
  const reward = pickReward(rarity);    // random item innenfor den rarityen

  // Marker koden brukt + lagre hva som ble trukket (kun i minnet)
  entry.used = true;
  entry.rarityWon = rarity;
  entry.itemWon = reward.item;
  entry.img = reward.img || "";

  return res.json({
    message: "Koden er godkjent! 🎉",
    code,
    rarity,
    item: reward.item,
    img: reward.img || "",
    winner: `Kode ${code}`,
  });
});

// 🌐 GET / – healthcheck
app.get("/", (req, res) => {
  res.send("Pokevenner Giveaway API kjører 🧡");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Giveaway API kjører på port ${PORT}`);
});

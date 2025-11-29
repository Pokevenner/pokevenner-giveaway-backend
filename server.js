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

// 🎁 Loot per rarity
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

// 🔑 Kodene dine – DETTE ER LISTA SOM GJELDER
const codes = {
  "PK-001":      { used: false },
  "PK-002":      { used: false },
  "PK-003":      { used: false },

  "PV-TEST-1":   { used: false },
  "PV-TEST-2":   { used: false },

  // Spesialkoder:
  "PK-LEG-001":   { used: false, forceRarity: "purple" }, // alltid Legendary
  "PK-HYPER-001": { used: false, forceRarity: "gold" },   // alltid Hyper Rare
};

// 📦 Hjelpefunksjon: trekk rarity
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

  if (!entry) {
    return res.status(404).json({ error: "Ugyldig kode." });
  }

  if (entry.used) {
    return res.status(400).json({ error: "Denne koden er allerede brukt." });
  }

  const rarity = (entry.forceRarity || rollRarity()).toLowerCase();
  const reward = pickReward(rarity);

  entry.used = true;
  entry.rarityWon = rarity;
  entry.itemWon = reward.item;
  entry.img = reward.img;

  res.json({
    message: "Koden er godkjent! 🎉",
    code,
    rarity,
    item: reward.item,
    img: reward.img || "",
    winner: `Kode ${code}`,
  });
});

// 🌐 GET / – Render healthcheck / test
app.get("/", (req, res) => {
  res.send("Pokevenner Giveaway API kjører 🧡");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Giveaway API kjører på port ${PORT}`);
});

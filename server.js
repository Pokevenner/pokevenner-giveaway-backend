// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🎲 Sannsynlighet for hver rarity (tilfeldig trekk hvis koden ikke har tvungen rarity)
const rarityWeights = {
  grey: 60,    // 60% sjanse – Common
  green: 25,   // 25% – Rare
  blue: 10,    // 10% – Super Rare
  gold: 4,     // 4% – Hyper Rare
  purple: 1    // 1% – Legendary
};

// 🎁 Hva som kan droppes på hver rarity
// Du kan endre navnene og legge til flere
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

// 🔑 HER legger du inn kodene dine
// key = selve koden, value = info om koden
// - used: om den er brukt
// - forceRarity (valgfritt): tvinger en bestemt rarity for den koden
//
// EKSEMPLER under – bytt ut / legg til dine egne:
const codes = {
  // Vanlig kode → bruker rarityWeights over
  "PK-001": { used: false },

  // Flere vanlige
  "PK-002": { used: false },
  "PK-003": { used: false },
"PK-004": { used: false },
"PK-005": { used: false },
"PK-006": { used: false },

  // Kode som ALLTID skal gi Legendary
  "PK-LEG-001": { used: false, forceRarity: "purple" },

  // Kode som alltid gir minst Hyper Rare
  "PK-HYPER-001": { used: false, forceRarity: "gold" },
};

// 📦 Hjelpefunksjon: trekk rarity basert på rarityWeights
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

// 📦 Hjelpefunksjon: velg tilfeldig premie innenfor en rarity
function pickReward(rarity) {
  const list = lootTable[rarity] || lootTable.grey;
  return list[Math.floor(Math.random() * list.length)];
}

// 🔗 POST /api/redeem – brukes av begge HTML-sidene
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

  // Bestem rarity: tvungen eller tilfeldig
  const rarity = (entry.forceRarity || rollRarity()).toLowerCase();
  const reward = pickReward(rarity);

  // Marker koden som brukt og lagre resultatet (hvis du vil se senere)
  entry.used = true;
  entry.rarityWon = rarity;
  entry.itemWon = reward.item;
  entry.img = reward.img;

  // Send resultatet tilbake til nettsiden
  res.json({
    message: "Koden er godkjent! 🎉",
    code,
    rarity,
    item: reward.item,
    img: reward.img || "",
    winner: `Kode ${code}`,
  });
});

// Start serveren
app.listen(PORT, () => {
  console.log(`Giveaway API kjører på port ${PORT}`);
});

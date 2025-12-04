// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 enkel "hemmelig nøkkel" for å resette koder
// BYTT DENNE til noe bare du vet, hvis du vil
const ADMIN_RESET_KEY = process.env.ADMIN_RESET_KEY || "FERDI-RESET-1337";

app.use(cors());
app.use(express.json());

// 🔑 Disse 20 kodene er gyldige
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

// 🎲 Odds for rarity
const rarityWeights = {
  grey: 60,   // 5x random EX (vanligst)
  green: 25,  // 2x random full art
  blue: 10,   // Gengar stamped
  gold: 4,    // Mega Lopunny EX
  purple: 1   // Phantasmal Flames (TOPP)
};

// 🔗 Base-url til GitHub raw (frontend-repo)
const RAW_BASE = "https://raw.githubusercontent.com/Pokevenner/Pokevenner-giveaway-frontend/master/assets/prizes";

// 🎁 Premiene – peker på GitHub-bilder
const lootTable = {
  grey: [
    {
      item: "5x Random EX cards",
      img: `${RAW_BASE}/5xrandom.jpg`,
    },
  ],

  green: [
    {
      item: "2x Random Full Art",
      img: `${RAW_BASE}/2xrandomfullart.jpg`,
    },
  ],

  blue: [
    {
      item: "Gengar stamped promo",
      img: `${RAW_BASE}/gengarstamped.jpg`,
    },
  ],

  gold: [
    {
      item: "Mega Lopunny EX",
      img: `${RAW_BASE}/megalopunnyex.jpg`,
    },
  ],

  purple: [
    {
      item: "Phantasmal Flames (TOPP premie)",
      img: `${RAW_BASE}/phantasmalflames.jpg`,
    },
  ],
};

// 📦 Velg rarity basert på odds
function rollRarity() {
  const total = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;

  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    if (r < weight) return rarity;
    r -= weight;
  }
  return "grey";
}

// 📦 Velg tilfeldig premie innen rarity
function pickReward(rarity) {
  const list = lootTable[rarity];
  return list[Math.floor(Math.random() * list.length)];
}

// 🧼 Reset-funksjon: sett alle used = false
function resetAllCodes() {
  Object.keys(codes).forEach((code) => {
    codes[code].used = false;
  });
}

// 🔗 POST /api/redeem
app.post("/api/redeem", (req, res) => {
  const raw = req.body.code;
  if (!raw) return res.status(400).json({ error: "Ingen kode sendt." });

  const code = raw.toUpperCase().trim();

  // Finnes koden ikke?
  if (!codes[code]) {
    return res.status(400).json({ error: "Ugyldig kode." });
  }

  // Allerede brukt?
  if (codes[code].used) {
    return res.status(400).json({ error: "Denne koden er allerede brukt." });
  }

  // Markér som brukt
  codes[code].used = true;

  // Trekk premie
  const rarity = rollRarity();
  const reward = pickReward(rarity);

  return res.json({
    message: "Koden er godkjent! 🎉",
    code,
    rarity,
    item: reward.item,
    img: reward.img,
    winner: `Kode ${code}`,
  });
});

// 🧨 ADMIN: Reset alle koder (bruk BARE selv)
app.all("/api/admin/reset", (req, res) => {
  const key = (req.query.key || req.body.key || "").trim();

  if (key !== ADMIN_RESET_KEY) {
    return res.status(403).json({ error: "Ikke autorisert." });
  }

  resetAllCodes();
  return res.json({ ok: true, message: "Alle koder er resatt." });
});

// 🌐 Test route
app.get("/", (req, res) => {
  res.send("Pokevenner Giveaway API kjører 🧡");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Giveaway API kjører på port ${PORT}`);
});

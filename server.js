// server.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🎲 Sannsynlighet for hver rarity (samme som før)
const rarityWeights = {
  grey: 60,   // 60% – Common (lettest å få)
  green: 25,  // 25% – Rare
  blue: 10,   // 10% – Super Rare
  gold: 4,    // 4% – Hyper Rare
  purple: 1   // 1% – Legendary (mest sjelden)
};

// 🎁 Loot per rarity – mappet til dine faktiske premier
// Mest sjelden → minst sjelden:
// purple: Phantasmal Flames (top prize)
// gold:   Mega Lopunny EX
// blue:   Gengar stamped
// green:  2x random Full Art
// grey:   5x EX (vanligst)
const lootTable = {
  grey: [
    {
      item: "5x Random EX cards",
      img: "https://pokevenner-mystery.netlify.app/assets/prizes/5xrandom ex cards.jpg",
    },
  ],

  green: [
    {
      item: "2x Random Full Art",
      img: "https://pokevenner-mystery.netlify.app/assets/prizes/2xrandomfullart.jpg",
    },
  ],

  blue: [
    {
      item: "Gengar stamped promo",
      img: "https://pokevenner-mystery.netlify.app/assets/prizes/gengar stamped.jpg",
    },
  ],

  gold: [
    {
      item: "Mega Lopunny EX",
      img: "https://pokevenner-mystery.netlify.app/assets/prizes/megalopunnyex.jpg",
    },
  ],

  purple: [
    {
      item: "Phantasmal Flames – TOPP premie",
      img: "https://pokevenner-mystery.netlify.app/assets/prizes/phantasmal flames.jpg",
    },
  ],
};

// 🧠 Her lagrer vi brukte koder i minnet
// Struktur: usedCodes[CODE] = { rarity, item, img }
const usedCodes = {};

// 📦 Hjelpefunksjon: trekk rarity ut fra vektene
function rollRarity() {
  const entries = Object.entries(rarityWeights);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    if (r < weight) return key;
    r -= weight;
  }
  return "grey"; // fallback
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

  // Hvis koden har vært brukt før → blokker
  if (usedCodes[code]) {
    return res.status(400).json({ error: "Denne koden er allerede brukt." });
  }

  // Første gang: alltid godkjent → trekk rarity og premie
  const rarity = rollRarity();
  const reward = pickReward(rarity);

  usedCodes[code] = {
    rarity,
    item: reward.item,
    img: reward.img || "",
  };

  return res.json({
    message: "Koden er godkjent! 🎉",
    code,
    rarity,
    item: reward.item,
    img: reward.img || "",
    winner: `Kode ${code}`,
  });
});

// 🌐 GET / – enkel healthcheck
app.get("/", (req, res) => {
  res.send("Pokevenner Giveaway API kjører 🧡");
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Giveaway API kjører på port ${PORT}`);
});

// =========================
// CONFIGURATION SECTION
// =========================
const tokenData = [
  {
    name: "ARES",
    symbol: "ARES",
    image: "assets/ARES.png",            // Path to token icon
    mint: "YOUR_MINT_ADDRESS_1",         // Replace with ARES mint address
    launchPrice: 0.05,                   // USD launch price per token
  },
  {
    name: "ZEUS",
    symbol: "ZEUS",
    image: "assets/ZEUS.png",            // Path to token icon
    mint: "YOUR_MINT_ADDRESS_2",         // Replace with ZEUS mint address
    launchPrice: 0.08,                   // USD launch price
  },
  {
    name: "THOR",
    symbol: "THOR",
    image: "assets/THOR.png",            // Path to token icon
    mint: "YOUR_MINT_ADDRESS_3",         // Replace with THOR mint address
    launchPrice: 0.06,                   // USD launch price
  },
  // Add more tokens here as needed...
];

// =========================
// HELPER: Fetch current price from Jupiter API
// =========================
async function fetchPrice(mintAddress) {
  try {
    const res = await fetch(`https://quote-api.jup.ag/v6/price?ids=${mintAddress}`);
    const json = await res.json();
    // Jupiter returns an object keyed by mint
    const price = json.data[mintAddress]?.price || 0;
    return price;
  } catch (err) {
    console.error(`Error fetching Jupiter price for ${mintAddress}:`, err);
    return 0;
  }
}

// =========================
// HELPER: Fetch holders & liquidity from Solscan API
// =========================
async function fetchSolscanData(mintAddress) {
  try {
    const res = await fetch(`https://public-api.solscan.io/token/meta?tokenAddress=${mintAddress}`);
    const json = await res.json();
    // Solscan returns holderCount and liquidity fields
    const holders = json.holderCount || 0;
    const liquidity = json.liquidity || 0;
    return { holders, liquidity };
  } catch (err) {
    console.error(`Error fetching Solscan data for ${mintAddress}:`, err);
    return { holders: "-", liquidity: "-" };
  }
}

// =========================
// RENDER FUNCTION: Populate the table
// =========================
async function renderTokenTable() {
  const tbody = document.getElementById("token-data");
  tbody.innerHTML = ""; // Clear any existing rows

  for (const token of tokenData) {
    // 1) Fetch live price
    const currentPrice = await fetchPrice(token.mint);

    // 2) Fetch holders & liquidity
    const { holders, liquidity } = await fetchSolscanData(token.mint);

    // 3) Calculate market cap and lifetime gain
    const supply = 5000; // fixed supply per token
    const marketCap = (currentPrice * supply).toFixed(2);
    const lifetimeGain = token.launchPrice
      ? (((currentPrice - token.launchPrice) / token.launchPrice) * 100).toFixed(1)
      : "-";

    // 4) Format explorer link truncated
    const truncated = token.mint.slice(0, 4) + "..." + token.mint.slice(-4);
    const explorerURL = `https://solscan.io/token/${token.mint}`;

    // 5) Create a table row
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${token.image}" alt="${token.symbol}" />
        <strong>${token.name}</strong> (${token.symbol})
      </td>
      <td>$${marketCap}</td>
      <td>$${currentPrice.toFixed(4)}</td>
      <td>${holders}</td>
      <td>$${liquidity.toFixed(2)}</td>
      <td>${lifetimeGain}%</td>
      <td><a href="${explorerURL}" target="_blank">${truncated}</a></td>
    `;
    tbody.appendChild(row);
  }
}

// Kick off table rendering on page load
document.addEventListener("DOMContentLoaded", renderTokenTable);

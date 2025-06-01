// =========================
// CONFIGURATION SECTION
// =========================
const tokenData = [
  {
    name: "ARES",
    symbol: "ARES",
    image: "assets/ARES.png",
    jupiterId: "SOL", // Jupiter expects token symbol or ID (e.g., "SOL")
    mint: "So11111111111111111111111111111111111111112", // SOL native token mint
    launchPrice: 0.5,
  },
  {
    name: "USDC",
    symbol: "USDC",
    image: "assets/USDC.png",
    jupiterId: "USDC", // Jupiter token symbol
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC mint on Solana
    launchPrice: 1.0,
  },
  {
    name: "RAY",
    symbol: "RAY",
    image: "assets/RAY.png",
    jupiterId: "RAY", // Jupiter token symbol for Raydium
    mint: "4k3Dyjzvzp8e6N2XfCFV5jv3s5ZD5N6t2nT2sW1LL1aM", // RAY mint
    launchPrice: 2.0,
  },
  // Add more tokens here as needed...
];

// =========================
// HELPER: Fetch current price via Jupiter API using jupiterId
// =========================
async function fetchPrice(jupiterId) {
  try {
    const res = await fetch(`https://quote-api.jup.ag/v6/price?ids=${jupiterId}`);
    if (!res.ok) throw new Error(`Status code: ${res.status}`);
    const json = await res.json();
    // Jupiter returns an object keyed by jupiterId
    const price = json.data[jupiterId]?.price || 0;
    return price;
  } catch (err) {
    console.error(`Error fetching Jupiter price for ${jupiterId}:`, err);
    return 0;
  }
}

// =========================
// HELPER: Fetch holders & liquidity via Solscan API using mint
// =========================
async function fetchSolscanData(mintAddress) {
  try {
    const res = await fetch(
      `https://public-api.solscan.io/token/meta?tokenAddress=${mintAddress}`
    );
    if (!res.ok) throw new Error(`Status code: ${res.status}`);
    const json = await res.json();
    const holders = json.holderCount || 0;
    const liquidity = json.liquidity || 0;
    return { holders, liquidity };
  } catch (err) {
    console.error(`Error fetching Solscan data for ${mintAddress}:`, err);
    return { holders: 0, liquidity: 0 };
  }
}

// =========================
// RENDER FUNCTION: Populate the table with live data only
// =========================
async function renderTokenTable() {
  const tbody = document.getElementById("token-data");
  tbody.innerHTML = ""; // Clear existing rows

  for (const token of tokenData) {
    console.log(`Fetching data for: ${token.symbol}`);

    // 1) Fetch live price using jupiterId
    const currentPrice = await fetchPrice(token.jupiterId);
    console.log(`Price for ${token.symbol}:`, currentPrice);

    // 2) Fetch holders & liquidity using mint
    const { holders, liquidity } = await fetchSolscanData(token.mint);
    console.log(
      `Holders for ${token.symbol}:`,
      holders,
      `Liquidity:`,
      liquidity
    );

    // Skip tokens with no live price
    if (currentPrice === 0) continue;

    // Calculate market cap
    const supply = 5000; // fixed supply per token
    const marketCap = (currentPrice * supply).toFixed(2);

    // Format display values
    const displayPrice = `$${currentPrice.toFixed(4)}`;
    const displayLiquidity = liquidity > 0 ? `$${liquidity.toFixed(2)}` : "N/A";
    const displayHolders = holders > 0 ? holders : "N/A";

    const lifetimeGain = token.launchPrice
      ? (((currentPrice - token.launchPrice) / token.launchPrice) * 100).toFixed(1)
      : "-";

    // Truncate mint for explorer link
    const truncated = `${token.mint.slice(0, 4)}...${token.mint.slice(-4)}`;
    const explorerURL = `https://solscan.io/token/${token.mint}`;

    // Create table row
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${token.image}" alt="${token.symbol}" width="24" height="24" />
        <strong>${token.name}</strong> (${token.symbol})
      </td>
      <td>$${marketCap}</td>
      <td>${displayPrice}</td>
      <td>${displayHolders}</td>
      <td>${displayLiquidity}</td>
      <td>${lifetimeGain}%</td>
      <td><a href="${explorerURL}" target="_blank">${truncated}</a></td>
    `;
    tbody.appendChild(row);
  }
}

// Kick off table rendering on page load
document.addEventListener("DOMContentLoaded", renderTokenTable);
// Refresh every 60 seconds
setInterval(renderTokenTable, 60000);

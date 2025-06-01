// =========================
// CONFIGURATION SECTION
// =========================
const tokenData = [
  {
    name: "ARES",
    symbol: "ARES",
    image: "assets/ARES.png",
    mint: "HJ8Z8qkLXKS8HLCQEFquTXierjZKLnnkBAn4nTaDBZy1",
    launchPrice: 0.5,
  },
  {
    name: "ZEUS",
    symbol: "ZEUS",
    image: "assets/ZEUS.png",
    mint: "YOUR_MINT_ADDRESS_2",
    launchPrice: 0.5,
  },
  {
    name: "THOR",
    symbol: "THOR",
    image: "assets/THOR.png",
    mint: "YOUR_MINT_ADDRESS_3",
    launchPrice: 0.5,
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
    const holders = json.holderCount || 0;
    const liquidity = json.liquidity || 0;
    return { holders, liquidity };
  } catch (err) {
    console.error(`Error fetching Solscan data for ${mintAddress}:`, err);
    return { holders: 0, liquidity: 0 };
  }
}

// =========================
// RENDER FUNCTION: Populate the table
// =========================
async function renderTokenTable() {
  const tbody = document.getElementById("token-data");
  tbody.innerHTML = ""; // Clear existing rows

  for (const token of tokenData) {
    // 1) Fetch live price
    const currentPrice = await fetchPrice(token.mint);

    // 2) Fetch holders & liquidity
    const { holders, liquidity } = await fetchSolscanData(token.mint);

    const supply = 5000; // fixed supply per token

    // 3) Determine display values based on data availability

    // Price to show: currentPrice if > 0 else launchPrice as fallback
    const displayPrice = currentPrice > 0 ? currentPrice : token.launchPrice;

    // Market cap only if price live, else show '-'
    const marketCap = currentPrice > 0 ? (currentPrice * supply).toFixed(2) : "-";

    // Holders - if zero, show 0 (could be no holders yet)
    const displayHolders = holders > 0 ? holders : "0";

    // Liquidity - if zero, show 'TBA'
    const displayLiquidity = liquidity > 0 ? `$${liquidity.toFixed(2)}` : "TBA";

    // Lifetime gain only if currentPrice > 0, else '-'
    const lifetimeGain =
      currentPrice > 0
        ? (((currentPrice - token.launchPrice) / token.launchPrice) * 100).toFixed(1) + "%"
        : "-";

    // Truncate mint for explorer link
    const truncated = token.mint.slice(0, 4) + "..." + token.mint.slice(-4);
    const explorerURL = `https://solscan.io/token/${token.mint}`;

    // 4) Create row with fallback placeholders for pre-launch
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${token.image}" alt="${token.symbol}" />
        <strong>${token.name}</strong> (${token.symbol})
      </td>
      <td>${marketCap === "-" ? "Pending" : "$" + marketCap}</td>
      <td>$${displayPrice.toFixed(4)}</td>
      <td>${displayHolders}</td>
      <td>${displayLiquidity}</td>
      <td>${lifetimeGain}</td>
      <td><a href="${explorerURL}" target="_blank">${truncated}</a></td>
    `;
    tbody.appendChild(row);
  }
}

// Kick off table rendering on page load
document.addEventListener("DOMContentLoaded", renderTokenTable);
// Refresh every 60 seconds
setInterval(renderTokenTable, 60000);

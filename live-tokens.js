// =========================
// CONFIGURATION SECTION
// =========================
const tokenData = [
  {
    name: "ARES",
    symbol: "ARES",
    image: "assets/ARES.png",
    mint: "So11111111111111111111111111111111111111112",
    launchPrice: 0.5,
  },
  {
    name: "ZEUS",
    symbol: "ZEUS",
    image: "assets/ZEUS.png",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    launchPrice: 0.5,
  },
  {
    name: "THOR",
    symbol: "THOR",
    image: "assets/THOR.png",
    mint: "YOUR_MINT_ADDRESS_3",
    launchPrice: 0.5,
  },
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
    console.log(`Fetching data for: ${token.symbol}`);

    const currentPrice = await fetchPrice(token.mint);
    console.log(`Price for ${token.symbol}:`, currentPrice);

    const { holders, liquidity } = await fetchSolscanData(token.mint);
    console.log(`Holders for ${token.symbol}:`, holders, `Liquidity:`, liquidity);

    // If price is zero or missing, show a friendly pre-launch row
    /* if (currentPrice === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `
       <td>
         <img src="${token.image}" alt="${token.symbol}" />
          <strong>${token.name}</strong> (${token.symbol})
        </td>
        <td colspan="6" style="text-align:center; font-style: italic; color: #777;">
          Pre-launch or data not available yet
        </td>
      `;
      tbody.appendChild(row);
      continue;
    } */
    if (currentPrice === 0) continue;


    // Calculate values
    const supply = 5000; // fixed supply per token
    const marketCap = (currentPrice * supply).toFixed(2);

    // Format numbers or fallback to "N/A"
    const displayPrice = `$${currentPrice.toFixed(4)}`;
    const displayLiquidity = liquidity > 0 ? `$${liquidity.toFixed(2)}` : "N/A";
    const displayHolders = holders > 0 ? holders : "N/A";

    const lifetimeGain = token.launchPrice
      ? (((currentPrice - token.launchPrice) / token.launchPrice) * 100).toFixed(1)
      : "-";

    // Format explorer link truncated
    const truncated = token.mint.slice(0, 4) + "..." + token.mint.slice(-4);
    const explorerURL = `https://solscan.io/token/${token.mint}`;

    // Create table row with live data
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${token.image}" alt="${token.symbol}" />
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
// Re-run every 60 seconds
setInterval(renderTokenTable, 60000);

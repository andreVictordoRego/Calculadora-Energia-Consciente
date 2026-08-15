const devicesEl = document.getElementById("devices");
const template = document.getElementById("deviceTemplate");
const tariffEl = document.getElementById("tariff");
const totalKwhEl = document.getElementById("totalKwh");
const totalCostEl = document.getElementById("totalCost");
const deviceCountEl = document.getElementById("deviceCount");
const rankingListEl = document.getElementById("rankingList");

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});
const number = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function addDevice(name = "", power = 100, hours = 1, days = 30) {
  const node = template.content.cloneNode(true);
  const device = node.querySelector(".device");
  device.querySelector(".name").value = name;
  device.querySelector(".power").value = power;
  device.querySelector(".hours").value = hours;
  device.querySelector(".days").value = days;

  device.querySelector(".remove").addEventListener("click", () => {
    device.remove();
    calculate();
  });

  device.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", calculate);
  });

  devicesEl.appendChild(device);
  calculate();
}

function readDevices() {
  return [...devicesEl.querySelectorAll(".device")].map((device, index) => {
    const nameInput = device.querySelector(".name");
    const power = Math.max(0, Number(device.querySelector(".power").value) || 0);
    const hours = Math.min(24, Math.max(0, Number(device.querySelector(".hours").value) || 0));
    const days = Math.min(31, Math.max(0, Number(device.querySelector(".days").value) || 0));
    const name = nameInput.value.trim() || `Equipamento ${index + 1}`;

    const kwh = (power / 1000) * hours * days;
    return { name, power, hours, days, kwh };
  });
}

function calculate() {
  const tariff = Math.max(0, Number(tariffEl.value) || 0);
  const devices = readDevices();

  devices.forEach((item, index) => {
    const device = devicesEl.querySelectorAll(".device")[index];
    const cost = item.kwh * tariff;
    device.querySelector(".device-result").innerHTML =
      `Consumo: <strong>${number.format(item.kwh)} kWh/mês</strong> · Custo: <strong>${money.format(cost)}</strong>`;
  });

  const totalKwh = devices.reduce((sum, item) => sum + item.kwh, 0);
  const totalCost = totalKwh * tariff;

  totalKwhEl.innerHTML = `${number.format(totalKwh)} <small>kWh/mês</small>`;
  totalCostEl.textContent = money.format(totalCost);
  deviceCountEl.textContent = devices.length;

  renderRanking(devices);
}

function renderRanking(devices) {
  if (!devices.length) {
    rankingListEl.innerHTML = '<p class="empty">Adicione equipamentos para visualizar o ranking.</p>';
    return;
  }

  const sorted = [...devices].sort((a, b) => b.kwh - a.kwh);
  const max = sorted[0]?.kwh || 1;

  rankingListEl.innerHTML = sorted.slice(0, 6).map(item => {
    const width = Math.max(3, (item.kwh / max) * 100);
    return `
      <div class="rank-item">
        <span class="rank-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span>
        <span class="rank-value">${number.format(item.kwh)}</span>
        <div class="rank-bar"><span style="--width:${width}%"></span></div>
      </div>
    `;
  }).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

document.getElementById("addDevice").addEventListener("click", () => addDevice());
document.getElementById("calculate").addEventListener("click", calculate);
tariffEl.addEventListener("input", calculate);

addDevice("Chuveiro elétrico", 5500, 0.5, 30);
addDevice("Geladeira", 150, 10, 30);

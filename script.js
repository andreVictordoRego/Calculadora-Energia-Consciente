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


const comparisonDeviceEl = document.getElementById("comparisonDevice");
const newHoursEl = document.getElementById("newHours");
const comparisonResultEl = document.getElementById("comparisonResult");

function updateComparisonOptions(devices) {
  if (!comparisonDeviceEl) return;
  const previousValue = comparisonDeviceEl.value;
  comparisonDeviceEl.innerHTML = devices.map((device, index) =>
    `<option value="${index}">${escapeHtml(device.name)}</option>`
  ).join("");
  if (devices.length && [...comparisonDeviceEl.options].some(option => option.value === previousValue)) {
    comparisonDeviceEl.value = previousValue;
  }
  if (!devices.length) {
    comparisonResultEl.textContent = "Adicione equipamentos para comparar cenários de uso.";
  }
}

function compareUsage() {
  const devices = readDevices();
  if (!devices.length) {
    comparisonResultEl.textContent = "Adicione pelo menos um equipamento para fazer a comparação.";
    return;
  }

  const index = Number(comparisonDeviceEl.value) || 0;
  const device = devices[index];
  if (!device) return;

  const newHours = Math.min(24, Math.max(0, Number(newHoursEl.value) || 0));
  const tariff = Math.max(0, Number(tariffEl.value) || 0);
  const oldKwh = device.kwh;
  const newKwh = (device.power / 1000) * newHours * device.days;
  const savedKwh = Math.max(0, oldKwh - newKwh);
  const savedCost = savedKwh * tariff;
  const newCost = newKwh * tariff;

  comparisonResultEl.innerHTML =
    `Com o novo tempo de uso, <strong>${escapeHtml(device.name)}</strong> teria consumo estimado de ` +
    `<strong>${number.format(newKwh)} kWh/mês</strong> e custo de <strong>${money.format(newCost)}/mês</strong>. ` +
    (newHours <= device.hours
      ? `A redução estimada seria de <strong>${number.format(savedKwh)} kWh</strong> e <strong>${money.format(savedCost)}/mês</strong>.`
      : `O aumento estimado seria de <strong>${number.format(Math.max(0, newKwh - oldKwh))} kWh</strong> e <strong>${money.format(Math.max(0, newKwh - oldKwh) * tariff)}/mês</strong>.`);
}

document.getElementById("compareUsage")?.addEventListener("click", compareUsage);


const originalCalculate = calculate;
calculate = function() {
  originalCalculate();
  updateComparisonOptions(readDevices());
};

// Preenche o seletor de comparação com os equipamentos iniciais.
updateComparisonOptions(readDevices());



// Quiz: uma pergunta por vez, feedback imediato e agradecimento ao concluir.
(() => {
  const root = document.getElementById("knowledgeQuiz");
  if (!root) return;
  const area = document.getElementById("quizQuestionArea");
  const result = document.getElementById("quizResult");
  const progressText = document.getElementById("quizProgressText");
  const progressBar = document.getElementById("quizProgressBar");

  const questions = [
    {
      question: "Um chuveiro elétrico de 5.500 W funciona 30 minutos por dia durante 30 dias. Com tarifa de R$ 0,95/kWh, qual é o consumo e o custo mensal estimados?",
      options: ["27,5 kWh e R$ 26,13", "55 kWh e R$ 52,25", "82,5 kWh e R$ 78,38", "165 kWh e R$ 156,75"],
      correct: 2,
      explanation: "5.500 W equivalem a 5,5 kW. O consumo é 5,5 × 0,5 hora × 30 dias = 82,5 kWh. O custo é 82,5 × R$ 0,95 = R$ 78,375, arredondado para R$ 78,38."
    },
    {
      question: "Um aparelho de 1.500 W é usado 4 horas por dia. Se o uso cair para 3 horas por dia durante 30 dias, com tarifa de R$ 0,90/kWh, qual será a economia estimada?",
      options: ["15 kWh e R$ 13,50", "30 kWh e R$ 27,00", "45 kWh e R$ 40,50", "45 kWh e R$ 45,00"],
      correct: 2,
      explanation: "A redução é de 1 hora por dia. 1,5 kW × 1 hora × 30 dias = 45 kWh economizados. A R$ 0,90/kWh, isso corresponde a R$ 40,50."
    },
    {
      question: "Você percebe que vários aparelhos de alta potência estão ligados à mesma extensão, e o plugue está quente com cheiro de plástico aquecido. O que deve fazer?",
      options: ["Continuar usando se os aparelhos não desligarem", "Trocar por uma extensão mais longa e manter tudo ligado", "Interromper o uso se for seguro, manter as pessoas afastadas e solicitar avaliação de profissional qualificado", "Instalar um disjuntor de maior corrente sem verificar o circuito"],
      correct: 2,
      explanation: "Aquecimento e cheiro de plástico podem indicar sobrecarga ou mau contato. Pare de usar o conjunto se puder fazê-lo com segurança; não improvise reparos nem aumente a proteção sem avaliação técnica."
    },
    {
      question: "O disjuntor de um circuito desarma repetidamente. Qual é a conduta mais segura?",
      options: ["Religar quantas vezes forem necessárias", "Considerar que pode haver sobrecarga ou falha e solicitar avaliação antes de voltar ao uso normal", "Substituí-lo imediatamente por outro de maior corrente", "Usar adaptadores para distribuir mais aparelhos no mesmo circuito"],
      correct: 1,
      explanation: "Desarmes repetidos podem indicar sobrecarga, curto-circuito ou outra falha. Não force o religamento nem aumente a corrente nominal do disjuntor sem verificar o circuito."
    },
    {
      question: "Uma pessoa está em contato com uma instalação elétrica energizada. Qual deve ser a prioridade?",
      options: ["Puxar a pessoa diretamente pelos braços", "Jogar água para afastar a eletricidade", "Tocar na pessoa usando um objeto metálico", "Não tocar na vítima enquanto houver contato elétrico, acionar a emergência e interromper a energia somente se for seguro"],
      correct: 3,
      explanation: "O contato direto pode transformar quem tenta ajudar em outra vítima. Não toque na pessoa enquanto houver contato elétrico; acione a emergência e corte a alimentação apenas se isso puder ser feito sem se expor ao risco."
    }
  ];

  let current = 0;
  let score = 0;
  let answered = false;

  function renderQuestion() {
    answered = false;
    result.innerHTML = "";
    const q = questions[current];
    progressText.textContent = `Pergunta ${current + 1} de ${questions.length}`;
    progressBar.style.width = `${((current + 1) / questions.length) * 100}%`;
    area.innerHTML = `
      <section class="quiz-question-card">
        <h3>${current + 1}. ${q.question}</h3>
        <div class="quiz-options">
          ${q.options.map((option, index) => `
            <label class="quiz-option" data-option="${index}">
              <input type="radio" name="currentQuizAnswer" value="${index}">
              <span><strong>${String.fromCharCode(65 + index)}.</strong> ${option}</span>
            </label>`).join("")}
        </div>
        <div id="quizImmediateFeedback"></div>
        <div class="quiz-actions">
          <button id="quizConfirm" class="button button-primary" type="button" disabled>Confirmar resposta</button>
        </div>
      </section>`;

    const confirm = document.getElementById("quizConfirm");
    area.querySelectorAll('input[name="currentQuizAnswer"]').forEach(input => {
      input.addEventListener("change", () => { if (!answered) confirm.disabled = false; });
    });
    confirm.addEventListener("click", () => {
      if (answered) {
        if (current < questions.length - 1) { current++; renderQuestion(); }
        else renderThankYou();
        return;
      }
      const selected = area.querySelector('input[name="currentQuizAnswer"]:checked');
      if (!selected) return;
      answered = true;
      const selectedIndex = Number(selected.value);
      const correct = selectedIndex === q.correct;
      if (correct) score++;

      area.querySelectorAll(".quiz-option").forEach((label, index) => {
        label.querySelector("input").disabled = true;
        if (index === q.correct) label.classList.add("correct");
        else if (index === selectedIndex) label.classList.add("incorrect");
      });
      const feedback = document.getElementById("quizImmediateFeedback");
      feedback.className = `quiz-feedback-live ${correct ? "good" : "try-again"}`;
      feedback.innerHTML = `<strong>${correct ? "Resposta correta!" : "Resposta incorreta."}</strong><p>${q.explanation}</p>`;
      confirm.disabled = false;
      confirm.textContent = current < questions.length - 1 ? "Próxima pergunta" : "Concluir quiz";
    });
  }

  function renderThankYou() {
    progressText.textContent = "Quiz concluído";
    progressBar.style.width = "100%";
    area.innerHTML = `
      <section class="quiz-question-card quiz-result-summary">
        <h3>Obrigado por participar!</h3>
        <p>Agradecemos por dedicar seu tempo ao Energia Consciente. Esperamos que o quiz tenha ajudado a reforçar seus conhecimentos sobre consumo de energia e segurança elétrica.</p>
        <strong>Seu resultado: ${score} de ${questions.length} acertos</strong>
        <p>${score === questions.length ? "Parabéns pelo excelente resultado!" : "Continue aprendendo e colocando em prática os cuidados com a eletricidade."}</p>
        <button id="quizRestart" class="button button-primary" type="button">Refazer quiz</button>
      </section>`;
    result.innerHTML = "";
    document.getElementById("quizRestart").addEventListener("click", () => {
      current = 0; score = 0; renderQuestion();
    });
  }

  renderQuestion();
})();

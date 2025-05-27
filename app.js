let base = "KRW";
const apiKey = '5jmg1He4kEXqQVqG0m0CIDSOEm7rVHuO'; 

// 환산
async function convert() {
  const amount = document.getElementById('amount').value;
  const target = document.getElementById('currency').value;
  const result = document.getElementById('result');

  if (!amount) {
    result.textContent = "금액을 입력해주세요.";
    return;
  }

  if (base === target) {
    result.textContent = "같은 통화끼리는 환산할 수 없습니다.";
    return;
  }

  try {
    const res = await fetch(`https://api.apilayer.com/exchangerates_data/convert?from=${base}&to=${target}&amount=${amount}`, {
      headers: { apikey: apiKey }
    });

    const data = await res.json();
    result.textContent = `${amount} ${base} = ${data.result.toFixed(2)} ${target}`;
  } catch (error) {
    result.textContent = "환산 중 오류가 발생했습니다.";
  }
}

// 실시간 환율
async function showRate() {
  const target = document.getElementById('currency').value;
  const rateBox = document.getElementById('rate');

  if (base === target) {
    rateBox.textContent = "같은 통화끼리는 환율이 1입니다.";
    return;
  }

  try {
    const res = await fetch(`https://api.apilayer.com/exchangerates_data/latest?base=${base}&symbols=${target}`, {
      headers: { apikey: apiKey }
    });

    const data = await res.json();
    const rate = data.rates[target];
    rateBox.textContent = `현재 환율: 1 ${base} = ${rate.toFixed(5)} ${target}`;
  } catch (error) {
    rateBox.textContent = "환율 정보를 불러올 수 없습니다.";
  }
}

// 날짜 기준 환율 조회
async function showRateByDate() {
  const date = document.getElementById('datePicker').value;
  const target = document.getElementById('currency').value;
  const rateBox = document.getElementById('rate');

  if (!date || base === target) {
    return;
  }

  try {
    const res = await fetch(`https://api.apilayer.com/exchangerates_data/${date}?base=${base}&symbols=${target}`, {
      headers: { apikey: apiKey }
    });

    const data = await res.json();
    const rate = data.rates[target];
    rateBox.textContent = `${date} 기준 환율: 1 ${base} = ${rate.toFixed(5)} ${target}`;
  } catch (error) {
    rateBox.textContent = "날짜 기준 환율을 불러올 수 없습니다.";
  }
}

// 환율 반전
function reverse() {
  const currencySelect = document.getElementById('currency');
  const currentTarget = currencySelect.value;

  currencySelect.value = base;
  base = currentTarget;

  document.getElementById('amount').placeholder = `금액 (${base})`;
  showRate();
  loadChart();
}

// 환율 그래프
let chart = null;

async function loadChart() {
  const target = document.getElementById('currency').value;
  const today = new Date();
  const dates = [];
  const rates = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push(dateStr);

    const res = await fetch(`https://api.apilayer.com/exchangerates_data/${dateStr}?base=${base}&symbols=${target}`, {
      headers: { apikey: apiKey }
    });
    const data = await res.json();
    rates.push(data.rates[target]);
  }

  const ctx = document.getElementById('rateChart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `1 ${base} → ${target} 환율`,
        data: rates,
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// 초기 로딩
window.onload = () => {
  showRate();
  loadChart();
  document.getElementById('amount').placeholder = `금액 (${base})`;
};

const usernameInput = document.getElementById('usernameInput');
const searchBtn = document.getElementById('searchBtn');
const eventsTableBody = document.getElementById('eventsTableBody');
const eventCount = document.getElementById('eventCount');

const userInfo = document.getElementById('userInfo');
const avatar = document.getElementById('avatar');
const displayName = document.getElementById('displayName');
const profileUsername = document.getElementById('profileUsername');
const profileLink = document.getElementById('profileLink');

let eventTypeChart;
let eventDateChart;
let refreshTimer;

async function fetchUserProfile(username) {
  const response = await fetch(`https://api.github.com/users/${username}`);

  if (!response.ok) {
    throw new Error('Usuário não encontrado');
  }

  return response.json();
}

async function fetchGitHubEvents(username) {
  const url = `https://api.github.com/users/${username}/events/public?per_page=30`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao buscar eventos');
  }

  const pollInterval = response.headers.get('X-Poll-Interval') || 60;
  const events = await response.json();

  setupAutoRefresh(username, pollInterval);

  return events;
}

function setupAutoRefresh(username, interval) {
  clearInterval(refreshTimer);

  refreshTimer = setInterval(() => {
    loadDashboard(username);
  }, interval * 1000);
}

function groupByType(events) {
  const grouped = {};

  events.forEach(event => {
    grouped[event.type] = (grouped[event.type] || 0) + 1;
  });

  return grouped;
}

function groupByDate(events) {
  const grouped = {};

  events.forEach(event => {
    const date = new Date(event.created_at).toLocaleDateString('pt-BR');
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return grouped;
}

function renderCharts(events) {
  const typeData = groupByType(events);
  const dateData = groupByDate(events);

  const typeLabels = Object.keys(typeData);
  const typeValues = Object.values(typeData);

  const dateLabels = Object.keys(dateData);
  const dateValues = Object.values(dateData);

  if (eventTypeChart) eventTypeChart.destroy();
  if (eventDateChart) eventDateChart.destroy();

  eventTypeChart = new Chart(document.getElementById('eventTypeChart'), {
    type: 'doughnut',
    data: {
      labels: typeLabels,
      datasets: [{
        label: 'Eventos',
        data: typeValues
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#e2e8f0'
          }
        }
      }
    }
  });

  eventDateChart = new Chart(document.getElementById('eventDateChart'), {
    type: 'bar',
    data: {
      labels: dateLabels,
      datasets: [{
        label: 'Eventos por Dia',
        data: dateValues
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            color: '#e2e8f0'
          }
        },
        y: {
          ticks: {
            color: '#e2e8f0'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#e2e8f0'
          }
        }
      }
    }
  });
}

function getEventDetails(event) {
  switch (event.type) {
    case 'PushEvent':
      return `${event.payload.commits?.length || 0} commit(s) enviados`;

    case 'WatchEvent':
      return 'Favoritou um repositório';

    case 'ForkEvent':
      return 'Criou um fork';

    case 'IssuesEvent':
      return `${event.payload.action} uma issue`;

    case 'PullRequestEvent':
      return `${event.payload.action} um pull request`;

    case 'CreateEvent':
      return `Criou ${event.payload.ref_type}`;

    case 'DeleteEvent':
      return `Removeu ${event.payload.ref_type}`;

    default:
      return 'Sem detalhes adicionais';
  }
}

function renderTable(events) {
  eventsTableBody.innerHTML = '';
  eventCount.textContent = `${events.length} eventos encontrados`;

  if (events.length === 0) {
    eventsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-6 text-center text-slate-400">
          Nenhum evento encontrado.
        </td>
      </tr>
    `;
    return;
  }

  events.forEach(event => {
    const row = document.createElement('tr');

    row.className = 'border-b border-slate-800 hover:bg-slate-900/50';

    row.innerHTML = `
      <td class="py-3 px-2 font-medium">${event.type}</td>
      <td class="py-3 px-2">${event.repo?.name || '-'}</td>
      <td class="py-3 px-2">
        ${new Date(event.created_at).toLocaleString('pt-BR')}
      </td>
      <td class="py-3 px-2 text-slate-400">
        ${getEventDetails(event)}
      </td>
    `;

    eventsTableBody.appendChild(row);
  });
}

function renderUserProfile(user) {
  avatar.src = user.avatar_url;
  displayName.textContent = user.name || user.login;
  profileUsername.textContent = `@${user.login}`;
  profileLink.href = user.html_url;

  userInfo.classList.remove('hidden');
}

async function loadDashboard(username) {
  try {
    searchBtn.disabled = true;
    searchBtn.textContent = 'Carregando...';

    const [user, events] = await Promise.all([
      fetchUserProfile(username),
      fetchGitHubEvents(username)
    ]);

    renderUserProfile(user);
    renderCharts(events);
    renderTable(events);

  } catch (error) {
    alert(error.message);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Buscar Atividades';
  }
}

searchBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();

  if (!username) {
    alert('Digite um username válido');
    return;
  }

  loadDashboard(username);
});

usernameInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    searchBtn.click();
  }
});
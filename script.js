let currentUser = null;
let contributionData = null;


document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light');
    }
});

function toggleTheme() {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

async function searchUser() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) return;

    showLoading();
    hideError();

    try {
        const userResponse = await fetch(`https://api.github.com/users/${username}`);
        
        
        currentUser = await userResponse.json();
        
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        const repos = await reposResponse.json();
        
        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        
        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        
        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        

        generateMockContributions();
        
        updateProfile(currentUser, totalStars);
        updateStats(currentUser, totalStars);
        updateLanguages(sortedLanguages);
        updateRepositories(repos.slice(0, 10));
        updateActivity(repos.slice(0, 5));
        renderContributionGraph();
        
        showDashboard();
        
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

function generateMockContributions() {
    const weeks = 52;
    const days = 7;
    contributionData = [];
    
    for (let w = 0; w < weeks; w++) {
        const week = [];
        for (let d = 0; d < days; d++) {
            const date = new Date();
            date.setDate(date.getDate() - ((weeks - w) * 7 + (6 - d)));
            

            let count = 0;
            const rand = Math.random();
            if (rand > 0.6) count = Math.floor(Math.random() * 3) + 1;
            if (rand > 0.85) count = Math.floor(Math.random() * 6) + 3;
            if (rand > 0.95) count = Math.floor(Math.random() * 10) + 10;
            

            if (d === 0 || d === 6) count = Math.floor(count * 0.3);
            
            week.push({
                date: date.toISOString().split('T')[0],
                count: count
            });
        }
        contributionData.push(week);
    }
}

function getContributionLevel(count) {
    if (count === 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 10) return 3;
    return 4;
}

function getContributionColor(level) {
    const colors = {
        0: 'bg-github-green-0 border-github-border',
        1: 'bg-github-green-1',
        2: 'bg-github-green-2',
        3: 'bg-github-green-3',
        4: 'bg-github-green-4'
    };
    return colors[level] || colors[0];
}

function renderContributionGraph() {
    const container = document.getElementById('contributionGraph');
    container.innerHTML = '';
    
    let totalContribs = 0;
    
    contributionData.forEach((week, weekIndex) => {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'flex flex-col gap-1';
        
        week.forEach((day, dayIndex) => {
            totalContribs += day.count;
            const level = getContributionLevel(day.count);
            const cell = document.createElement('div');
            cell.className = `w-3 h-3 rounded-sm ${getContributionColor(level)} contribution-cell cursor-pointer border border-transparent hover:border-white/30`;
            cell.title = `${day.count} contribuições em ${day.date}`;
            

            cell.addEventListener('click', () => {
                window.open(`https://github.com/${currentUser.login}?tab=overview&from=${day.date}&to=${day.date}`, '_blank');
            });
            
            weekDiv.appendChild(cell);
        });
        
        container.appendChild(weekDiv);
    });
    
    document.getElementById('totalContributions').textContent = `${totalContribs.toLocaleString()} contribuições no último ano`;
}

function updateProfile(user, stars) {
    document.getElementById('avatar').src = user.avatar_url;
    document.getElementById('name').textContent = user.name || user.login;
    document.getElementById('username').textContent = `@${user.login}`;
    document.getElementById('username').href = user.html_url;
    document.getElementById('bio').textContent = user.bio || 'Sem bio disponível';
    

    const locationEl = document.getElementById('location');
    if (user.location) {
        locationEl.classList.remove('hidden');
        locationEl.querySelector('span').textContent = user.location;
    } else {
        locationEl.classList.add('hidden');
    }
    
    const companyEl = document.getElementById('company');
    if (user.company) {
        companyEl.classList.remove('hidden');
        companyEl.querySelector('span').textContent = user.company;
    } else {
        companyEl.classList.add('hidden');
    }
    
    const blogEl = document.getElementById('blog');
    if (user.blog) {
        blogEl.classList.remove('hidden');
        const blogLink = blogEl.querySelector('a');
        blogLink.textContent = user.blog.replace(/^https?:\/\//, '');
        blogLink.href = user.blog.startsWith('http') ? user.blog : `https://${user.blog}`;
    } else {
        blogEl.classList.add('hidden');
    }
    
    const date = new Date(user.created_at);
    document.getElementById('joined').querySelector('span').textContent = 
        `Entrou em ${date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
}

function updateStats(user, stars) {
    animateNumber('repoCount', user.public_repos);
    animateNumber('followersCount', user.followers);
    animateNumber('followingCount', user.following);
    animateNumber('starsCount', stars);
}

function animateNumber(id, target) {
    const element = document.getElementById(id);
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function updateLanguages(languages) {
    const container = document.getElementById('languagesList');
    container.innerHTML = '';
    
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'C++': '#f34b7d',
        'C': '#555555',
        'PHP': '#4F5D95',
        'Swift': '#ffac45',
        'Kotlin': '#A97BFF',
        'Vue': '#41b883'
    };
    
    const maxCount = languages[0]?.[1] || 1;
    
    languages.forEach(([lang, count]) => {
        const percentage = (count / maxCount) * 100;
        const color = colors[lang] || '#8b949e';
        
        const item = document.createElement('div');
        item.className = 'group cursor-pointer';
        item.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                    <span class="text-white font-medium">${lang}</span>
                </div>
                <span class="text-github-muted text-sm">${count} repos</span>
            </div>
            <div class="w-full bg-github-dark rounded-full h-2 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110" style="width: 0%; background-color: ${color}" data-width="${percentage}%">
                </div>
            </div>
        `;
        container.appendChild(item);
        
        setTimeout(() => {
            item.querySelector('[data-width]').style.width = `${percentage}%`;
        }, 100);
    });
    
    if (languages.length === 0) {
        container.innerHTML = '<p class="text-github-muted text-center py-4">Nenhuma linguagem encontrada</p>';
    }
}

function updateRepositories(repos) {
    const container = document.getElementById('reposList');
    container.innerHTML = '';
    
    repos.forEach((repo, index) => {
        const item = document.createElement('div');
        item.className = 'p-4 bg-github-dark/50 rounded-xl border border-github-border hover:border-github-green-3/50 transition-all group cursor-pointer';
        item.style.animationDelay = `${index * 0.05}s`;
        item.innerHTML = `
            <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-1">${repo.name}</h4>
                <span class="text-xs text-github-muted border border-github-border rounded-full px-2 py-0.5">${repo.visibility}</span>
            </div>
            <p class="text-sm text-github-muted line-clamp-2 mb-3 h-10">${repo.description || 'Sem descrição'}</p>
            <div class="flex items-center gap-4 text-xs text-github-muted">
                ${repo.language ? `
                    <span class="flex items-center gap-1">
                        <div class="w-2 h-2 rounded-full bg-github-green-4"></div>
                        ${repo.language}
                    </span>
                ` : ''}
                <span class="flex items-center gap-1">
                    <i class="fas fa-star text-yellow-500"></i>
                    ${repo.stargazers_count}
                </span>
                <span class="flex items-center gap-1">
                    <i class="fas fa-code-branch"></i>
                    ${repo.forks_count}
                </span>
                <span class="ml-auto">${formatDate(repo.updated_at)}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            window.open(repo.html_url, '_blank');
        });
        
        container.appendChild(item);
    });
}

function updateActivity(repos) {
    const container = document.getElementById('activityList');
    container.innerHTML = '';
    
    const activities = [
        { icon: 'fa-plus', color: 'text-green-400', bg: 'bg-green-400/10', text: 'criou um novo repositório' },
        { icon: 'fa-code-branch', color: 'text-blue-400', bg: 'bg-blue-400/10', text: 'fez push para' },
        { icon: 'fa-star', color: 'text-yellow-400', bg: 'bg-yellow-400/10', text: 'recebeu uma estrela em' },
        { icon: 'fa-exclamation-circle', color: 'text-red-400', bg: 'bg-red-400/10', text: 'abriu uma issue em' },
        { icon: 'fa-check-circle', color: 'text-purple-400', bg: 'bg-purple-400/10', text: 'fez merge de PR em' }
    ];
    
    repos.forEach((repo, index) => {
        const activity = activities[index % activities.length];
        const item = document.createElement('div');
        item.className = 'flex items-center gap-4 p-4 bg-github-dark/30 rounded-xl border border-github-border/50 hover:bg-github-dark/50 transition-colors';
        item.innerHTML = `
            <div class="w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center flex-shrink-0">
                <i class="fas ${activity.icon} ${activity.color}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-white">
                    <span class="font-semibold">${currentUser?.login || 'User'}</span> 
                    ${activity.text} 
                    <span class="text-blue-400 hover:underline cursor-pointer" onclick="window.open('${repo.html_url}', '_blank')">${repo.name}</span>
                </p>
                <p class="text-xs text-github-muted mt-1">${formatDate(repo.updated_at)}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showDashboard() {
    hideLoading();
    document.getElementById('dashboardContent').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}

document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.glass-panel');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
});

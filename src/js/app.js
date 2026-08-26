import { RESOURCES_DATA, MONTHS, DEPARTMENTS } from '../data/resources.js';

class RecursosApp {
  constructor() {
    this.currentMonth = 'all';
    this.selectedTag = 'all';
    this.searchQuery = '';
    this.theme = localStorage.getItem('theme') || 'light';

    this.initElements();
    this.applyTheme();
    this.bindEvents();
    this.renderMonthTabs();
    this.renderDepartmentChips();
    this.renderContent();
  }

  initElements() {
    this.monthTabsContainer = document.getElementById('monthTabs');
    this.deptFilterContainer = document.getElementById('deptFilters');
    this.cardsContainer = document.getElementById('cardsContainer');
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.statsCount = document.getElementById('statsCount');
    this.toastContainer = document.getElementById('toastContainer');
    this.modalBackdrop = document.getElementById('modalBackdrop');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    this.modalCloseBtn = document.getElementById('modalCloseBtn');
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    if (this.themeToggleBtn) {
      this.themeToggleBtn.innerHTML = this.theme === 'dark' 
        ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Claro` 
        : `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Oscuro`;
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  bindEvents() {
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (this.searchQuery.length > 0) {
          this.clearSearchBtn.classList.add('show');
        } else {
          this.clearSearchBtn.classList.remove('show');
        }
        this.renderContent();
      });
    }

    if (this.clearSearchBtn) {
      this.clearSearchBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.clearSearchBtn.classList.remove('show');
        this.renderContent();
      });
    }

    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    }

    if (this.modalBackdrop) {
      this.modalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.modalBackdrop) this.closeModal();
      });
    }
  }

  renderMonthTabs() {
    if (!this.monthTabsContainer) return;
    this.monthTabsContainer.innerHTML = MONTHS.map(month => `
      <div class="month-tab ${month.id === this.currentMonth ? 'active' : ''}" data-month="${month.id}">
        ${month.label}
      </div>
    `).join('');

    this.monthTabsContainer.querySelectorAll('.month-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.currentMonth = tab.dataset.month;
        this.monthTabsContainer.querySelectorAll('.month-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderContent();
      });
    });
  }

  renderDepartmentChips() {
    if (!this.deptFilterContainer) return;
    const deptKeys = Object.keys(DEPARTMENTS);
    this.deptFilterContainer.innerHTML = `
      <div class="dept-chip ${this.selectedTag === 'all' ? 'active' : ''}" data-tag="all">
        Todas las Áreas
      </div>
      ${deptKeys.map(key => `
        <div class="dept-chip ${this.selectedTag === key ? 'active' : ''}" data-tag="${key}">
          ${key} &middot; ${DEPARTMENTS[key].name}
        </div>
      `).join('')}
    `;

    this.deptFilterContainer.querySelectorAll('.dept-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.selectedTag = chip.dataset.tag;
        this.deptFilterContainer.querySelectorAll('.dept-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.renderContent();
      });
    });
  }

  filterResources() {
    return RESOURCES_DATA.filter(item => {
      // Month Filter
      const matchMonth = (this.currentMonth === 'all' || item.month === this.currentMonth);

      // Tag Filter
      const matchTag = (this.selectedTag === 'all' || item.tags.includes(this.selectedTag));

      // Search Query Filter
      const matchQuery = !this.searchQuery || 
        item.title.toLowerCase().includes(this.searchQuery) ||
        item.dateText.toLowerCase().includes(this.searchQuery) ||
        item.monthLabel.toLowerCase().includes(this.searchQuery) ||
        (item.description && item.description.toLowerCase().includes(this.searchQuery)) ||
        item.tags.some(t => t.toLowerCase().includes(this.searchQuery));

      return matchMonth && matchTag && matchQuery;
    });
  }

  renderContent() {
    const filtered = this.filterResources();

    if (this.statsCount) {
      const availableCount = filtered.filter(f => f.isAvailable).length;
      this.statsCount.innerHTML = `Mostrando <span>${filtered.length}</span> actividades (<span>${availableCount}</span> disponibles)`;
    }

    if (filtered.length === 0) {
      this.cardsContainer.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <h3>No se encontraron recursos</h3>
          <p>Intenta ajustar la búsqueda o seleccionar otro mes o etiqueta.</p>
        </div>
      `;
      return;
    }

    // Group items by Month if 'all' is selected, or display month heading
    if (this.currentMonth === 'all' && !this.searchQuery && this.selectedTag === 'all') {
      const activeMonths = MONTHS.filter(m => m.id !== 'all');
      this.cardsContainer.innerHTML = activeMonths.map(m => {
        const monthItems = filtered.filter(item => item.month === m.id);
        if (monthItems.length === 0) return '';
        return `
          <div class="month-section">
            <div class="month-heading">
              <h2>${m.label}</h2>
              <span>${m.subtitle}</span>
            </div>
            <div class="cards-container">
              ${monthItems.map(item => this.createCardHTML(item)).join('')}
            </div>
          </div>
        `;
      }).join('');
    } else {
      let headingText = '';
      if (this.currentMonth !== 'all') {
        const monthObj = MONTHS.find(m => m.id === this.currentMonth);
        if (monthObj) {
          headingText = `
            <div class="month-heading">
              <h2>${monthObj.label}</h2>
              <span>${monthObj.subtitle}</span>
            </div>
          `;
        }
      }

      this.cardsContainer.innerHTML = `
        ${headingText}
        <div class="cards-container">
          ${filtered.map(item => this.createCardHTML(item)).join('')}
        </div>
      `;
    }

    this.bindCardActions();
  }

  createCardHTML(item) {
    const downloadIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>`;
    const linkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    const infoIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

    return `
      <div class="card" data-id="${item.id}">
        <div class="card-badge" style="background: ${item.badgeColor};">
          ${item.id}
        </div>
        <div class="card-content">
          <div class="card-header-row">
            <span class="date-pill" style="background: ${item.badgeColor}18; color: ${item.badgeColor === '#1C1C1C' ? 'var(--text-main)' : item.badgeColor};">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${item.dateText}
            </span>
            <span class="availability-indicator ${item.isAvailable ? 'available' : 'unavailable'}">
              <span class="status-dot"></span>
              ${item.isAvailable ? 'Disponible' : 'Próximamente'}
            </span>
          </div>

          <h3 class="card-title">${item.title}</h3>

          <div class="card-tags">
            ${item.tags.map(tag => `
              <span class="tag-badge" data-tag-click="${tag}">
                ${tag} &middot; ${DEPARTMENTS[tag] ? DEPARTMENTS[tag].name : tag}
              </span>
            `).join('')}
          </div>

          <div class="card-actions">
            ${item.isAvailable ? `
              <a href="${item.url}" target="_blank" class="resource-btn" rel="noopener noreferrer">
                ${downloadIcon}
                ${item.buttonText}
              </a>
              <button type="button" class="secondary-action-btn copy-link-btn" data-url="${item.url}" title="Copiar Enlace Directo">
                ${linkIcon}
              </button>
            ` : `
              <span class="resource-btn disabled">
                ${downloadIcon}
                Próximamente
              </span>
            `}
            <button type="button" class="secondary-action-btn info-btn" data-info-id="${item.id}" title="Ver Detalles">
              ${infoIcon}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindCardActions() {
    // Copy link buttons
    this.cardsContainer.querySelectorAll('.copy-link-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = btn.dataset.url;
        if (url && url !== '#') {
          navigator.clipboard.writeText(url).then(() => {
            this.showToast('¡Enlace copiado al portapapeles!');
          }).catch(() => {
            this.showToast('No se pudo copiar el enlace.');
          });
        }
      });
    });

    // Info modal buttons
    this.cardsContainer.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.infoId);
        const resource = RESOURCES_DATA.find(r => r.id === id);
        if (resource) this.openModal(resource);
      });
    });

    // Tag click filters
    this.cardsContainer.querySelectorAll('.tag-badge').forEach(tagEl => {
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = tagEl.dataset.tagClick;
        if (tag) {
          this.selectedTag = tag;
          this.renderDepartmentChips();
          this.renderContent();
        }
      });
    });
  }

  openModal(item) {
    if (!this.modalBackdrop) return;

    const deptList = item.tags.map(t => `${t} (${DEPARTMENTS[t] ? DEPARTMENTS[t].name : t})`).join(', ');

    this.modalTitle.textContent = `Actividad #${item.id}: ${item.title}`;
    this.modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <p><strong>Fecha / Período:</strong> ${item.dateText} (${item.monthLabel})</p>
        <p><strong>Departamentos involucrados:</strong> ${deptList}</p>
        <p><strong>Categoría:</strong> ${item.type || 'Recurso Evangelístico'}</p>
        <p><strong>Descripción:</strong> ${item.description || 'Actividad oficial de la Ruta Misionera AACH 4T 2026.'}</p>
        
        <div style="margin-top: 16px; display: flex; gap: 10px;">
          ${item.isAvailable ? `
            <a href="${item.url}" target="_blank" class="resource-btn" style="flex: 1; justify-content: center;">
              Abrir o Descargar Recurso
            </a>
          ` : `
            <span class="resource-btn disabled" style="flex: 1; justify-content: center;">Recurso Próximamente</span>
          `}
        </div>
      </div>
    `;

    this.modalBackdrop.classList.add('active');
  }

  closeModal() {
    if (this.modalBackdrop) {
      this.modalBackdrop.classList.remove('active');
    }
  }

  showToast(message) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ${message}
    `;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new RecursosApp();
});

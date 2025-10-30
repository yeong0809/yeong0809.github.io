document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('data/resume.json', {cache: "no-store"});
    if (!res.ok) throw new Error('Failed to load resume.json: ' + res.status);
    const data = await res.json();
    renderResume(data);
  } catch (err) {
    console.error(err);
    // Keep the existing static content if fetching fails.
  }
});

function renderResume(data) {
  // Header: name and title
  const nameHeader = document.querySelector('.name_header');
  if (nameHeader) {
    nameHeader.innerHTML = `<h1>${escapeHtml(data.name)}</h1><p class="subtitle">${escapeHtml(data.title)}</p>`;
  }

  // Vitals / Contacts
  const vitals = document.querySelector('.vitals_header');
  if (vitals && data.contacts) {
    const phoneDisplay = data.contacts.phone_display || data.contacts.phone || '';
    const githubDisplay = data.contacts.github_display || data.contacts.github || '';
    const linkedinDisplay = data.contacts.linkedin_display || data.contacts.linkedin || '';

    vitals.innerHTML = `
      <ul class="contacts">
        <li class="contact_item contact_phone">
          <a href="tel:${encodeURI(data.contacts.phone || '')}">
            <img src="assets/phone.svg" class="contact_icon" alt="Phone">
            <span class="text">${escapeHtml(phoneDisplay)}</span>
          </a>
        </li>

        <li class="contact_item contact_email">
          <a href="mailto:${encodeURI(data.contacts.email || '')}">
            <img src="assets/email.svg" class="contact_icon" alt="Email">
            <span class="text">${escapeHtml(data.contacts.email || '')}</span>
          </a>
        </li>
      </ul>

      <ul class="contacts">
        <li class="contact_item contact_github">
          <a href="${escapeAttr(data.contacts.github || '#')}" target="_blank" rel="noopener">
            <img src="assets/github.svg" class="contact_icon" alt="GitHub">
            <span class="text">${escapeHtml(githubDisplay)}</span>
          </a>
        </li>

        <li class="contact_item contact_linkedin">
          <a href="${escapeAttr(data.contacts.linkedin || '#')}" target="_blank" rel="noopener">
            <img src="assets/linkedin.svg" class="contact_icon" alt="LinkedIn">
            <span class="text">${escapeHtml(linkedinDisplay)}</span>
          </a>
        </li>
      </ul>
    `;
  }

  // Objective
  const objective = document.querySelector('.objective');
  if (objective) {
    objective.innerHTML = `<h2 class="section_header">Objective</h2><p>${escapeHtml(data.objective || '')}</p>`;
  }

  // Skills
  const skills = document.querySelector('.skills');
  if (skills && data.skills) {
    const techText = (data.skills.technical || []).map(escapeHtml).join(', ');
    const cloudText = (data.skills.cloud_tools_testing || []).map(escapeHtml).join(', ');
    skills.innerHTML = `
      <h2 class="section_header">Skills</h2>
      <p class="header">Technical</p>
      <p class="skill_list">${techText}</p>
      <p class="header">Cloud, Tools & Testing</p>
      <p class="skill_list">${cloudText}</p>
    `;
  }

  // Experience
  const exp = document.querySelector('.experience');
  if (exp && Array.isArray(data.experience)) {
    let html = `<h2 class="section_header">Experience</h2>`;
    data.experience.forEach(role => {
      const location = role.location ? `, ${escapeHtml(role.location)}` : '';
      const period = `${escapeHtml(role.start || '')}${role.end ? ' - ' + escapeHtml(role.end) : ''}`;
      const responsibilities = renderListItems(role.responsibilities || []);
      const techStack = (role.tech_stack || []).map(escapeHtml).join(', ');

      html += `
        <article class="role" tabindex="0" role="group" aria-label="${escapeHtml(role.title)} - ${escapeHtml(role.company)}">
          <h3 class="header">${escapeHtml(role.title)} - ${escapeHtml(role.company)}${location}</h3>
          <p class="subheader">${period}</p>
          <ul>${responsibilities}</ul>
          <p class="header">Tech Stack: ${techStack}</p>
        </article>
      `;
    });
    exp.innerHTML = html;
  }

  // Projects
  const projects = document.querySelector('.projects');
  if (projects && Array.isArray(data.projects)) {
    let html = `<h2 class="section_header">Projects</h2>`;
    data.projects.forEach(p => {
      const highlights = renderListItems(p.highlights || []);
      html += `<article tabindex="0"><h4 class="header">${escapeHtml(p.title)}</h4><ul>${highlights}</ul></article>`;
    });
    projects.innerHTML = html;
  }

  // Education
  const education = document.querySelector('.education');
  if (education && data.education) {
    let html = `<h2 class="section_header">Education</h2>`;
    if (Array.isArray(data.education)) {
      data.education.forEach(ed => {
        html += `<p class="header">${escapeHtml(ed.institution || '')}${ed.level ? ' - ' + escapeHtml(ed.level) : ''}</p>`;
      });
    } else {
      html += `<p class="header">${escapeHtml(data.education.institution || '')}${data.education.level ? ' - ' + escapeHtml(data.education.level) : ''}</p>`;
    }
    education.innerHTML = html;
  }

  // Footer meta
  const footerP = document.querySelector('.site_footer p');
  if (footerP && data.meta) {
    footerP.textContent = `${data.meta.source || ''} · Last updated: ${data.meta.lastUpdated || ''}`;
  }
}

 // Small helpers to avoid XSS and malformed attributes

 // Render list items (supports nested lists). Returns string of <li>... elements,
 // where each item can be either a string or an object: { text: "...", subpoints: [...] } or { text: "...", points: [...] }.
function renderListItems(items) {
  if (!Array.isArray(items)) return '';
  return items.map(item => {
    if (typeof item === 'string') {
      return `<li>${escapeHtml(item)}</li>`;
    }
    if (item && typeof item === 'object') {
      const text = escapeHtml(item.text || '');
      // support both `subpoints` (legacy) and `points` (preferred)
      const children = Array.isArray(item.subpoints) ? item.subpoints : Array.isArray(item.points) ? item.points : null;
      const sub = Array.isArray(children) ? renderList(children) : '';
      return `<li>${text}${sub}</li>`;
    }
    return '';
  }).join('');
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return `<ul>${renderListItems(items)}</ul>`;
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  if (!str && str !== 0) return '#';
  return String(str).replace(/"/g, '%22').replace(/'/g, '%27');
}

/* Keyboard navigation removed — snapping behavior disabled per user request.
   If you want simple keyboard scrolling later, we can implement a lighter handler
   that does not force snap-to-section or snap-to-card behavior.
*/

function setAppHeight() {
  // Set a CSS variable --app-height to the current viewport innerHeight (useful on mobile where 100vh is inconsistent)
  const h = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${h}px`);
}


  // Initialize on DOM ready and wire up listeners to keep the value updated
document.addEventListener('DOMContentLoaded', () => {
  setAppHeight();
});

// Update on resize / orientation changes
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

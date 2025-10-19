const heroCard = document.getElementById('hero-card');
const demoContainer = document.getElementById('demo-profiles');
const loadingState = document.getElementById('demo-loading');
const catalogueSection = document.getElementById('catalogue');
const catalogueCover = document.getElementById('catalogue-cover');
const catalogueTitle = document.getElementById('catalogue-title');
const catalogueDescription = document.getElementById('catalogue-description');
const catalogueMeta = document.getElementById('catalogue-meta');
const catalogueTags = document.getElementById('catalogue-tags');
const catalogueTracklist = document.getElementById('catalogue-tracklist');
const trackSearchButton = document.getElementById('catalogue-search-button');
const trackModal = document.getElementById('track-modal');
const trackSearchInput = document.getElementById('track-search-input');
const trackResultsContainer = document.getElementById('track-search-results');
const modalCloseElements = document.querySelectorAll('[data-close-modal]');

let trackSearchTimeout;
let trackSearchRequestId = 0;

const formatReleaseDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const renderHeroProfile = (profile) => {
  if (!profile || !heroCard) return;
  heroCard.innerHTML = `
    <div class="hero-card__header">
      <img class="hero-card__avatar" src="${profile.image}" alt="${profile.name}" />
      <div>
        <h3 class="hero-card__name">${profile.name}</h3>
        <p class="hero-card__meta">${profile.age} • ${profile.location}</p>
        <span class="hero-card__pill">${profile.compatibility}% compatibility</span>
      </div>
    </div>
    <p class="hero-card__bio">${profile.bio}</p>
  `;
};

const renderProfileCard = (profile) => {
  const [firstPrompt] = profile.prompts ?? [];
  return `
    <article class="demo-card">
      <div class="demo-card__header">
        <img class="demo-card__avatar" src="${profile.image}" alt="${profile.name}" />
        <div>
          <h3 class="demo-card__name">${profile.name}</h3>
          <p class="demo-card__meta">${profile.age} • ${profile.location}</p>
          <p class="demo-card__meta">Vibe: ${profile.vibe}</p>
        </div>
      </div>
      <div class="demo-card__prompt">
        <h4>${firstPrompt?.question ?? 'Signature prompt'}</h4>
        <p>${firstPrompt?.answer ?? 'A thoughtful spark awaits inside the mobile app.'}</p>
      </div>
      <p class="demo-card__insight">${profile.compatibilityWhy}</p>
    </article>
  `;
};

const renderCatalogueTrack = (track, index) => {
  const durationMeta = track.duration ? ` • ${track.duration}` : '';
  return `
    <li class="catalogue__track">
      <span class="catalogue__track-index">${String(index + 1).padStart(2, '0')}</span>
      <div class="catalogue__track-copy">
        <p class="catalogue__track-title">${track.title}</p>
        <p class="catalogue__track-meta">${track.artist}${durationMeta}</p>
      </div>
      ${track.spotlight ? '<span class="catalogue__track-badge">New</span>' : ''}
    </li>
  `;
};

const renderTrackTag = (tag) => `<span class="modal-track__tag">${tag}</span>`;

const renderTrackResult = (track) => {
  const durationMeta = track.duration ? ` • ${track.duration}` : '';
  const moodMeta = track.mood ? ` • ${track.mood}` : '';
  const tagsMarkup = Array.isArray(track.tags) && track.tags.length > 0
    ? `<div class="modal-track__tags">${track.tags.map(renderTrackTag).join('')}</div>`
    : '';

  return `
    <article class="modal-track">
      <div class="modal-track__header">
        <h4 class="modal-track__title">${track.title}</h4>
        ${track.spotlight ? '<span class="modal-track__badge">New</span>' : ''}
      </div>
      <p class="modal-track__meta">${track.artist}${durationMeta}${moodMeta}</p>
      ${tagsMarkup}
      <div class="modal-track__actions">
        <a class="modal-track__link" href="${track.url}" target="_blank" rel="noopener">Listen</a>
      </div>
    </article>
  `;
};

const populateCatalogue = (album) => {
  if (!catalogueSection) return;

  if (!album) {
    catalogueSection.hidden = true;
    return;
  }

  catalogueSection.hidden = false;

  if (catalogueCover && album.coverArt) {
    catalogueCover.src = album.coverArt;
    catalogueCover.alt = `${album.title ?? 'Omoluabi catalogue'} cover art`;
  }

  if (catalogueTitle) {
    catalogueTitle.textContent = album.title ?? 'Omoluabi Catalogue Album';
  }

  if (catalogueDescription) {
    catalogueDescription.textContent = album.description ?? '';
    catalogueDescription.style.display = album.description ? '' : 'none';
  }

  if (catalogueMeta) {
    const releaseDate = formatReleaseDate(album.releaseDate);
    const metaParts = [
      album.curator ? `Curated by ${album.curator}` : '',
      releaseDate ? `Released ${releaseDate}` : '',
    ].filter(Boolean);
    catalogueMeta.textContent = metaParts.join(' • ');
    catalogueMeta.style.display = metaParts.length ? '' : 'none';
  }

  if (catalogueTags) {
    if (Array.isArray(album.tags) && album.tags.length > 0) {
      catalogueTags.innerHTML = album.tags.map((tag) => `<span class="catalogue__tag">${tag}</span>`).join('');
      catalogueTags.style.display = '';
    } else {
      catalogueTags.innerHTML = '';
      catalogueTags.style.display = 'none';
    }
  }

  if (catalogueTracklist) {
    const tracks = Array.isArray(album.tracks) ? album.tracks : [];
    if (tracks.length === 0) {
      catalogueTracklist.innerHTML =
        '<li class="catalogue__track-message">More tracks are being mastered. Check back soon.</li>';
    } else {
      catalogueTracklist.innerHTML = tracks.map((track, index) => renderCatalogueTrack(track, index)).join('');
    }
  }

  if (trackSearchInput && Array.isArray(album.tags) && album.tags.length > 0) {
    const [firstTag] = album.tags;
    const firstTrack = album.tracks?.[0]?.title?.split(' ')?.[0];
    const examples = [firstTag, firstTrack].filter(Boolean).slice(0, 2);
    if (examples.length > 0) {
      trackSearchInput.placeholder = `Try “${examples.join('” or “')}”`;
    }
  }
};

const setTrackSearchIntro = () => {
  if (!trackResultsContainer) return;
  trackResultsContainer.innerHTML =
    '<p class="modal__status">Type a vibe or tap search to explore the Omoluabi soundtrack.</p>';
};

const handleEscapeKey = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeTrackModal();
  }
};

const openTrackModal = () => {
  if (!trackModal) return;
  trackModal.classList.add('modal--open');
  trackModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (trackSearchInput) {
    trackSearchInput.focus();
    trackSearchInput.select();
  }
  executeTrackSearch(trackSearchInput?.value ?? '');
  document.addEventListener('keydown', handleEscapeKey);
};

const closeTrackModal = () => {
  if (!trackModal) return;
  trackModal.classList.remove('modal--open');
  trackModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', handleEscapeKey);
};

const executeTrackSearch = (query) => {
  if (!trackResultsContainer) return;

  const normalized = query.trim();
  const requestId = ++trackSearchRequestId;

  trackResultsContainer.innerHTML = '<p class="modal__status">Searching tracks…</p>';

  fetch(`/api/tracks/search?q=${encodeURIComponent(normalized)}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to search tracks');
      }
      return response.json();
    })
    .then((data) => {
      if (requestId !== trackSearchRequestId) return;
      const tracks = data?.tracks ?? [];
      if (tracks.length === 0) {
        trackResultsContainer.innerHTML =
          '<p class="modal__status">No tracks matched that vibe. Try another keyword.</p>';
        return;
      }
      trackResultsContainer.innerHTML = tracks.map((track) => renderTrackResult(track)).join('');
    })
    .catch((error) => {
      console.error(error);
      if (requestId !== trackSearchRequestId) return;
      trackResultsContainer.innerHTML =
        '<p class="modal__status modal__status--error">We couldn’t load tracks right now. Please try again shortly.</p>';
    });
};

const scheduleTrackSearch = (query) => {
  clearTimeout(trackSearchTimeout);
  trackSearchTimeout = setTimeout(() => executeTrackSearch(query), 220);
};

if (trackSearchButton) {
  trackSearchButton.addEventListener('click', () => {
    openTrackModal();
  });
}

modalCloseElements.forEach((element) => {
  element.addEventListener('click', () => {
    closeTrackModal();
  });
});

if (trackModal) {
  trackModal.addEventListener('click', (event) => {
    if (event.target === trackModal) {
      closeTrackModal();
    }
  });
}

if (trackSearchInput) {
  trackSearchInput.addEventListener('input', (event) => {
    scheduleTrackSearch(event.target.value ?? '');
  });

  trackSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      executeTrackSearch(event.target.value ?? '');
    }
  });
}

setTrackSearchIntro();

async function bootstrap() {
  try {
    const [profilesResponse, albumResponse] = await Promise.all([
      fetch('/api/profiles'),
      fetch('/api/catalogue'),
    ]);

    if (!profilesResponse.ok) {
      throw new Error('Failed to load profiles');
    }

    const profilesPayload = await profilesResponse.json();
    const albumPayload = albumResponse.ok ? await albumResponse.json() : { album: null };
    const profiles = profilesPayload?.profiles ?? [];

    if (profiles.length > 0) {
      renderHeroProfile(profiles[1]);
      const cards = profiles
        .filter((profile) => profile.id !== 'user-1')
        .slice(0, 3)
        .map(renderProfileCard)
        .join('');
      if (demoContainer) {
        demoContainer.innerHTML = cards;
      }
    } else if (demoContainer) {
      demoContainer.innerHTML = '<p class="demo__loading">No profiles available just yet.</p>';
    }

    populateCatalogue(albumPayload?.album ?? null);
  } catch (error) {
    console.error(error);
    if (demoContainer) {
      demoContainer.innerHTML = `
        <div class="demo__loading">
          We hit a snag loading the demo content. Confirm the API server is running and refresh the page.
        </div>
      `;
    }
    populateCatalogue(null);
  } finally {
    loadingState?.remove();
  }
}

bootstrap();

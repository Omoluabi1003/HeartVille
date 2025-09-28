const heroCard = document.getElementById('hero-card');
const demoContainer = document.getElementById('demo-profiles');
const loadingState = document.getElementById('demo-loading');

const renderHeroProfile = (profile) => {
  if (!profile) return;
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

async function bootstrap() {
  try {
    const response = await fetch('/api/profiles');
    if (!response.ok) {
      throw new Error('Failed to load profiles');
    }
    const data = await response.json();
    const profiles = data?.profiles ?? [];

    if (profiles.length > 0) {
      renderHeroProfile(profiles[1]);
      const cards = profiles
        .filter((profile) => profile.id !== 'user-1')
        .slice(0, 3)
        .map(renderProfileCard)
        .join('');
      demoContainer.innerHTML = cards;
    } else {
      demoContainer.innerHTML = '<p class="demo__loading">No profiles available just yet.</p>';
    }
  } catch (error) {
    console.error(error);
    demoContainer.innerHTML = `
      <div class="demo__loading">
        We hit a snag loading the demo content. Confirm the API server is running and refresh the page.
      </div>
    `;
  } finally {
    loadingState?.remove();
  }
}

bootstrap();

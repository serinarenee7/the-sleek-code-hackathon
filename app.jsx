import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'sleek-code-data-v1';

const textures = ['straight', 'wavy', 'curly', 'coily'];
const concerns = ['frizz', 'dryness', 'breakage', 'heat damage'];
const goals = ['sleek', 'growth', 'moisture', 'thickness'];
const routines = ['low', 'medium', 'high'];

const concernMap = {
  frizz: 'Use smoothing cleansers and a satin pillowcase to control flyaways.',
  dryness: 'Focus on hydration layering: water-based leave-ins + sealing oils.',
  breakage: 'Prioritize gentle detangling and protein-balanced strengthening masks.',
  'heat damage': 'Scale down heat styling and add bond-repair products weekly.'
};

const goalMap = {
  sleek: 'Aim for humidity-proof styling and anti-frizz finishing serums.',
  growth: 'Keep scalp care consistent and reduce mechanical stress.',
  moisture: 'Build routine around deep hydration and minimal cleansing stripping.',
  thickness: 'Incorporate scalp stimulation and volumizing, lightweight hydration.'
};

const maintenanceMap = {
  low: {
    wash: '1 cleanse + 1 conditioner + quick leave-in routine',
    daily: 'Refresh with mist and seal ends',
    weekly: 'One 20-minute treatment'
  },
  medium: {
    wash: 'Double cleanse, condition, leave-in, and style set',
    daily: 'Morning smooth + evening scalp massage',
    weekly: 'Hydration mask plus light protein treatment'
  },
  high: {
    wash: 'Clarify, condition, mask, leave-in, heat protectant, and finish',
    daily: 'Targeted moisture boosts and protective restyling',
    weekly: 'Two focused treatment sessions'
  }
};

function buildRoutine(profile) {
  const textureTip = {
    straight: 'Choose lightweight formulas to avoid flat roots.',
    wavy: 'Use curl-friendly mousses for soft definition.',
    curly: 'Layer cream + gel to lock in curl shape.',
    coily: 'Use richer creams and section hair when styling.'
  };

  const concernTips = profile.hairConcerns.map((item) => concernMap[item]);
  const goalTips = profile.hairGoals.map((item) => goalMap[item]);
  const maintenancePlan = maintenanceMap[profile.currentRoutine];

  return {
    washDay: [
      `Prep for ${profile.hairTexture} hair: ${textureTip[profile.hairTexture]}`,
      `Routine intensity: ${maintenancePlan.wash}`,
      ...concernTips
    ],
    daily: [
      `Daily foundation: ${maintenancePlan.daily}`,
      ...goalTips,
      'Protect overnight with a silk wrap or bonnet.'
    ],
    weekly: [
      `Weekly focus: ${maintenancePlan.weekly}`,
      'Track scalp comfort and adjust product quantity as needed.',
      'Take one progress photo in natural light.'
    ],
    dos: [
      'Do detangle from ends to roots using a wide-tooth comb.',
      'Do apply leave-in on damp hair for better absorption.',
      'Do use heat protectant before any hot tools.'
    ],
    donts: [
      'Don’t over-layer heavy oils at the root.',
      'Don’t skip trims if breakage is persistent.',
      'Don’t brush dry textured hair aggressively.'
    ]
  };
}

function buildForecast(profile) {
  const outlook = [];

  if (profile.hairGoals.includes('sleek')) outlook.push('noticeably smoother finish by day 10');
  if (profile.hairGoals.includes('growth')) outlook.push('healthier scalp habits supporting stronger retention by day 30');
  if (profile.hairGoals.includes('moisture')) outlook.push('improved softness and reduced dryness by week 2');
  if (profile.hairGoals.includes('thickness')) outlook.push('fuller-looking style through reduced breakage by week 4');

  if (profile.hairConcerns.includes('heat damage')) {
    outlook.push('less visible heat stress when heat tools are reduced consistently');
  }

  return outlook.length ? outlook : ['balanced hair behavior with consistent care'];
}

function scoreLabel(value) {
  if (value <= 2) return 'Needs support';
  if (value === 3) return 'Moderate';
  return 'Strong';
}

export default function App() {
  const [profile, setProfile] = useState({
    hairTexture: 'wavy',
    hairConcerns: ['frizz'],
    hairGoals: ['sleek'],
    currentRoutine: 'medium'
  });
  const [submittedProfile, setSubmittedProfile] = useState(null);
  const [progress, setProgress] = useState({ frizz: 3, moisture: 3, breakage: 3 });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.profile) setSubmittedProfile(parsed.profile);
      if (parsed.progress) setProgress(parsed.progress);
    } catch {
      // ignore malformed local state
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile: submittedProfile,
        progress
      })
    );
  }, [submittedProfile, progress]);

  const routinePlan = useMemo(() => (submittedProfile ? buildRoutine(submittedProfile) : null), [submittedProfile]);
  const sleekForecast = useMemo(() => (submittedProfile ? buildForecast(submittedProfile) : []), [submittedProfile]);

  const toggleMulti = (key, value) => {
    setProfile((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: next.length ? next : [value]
      };
    });
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/generate-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await response.json();
    setSubmittedProfile(data.profile);
  };

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">AI Hair Intelligence</p>
        <h1>Sleek Code</h1>
        <p className="subtitle">
          Your premium, personalized hair-care assistant for smoother strands, stronger routines, and elegant results.
        </p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Hair Profile Quiz</h2>
          <form onSubmit={submitQuiz} className="quiz">
            <div>
              <label>Hair texture</label>
              <select
                value={profile.hairTexture}
                onChange={(e) => setProfile((prev) => ({ ...prev, hairTexture: e.target.value }))}
              >
                {textures.map((texture) => (
                  <option key={texture} value={texture}>
                    {texture}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend>Hair concerns</legend>
              <div className="pills">
                {concerns.map((concern) => (
                  <button
                    type="button"
                    className={profile.hairConcerns.includes(concern) ? 'pill active' : 'pill'}
                    key={concern}
                    onClick={() => toggleMulti('hairConcerns', concern)}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Hair goals</legend>
              <div className="pills">
                {goals.map((goal) => (
                  <button
                    type="button"
                    className={profile.hairGoals.includes(goal) ? 'pill active' : 'pill'}
                    key={goal}
                    onClick={() => toggleMulti('hairGoals', goal)}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label>Current routine</label>
              <select
                value={profile.currentRoutine}
                onChange={(e) => setProfile((prev) => ({ ...prev, currentRoutine: e.target.value }))}
              >
                {routines.map((routine) => (
                  <option key={routine} value={routine}>
                    {routine} maintenance
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="primary">Generate Sleek Code Profile</button>
          </form>
        </section>

        <section className="card results">
          <h2>Sleek Code Profile</h2>
          {!submittedProfile ? (
            <p>Complete the quiz to reveal your personalized profile and routine.</p>
          ) : (
            <>
              <p>
                Texture: <strong>{submittedProfile.hairTexture}</strong> · Routine Style:{' '}
                <strong>{submittedProfile.currentRoutine}</strong>
              </p>
              <p>
                Concerns: <strong>{submittedProfile.hairConcerns.join(', ')}</strong>
              </p>
              <p>
                Goals: <strong>{submittedProfile.hairGoals.join(', ')}</strong>
              </p>

              {routinePlan && (
                <div className="routine-grid">
                  <RoutineBlock title="Wash Day Routine" items={routinePlan.washDay} />
                  <RoutineBlock title="Daily Routine" items={routinePlan.daily} />
                  <RoutineBlock title="Weekly Treatment Plan" items={routinePlan.weekly} />
                  <RoutineBlock title="Key Do’s" items={routinePlan.dos} />
                  <RoutineBlock title="Key Don’ts" items={routinePlan.donts} />
                </div>
              )}

              <h3>30-Day Sleek Forecast</h3>
              <ul>
                {sleekForecast.map((forecast, idx) => (
                  <li key={idx}>{forecast}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="card">
          <h2>Progress Tracker</h2>
          <p>Log your current levels and watch your pattern evolve.</p>
          <div className="tracker-grid">
            {Object.entries(progress).map(([metric, value]) => (
              <label key={metric} className="tracker-item">
                <span>{metric}</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={value}
                  onChange={(e) => setProgress((prev) => ({ ...prev, [metric]: Number(e.target.value) }))}
                />
                <span>
                  {value}/5 · {scoreLabel(value)}
                </span>
              </label>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function RoutineBlock({ title, items }) {
  return (
    <section className="routine-block">
      <h4>{title}</h4>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

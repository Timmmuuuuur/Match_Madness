import tajweedData from '@shared/data/quran/tajweed.json';

export function TajweedPage() {
  return (
    <div className="screen quran-screen">
      <header className="reading-hero">
        <h1>{tajweedData.meta.title}</h1>
        <p className="subtitle">{tajweedData.meta.subtitle}</p>
      </header>

      {tajweedData.sections.map((section) => (
        <section key={section.id} className="card quran-tajweed-section">
          <h2>{section.title}</h2>
          <ul className="quran-tajweed-list">
            {section.items.map((item, i) => (
              <li key={i} className="quran-tajweed-item">
                <p className="quran-tajweed-rule">{item.rule}</p>
                {item.example && (
                  <p className="quran-letter-example" dir="rtl" lang="ar">{item.example}</p>
                )}
                {item.tip && <p className="quran-note">{item.tip}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

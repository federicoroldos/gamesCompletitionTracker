import { Language, useI18n } from '../i18n';

const LanguageSwitcher = () => {
  const { lang, setLang, t } = useI18n();

  const handleSelect = (nextLang: Language) => setLang(nextLang);

  return (
    <div className="language-switcher">
      <div className="language-toggle" role="group" aria-label={t.languageLabel}>
        <button
          type="button"
          className={`language-pill ${lang === 'es' ? 'is-active' : ''}`}
          onClick={() => handleSelect('es')}
        >
          ES
        </button>
        <button
          type="button"
          className={`language-pill ${lang === 'en' ? 'is-active' : ''}`}
          onClick={() => handleSelect('en')}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

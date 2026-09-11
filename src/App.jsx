import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { portfolio, socialLinks } from './data/portfolio';
import { projectData } from './data/projects';
import { resumeData as defaultResumeData } from './data/resume';
import { services } from './data/services';
import { skillGroups, skillLevels } from './data/skills';
import { defaultSiteConfig, resumeStorageKey, siteConfigStorageKey } from './data/siteConfig';

const navItems = ['Home', 'About', 'Resume', 'Services', 'Projects', 'Skills', 'Contact'];
const projectFilters = ['ALL', 'BUSINESS', 'WEB APP', 'E-COMMERCE', 'COMMUNITY', 'CREATIVE'];

const stats = [
  { value: '06+', label: 'Projects' },
  { value: '05+', label: 'Technologies' },
  { value: '01', label: 'Developer' },
  { value: '100%', label: 'Commitment' },
];

const process = [
  { step: '01', title: 'DISCOVER', description: 'Memahami kebutuhan dan tujuan project.' },
  { step: '02', title: 'PLAN', description: 'Menentukan fitur, struktur, dan database.' },
  { step: '03', title: 'DEVELOP', description: 'Membangun frontend, backend, API, dan database.' },
  { step: '04', title: 'TEST', description: 'Memastikan fitur berjalan dengan baik.' },
  { step: '05', title: 'DELIVER', description: 'Deployment dan handover.' },
];

const reasons = [
  { title: 'Practical', description: 'Fokus pada kebutuhan project.' },
  { title: 'Responsive', description: 'Website nyaman di desktop dan mobile.' },
  { title: 'Clear Communication', description: 'Komunikasi yang jelas.' },
  { title: 'Continuous Learning', description: 'Terus berkembang melalui project nyata.' },
];

const sanitizeLink = (link) => (link && link !== '#' ? link : '#');
const hasRealLink = (link) => Boolean(link && link !== '#');

const readSiteConfig = () => {
  try {
    const savedConfig = localStorage.getItem(siteConfigStorageKey);
    return savedConfig ? { ...defaultSiteConfig, ...JSON.parse(savedConfig) } : defaultSiteConfig;
  } catch {
    return defaultSiteConfig;
  }
};

const saveSiteConfig = (config) => {
  localStorage.setItem(siteConfigStorageKey, JSON.stringify(config));
};

const readFileAsDataUrl = (file, onLoad) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => onLoad(reader.result));
  reader.readAsDataURL(file);
};

const readResumeData = () => {
  try {
    const savedResume = localStorage.getItem(resumeStorageKey);
    const resume = savedResume ? JSON.parse(savedResume) : { ...defaultResumeData };
    delete resume.organization;
    return resume;
  } catch {
    return defaultResumeData;
  }
};

function App() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [developerMode, setDeveloperMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Home');
  const [siteConfig, setSiteConfig] = useState(readSiteConfig);
  const [resumeContent, setResumeContent] = useState(readResumeData);
  const [resumeDraft, setResumeDraft] = useState(() => JSON.stringify(readResumeData(), null, 2));
  const [resumeEditorError, setResumeEditorError] = useState('');

  const updateSiteConfig = (updates) => {
    setSiteConfig((currentConfig) => {
      const nextConfig = { ...currentConfig, ...updates };
      saveSiteConfig(nextConfig);
      return nextConfig;
    });
  };

  const resetSiteConfig = () => {
    setSiteConfig(defaultSiteConfig);
    localStorage.removeItem(siteConfigStorageKey);
  };

  const saveResumeContent = () => {
    try {
      const nextResume = JSON.parse(resumeDraft);
      delete nextResume.organization;
      localStorage.setItem(resumeStorageKey, JSON.stringify(nextResume));
      setResumeContent(nextResume);
      setResumeDraft(JSON.stringify(nextResume, null, 2));
      setResumeEditorError('Resume berhasil disimpan.');
    } catch {
      setResumeEditorError('Format belum valid. Pastikan isi editor menggunakan JSON yang benar.');
    }
  };

  const resetResumeContent = () => {
    localStorage.removeItem(resumeStorageKey);
    setResumeContent(defaultResumeData);
    setResumeDraft(JSON.stringify(defaultResumeData, null, 2));
    setResumeEditorError('Resume dikembalikan ke data awal.');
  };

  const handleProfileImageChange = (event) => {
    const [file] = event.target.files;
    if (file) readFileAsDataUrl(file, (profileImage) => updateSiteConfig({ profileImage }));
    event.target.value = '';
  };

  const handleCvChange = (event) => {
    const [file] = event.target.files;
    if (file) readFileAsDataUrl(file, (cvFile) => updateSiteConfig({ cvFile }));
    event.target.value = '';
  };

  const handleProjectImageChange = (projectId, event) => {
    const [file] = event.target.files;
    if (file) {
      readFileAsDataUrl(file, (image) => {
        updateSiteConfig({ projectImages: { ...siteConfig.projectImages, [projectId]: image } });
      });
    }
    event.target.value = '';
  };

  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.toLowerCase()));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          const id = visibleEntry.target.id;
          const label = navItems.find((item) => item.toLowerCase() === id);
          if (label) setActiveSection(label);
        }
      },
      { rootMargin: '-30% 0px -45% 0px', threshold: [0.2, 0.5, 0.8] },
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'ALL') return projectData;
    return projectData.filter((project) => project.category.toUpperCase() === activeFilter);
  }, [activeFilter]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileNavOpen(false);
  };

  const handleCvDownload = () => {
    const cvPath = siteConfig.cvFile;
    const link = document.createElement('a');
    link.href = cvPath;
    link.download = 'CV-Damar-Jatiwidodo.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="navbar container" aria-label="Main navigation">
          <button type="button" className="nav-logo" onClick={() => scrollToSection('home')}>
            {portfolio.name}
          </button>

          <div className={`nav-links ${mobileNavOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                className={activeSection === item ? 'nav-item active' : 'nav-item'}
                onClick={() => scrollToSection(item.toLowerCase())}
              >
                {item}
              </button>
            ))}
            <a href="mailto:damarjatiwidodo@gmail.com" className="nav-cta">
              Let&apos;s Talk <span aria-hidden="true">→</span>
            </a>
          </div>

          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <main>
        <section id="home" className="hero-section container">
          <div className="hero-copy">
            <span className="badge">AVAILABLE FOR FREELANCE</span>
            <h1>{portfolio.heroTitle}</h1>
            <p className="hero-subtitle">{portfolio.heroSubtitle}</p>
            <div className="hero-actions">
              <button type="button" className="primary-btn" onClick={() => scrollToSection('projects')}>
                View My Work
              </button>
              <button type="button" className="secondary-btn" onClick={handleCvDownload}>
                Download CV
              </button>
            </div>
            <div className="status-row" aria-label="Availability status">
              <span>Open for Freelance</span>
              <span>Open for Internship</span>
            </div>
          </div>

          <div className="workspace-panel" aria-label="Developer workspace preview">
            <div className="browser-bar">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>

            <div className="workspace-content">
              <div className="terminal-block">
                <div className="terminal-header">terminal</div>
                <pre>{`$ npm run dev
$ vite
ready in 500ms`}</pre>
              </div>

              <div className="code-block">
                <div className="code-tags">
                  <span>React</span>
                  <span>PHP</span>
                  <span>MySQL</span>
                  <span>JavaScript</span>
                  <span>API</span>
                </div>
                <pre>{`const build = () => {
  return 'modern web experience';
};`}</pre>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-intro container">
          <p className="eyebrow">Hi, I&apos;m Damar.</p>
          <p className="intro-text">{portfolio.shortIntro}</p>
          <div className="meta-row">
            <span>{portfolio.location}</span>
            <span>Open for Freelance</span>
            <span>Open for Internship</span>
          </div>
        </section>

        <section id="about" className="section container">
          <div className="section-heading">
            <p className="eyebrow">About Me</p>
            <h2>About Me</h2>
          </div>

          <div className="about-grid">
            <div className="profile-card">
              <img
                src={siteConfig.profileImage}
                alt={portfolio.fullName}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = '/assets/profile-placeholder.svg';
                }}
              />
            </div>

            <div className="about-copy">
              <p>
                Mahasiswa S1 Informatika Universitas Gunadarma yang memiliki minat pada Data, Database, dan
                Web Development. Saya memiliki pengalaman proyek dalam pengembangan aplikasi web, perancangan
                database, serta pengolahan data menggunakan Microsoft Excel dan Python.
              </p>
              <p>
                Saya juga memiliki pengalaman magang di Bank BJB pada bidang Marketing dengan tugas yang
                berkaitan dengan pemeriksaan dokumen, validasi data, pengolahan informasi, dan perhitungan
                terkait pengajuan pinjaman.
              </p>
              <p>
                Teliti, mampu bekerja secara individu maupun tim, cepat beradaptasi dengan proses kerja
                perusahaan, dan berkomitmen menyelesaikan pekerjaan tepat waktu.
              </p>
            </div>
          </div>
        </section>

        <section id="resume" className="section container">
          <div className="section-heading">
            <p className="eyebrow">Resume</p>
            <h2>Resume</h2>
          </div>

          <div className="resume-tabs" aria-label="Resume tabs">
            {['Experience', 'Education', 'Certification'].map((tab) => (
              <button key={tab} type="button" className="resume-tab active" aria-label={tab}>
                {tab}
              </button>
            ))}
          </div>

          <div className="resume-content">
            <div className="timeline-block">
              <div className="timeline-title">Experience</div>
              {resumeContent.experience.map((item) => (
                <div key={item.title} className="timeline-item">
                  <div className="timeline-period">{item.period}</div>
                  <div className="timeline-body">
                    <h3>{item.title}</h3>
                    {item.details.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="timeline-block">
              <div className="timeline-title">Education</div>
              {resumeContent.education.map((item) => (
                <div key={item.title} className="timeline-item">
                  <div className="timeline-period">{item.period}</div>
                  <div className="timeline-body">
                    <h3>{item.title}</h3>
                    <p>{item.details}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="timeline-block">
              <div className="timeline-title">Project Experience</div>
              {resumeContent.projects.map((item) => (
                <div key={item.title} className="timeline-item">
                  <div className="timeline-period">{item.period}</div>
                  <div className="timeline-body">
                    <h3>{item.title}</h3>
                    {item.details.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="timeline-block">
              <div className="timeline-title">Certificates &amp; Achievements</div>
              {resumeContent.certifications.length ? (
                resumeContent.certifications.map((item) => (
                  <div key={item.name} className="certificate-card">
                    {item.image && (
                      <a href={item.image} target="_blank" rel="noreferrer" className="certificate-image-link">
                        <img src={item.image} alt={`${item.name} certificate`} className="certificate-image" />
                      </a>
                    )}
                    <h3>{item.name}</h3>
                    <p>{item.issuer}</p>
                    <span>{item.year}</span>
                  </div>
                ))
              ) : (
                <div className="placeholder-box">
                  Belum ada sertifikat. Tambahkan data di src/data/resume.js dan simpan gambarnya di
                  public/assets/certificates/.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="cv-cta container">
          <div>
            <p className="eyebrow">Portfolio CV</p>
            <h2>Download my CV</h2>
          </div>
          <div className="cta-actions">
            <button type="button" className="primary-btn" onClick={handleCvDownload}>
              Download CV
            </button>
            <a href={siteConfig.cvFile} target="_blank" rel="noreferrer" className="secondary-btn link-button">
              View CV
            </a>
          </div>
        </section>

        <section id="services" className="section container">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h2>What Can I Build For You?</h2>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <span className="service-number">{service.title}</span>
                <ul>
                  {service.description.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="service-price">Mulai dari: {service.price}</div>
              </article>
            ))}
          </div>

          <div className="section-cta">
            <a href="mailto:damarjatiwidodo@gmail.com" className="inline-link">
              Discuss Your Project <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section id="projects" className="section container">
          <div className="section-heading">
            <p className="eyebrow">Projects</p>
            <h2>Selected Work</h2>
          </div>

          <div className="filter-row" aria-label="Project filters">
            {projectFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={activeFilter === filter ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <article key={project.id} className="project-card">
                <div className="project-image-wrap">
                  <img src={siteConfig.projectImages?.[project.id] || project.image} alt={`${project.title} preview`} />
                  <span className="project-index">{String(project.id).padStart(2, '0')}</span>
                </div>
                <div className="project-body">
                  <div className="project-header-row">
                    <h3>{project.title}</h3>
                    <span className="tag">{project.category}</span>
                  </div>
                  <p className="project-status">{project.status}</p>
                  <div className="project-tech-list">
                    {project.tech.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  {hasRealLink(project.liveDemo) && (
                    <p className="project-url" title={project.liveDemo}>
                      {project.liveDemo.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </p>
                  )}
                  <div className="project-links">
                    {hasRealLink(project.liveDemo) && (
                      <a href={sanitizeLink(project.liveDemo)} target="_blank" rel="noreferrer">
                        Open Website <span aria-hidden="true">→</span>
                      </a>
                    )}
                    {hasRealLink(project.github) && (
                      <a href={sanitizeLink(project.github)} target="_blank" rel="noreferrer">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="section container">
          <div className="section-heading">
            <p className="eyebrow">Tech Stack</p>
            <h2>Tech Stack</h2>
          </div>

          <div className="tech-grid">
            {skillGroups.map((group) => (
              <div key={group.title} className="tech-group">
                <h3>{group.title}</h3>
                <div className="tag-list">
                  {group.skills.map((skill) => (
                    <span key={skill} className="tag pill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="level-grid">
            {skillLevels.map((level) => (
              <div key={level.label} className="level-card">
                <h3>{level.label}</h3>
                <ul>
                  {level.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="section container">
          <div className="section-heading">
            <p className="eyebrow">Developer Mode</p>
            <h2>Developer Mode</h2>
          </div>

          <div className="toggle-row">
            <button
              type="button"
              className={developerMode ? 'mode-toggle active' : 'mode-toggle'}
              onClick={() => setDeveloperMode((value) => !value)}
            >
              {developerMode ? 'DEVELOPER MODE' : 'NORMAL MODE'}
            </button>
          </div>

          {developerMode && (
            <div className="developer-tools">
              <div className="terminal-panel" aria-live="polite">
                <pre>{`$ whoami
damar@developer

$ stack
React
PHP
MySQL
JavaScript

$ status
AVAILABLE_FOR_FREELANCE

$ current_focus
Web Development`}</pre>
              </div>

              <div className="site-editor">
                <div className="site-editor-heading">
                  <div>
                    <p className="eyebrow">Content Editor</p>
                    <h3>Update profile assets</h3>
                  </div>
                  <button type="button" className="text-button" onClick={resetSiteConfig}>
                    Reset defaults
                  </button>
                </div>

                <div className="editor-fields">
                  <label className="editor-field">
                    <span>Profile photo</span>
                    <input type="file" accept="image/*" onChange={handleProfileImageChange} />
                    <small>Current: {siteConfig.profileImage.startsWith('data:') ? 'Custom upload' : siteConfig.profileImage}</small>
                  </label>
                  <label className="editor-field">
                    <span>CV file</span>
                    <input type="file" accept=".pdf,application/pdf" onChange={handleCvChange} />
                    <small>Current: {siteConfig.cvFile.startsWith('data:') ? 'Custom upload' : siteConfig.cvFile}</small>
                  </label>
                </div>

                <div className="project-editor">
                  <span>Project photos</span>
                  <div className="project-editor-grid">
                    {projectData.map((project) => (
                      <label key={project.id} className="editor-field compact">
                        <span>{project.title}</span>
                        <input type="file" accept="image/*" onChange={(event) => handleProjectImageChange(project.id, event)} />
                        <small>{siteConfig.projectImages?.[project.id] ? 'Custom upload' : 'Default project image'}</small>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="editor-note">Perubahan tersimpan otomatis di browser ini dan akan dipakai setiap kali website dibuka.</p>
              </div>

              <div className="site-editor resume-editor">
                <div className="site-editor-heading">
                  <div>
                    <p className="eyebrow">Resume Editor</p>
                    <h3>Edit isi resume</h3>
                  </div>
                  <button type="button" className="text-button" onClick={resetResumeContent}>
                    Reset resume
                  </button>
                </div>
                <p className="editor-note resume-help">
                  Edit teks di bawah, lalu klik Simpan resume. Bagian yang tersedia: education, experience,
                  projects, dan certifications.
                </p>
                <textarea
                  className="resume-textarea"
                  value={resumeDraft}
                  onChange={(event) => {
                    setResumeDraft(event.target.value);
                    setResumeEditorError('');
                  }}
                  spellCheck="false"
                  aria-label="Resume JSON editor"
                />
                <div className="resume-editor-actions">
                  <button type="button" className="primary-btn" onClick={saveResumeContent}>
                    Simpan resume
                  </button>
                  {resumeEditorError && <span className="editor-status">{resumeEditorError}</span>}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="section container">
          <div className="section-heading">
            <p className="eyebrow">How I Work</p>
            <h2>How I Work</h2>
          </div>

          <div className="process-grid">
            {process.map((item) => (
              <article key={item.step} className="process-card">
                <div className="process-step">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section container">
          <div className="stats-grid" aria-label="Portfolio statistics">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="section container">
          <div className="section-heading">
            <p className="eyebrow">Why Work With Me?</p>
            <h2>Why Work With Me?</h2>
          </div>

          <div className="reasons-grid">
            {reasons.map((reason) => (
              <article key={reason.title} className="reason-card">
                <div className="reason-index">0{reasons.indexOf(reason) + 1}</div>
                <h3>{reason.title}</h3>
                <p>{reason.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section container">
          <div className="contact-box">
            <div className="contact-header">
              <p className="eyebrow">Contact</p>
              <h2>Let&apos;s Build Something Useful.</h2>
              <p className="contact-subtitle">Have an idea, website, or system in mind? Let&apos;s talk.</p>
            </div>

            <div className="contact-links">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="contact-link">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="cta-actions contact-actions">
              <a href="mailto:damarjatiwidodo@gmail.com" className="primary-btn small-link">
                Start a Project <span aria-hidden="true">→</span>
              </a>
              <button type="button" className="secondary-btn" onClick={handleCvDownload}>
                Download CV
              </button>
            </div>
          </div>
        </section>

        <section className="final-cta container">
          <div>
            <p className="eyebrow">Have a Project in Mind?</p>
            <h2>Let&apos;s turn your idea into a functional web experience.</h2>
          </div>
          <div className="cta-actions">
            <a href="mailto:damarjatiwidodo@gmail.com" className="primary-btn small-link">
              Let&apos;s Talk <span aria-hidden="true">→</span>
            </a>
            <button type="button" className="secondary-btn" onClick={handleCvDownload}>
              Download CV
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-brand">{portfolio.name}</div>
            <p className="footer-role">{portfolio.role}</p>
            <p className="footer-tagline">Building useful things for the web.</p>
          </div>

          <div className="social-row" aria-label="Social media links">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom container">
          <span>© 2026 {portfolio.fullName}. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

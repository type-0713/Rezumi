import { type ChangeEvent, type ReactNode, useRef, useState } from 'react';

type ViewMode = 'form' | 'preview';

type PersonalLinks = {
  linkedin: string;
  github: string;
  website: string;
};

type PersonalInfo = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  avatarBase64: string;
  links: PersonalLinks;
};

type Experience = {
  id: number;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  liveLink: string;
  githubLink: string;
};

type Education = {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Skill = {
  id: number;
  category: string;
  skills: string;
};

type Language = {
  id: number;
  language: string;
  level: string;
};

type ResumeData = {
  personal: PersonalInfo;
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
};

type SectionKey = 'experiences' | 'projects' | 'education' | 'skills' | 'languages';

type SectionMap = {
  experiences: Experience;
  projects: Project;
  education: Education;
  skills: Skill;
  languages: Language;
};

type ChangeableSectionMap = {
  [K in SectionKey]: Omit<SectionMap[K], 'id'>;
};

let idCounter = Date.now();
const createId = () => {
  idCounter += 1;
  return idCounter;
};

const toImageSrc = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/')) return trimmed;

  const compact = trimmed.replace(/\s/g, '');
  if (/^[A-Za-z0-9+/=]+$/.test(compact)) {
    return `data:image/png;base64,${compact}`;
  }

  return '';
};

const emptySectionItem: ChangeableSectionMap = {
  experiences: { company: '', role: '', location: '', startDate: '', endDate: '', description: '' },
  projects: { name: '', description: '', liveLink: '', githubLink: '' },
  education: { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' },
  skills: { category: '', skills: '' },
  languages: { language: '', level: '' },
};

const initialResume: ResumeData = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    avatarBase64: '',
    links: {
      linkedin: '',
      github: '',
      website: '',
    },
  },
  experiences: [{ id: createId(), ...emptySectionItem.experiences }],
  projects: [{ id: createId(), ...emptySectionItem.projects }],
  education: [{ id: createId(), ...emptySectionItem.education }],
  skills: [{ id: createId(), ...emptySectionItem.skills }],
  languages: [{ id: createId(), ...emptySectionItem.languages }],
};

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url' | 'date';
  placeholder?: string;
};

const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }: InputFieldProps) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-slate-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
    />
  </div>
);

type TextAreaFieldProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

const TextAreaField = ({ label, value, onChange, placeholder = '', rows = 4 }: TextAreaFieldProps) => (
  <div className="space-y-2">
    {label ? <label className="block text-sm font-semibold text-slate-700">{label}</label> : null}
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white resize-none"
    />
  </div>
);

const TrashBinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9.5 7V5.8A1.8 1.8 0 0 1 11.3 4h1.4a1.8 1.8 0 0 1 1.8 1.8V7m-8 0 .7 11a2 2 0 0 0 2 1.9h6.6a2 2 0 0 0 2-1.9L17.5 7M10 11.2v5.6m4-5.6v5.6" />
  </svg>
);

type FormHandlers = {
  handlePersonalChange: <K extends keyof PersonalInfo>(field: K, value: PersonalInfo[K]) => void;
  handleLinkChange: <K extends keyof PersonalLinks>(field: K, value: PersonalLinks[K]) => void;
  addItem: <K extends SectionKey>(section: K) => void;
  removeItem: <K extends SectionKey>(section: K, id: number) => void;
  updateItem: <K extends SectionKey, F extends keyof ChangeableSectionMap[K]>(
    section: K,
    id: number,
    field: F,
    value: ChangeableSectionMap[K][F],
  ) => void;
};

type FormViewProps = {
  resume: ResumeData;
  handlers: FormHandlers;
};

type BaseSectionProps = {
  title: string;
  onAdd: () => void;
};

type SectionProps<T extends { id: number }> = BaseSectionProps & {
  items: T[];
  onRemove: (id: number) => void;
  renderItem: (item: T) => ReactNode;
};

const Section = <T extends { id: number }>({ title, items, onAdd, onRemove, renderItem }: SectionProps<T>) => (
  <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
      <span className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
      {title}
    </h2>
    <div className="space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-[0_14px_30px_-28px_rgba(15,23,42,0.9)] transition hover:shadow-[0_16px_35px_-25px_rgba(15,23,42,0.35)]"
        >
          <button
            onClick={() => onRemove(item.id)}
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm"
            type="button"
            aria-label="Remove"
            title="Delete item"
          >
            <TrashBinIcon />
          </button>
          {renderItem(item)}
        </div>
      ))}
    </div>
    <button
      onClick={onAdd}
      type="button"
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 py-3 font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
    >
      Add {title.slice(0, -1)}
    </button>
  </section>
);

const FormView = ({ resume, handlers }: FormViewProps) => {
  const { handlePersonalChange, handleLinkChange, addItem, removeItem, updateItem } = handlers;
  const avatarSrc = toImageSrc(resume.personal.avatarBase64);

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      handlePersonalChange('avatarBase64', result);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-500 to-blue-600" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Full Name"
            value={resume.personal.fullName}
            onChange={(value) => handlePersonalChange('fullName', value)}
            placeholder="Your name"
          />
          <InputField
            label="Professional Title"
            value={resume.personal.title}
            onChange={(value) => handlePersonalChange('title', value)}
            placeholder="e.g., Software Engineer"
          />
          <InputField
            label="Email"
            value={resume.personal.email}
            onChange={(value) => handlePersonalChange('email', value)}
            type="email"
            placeholder="your@email.com"
          />
          <InputField
            label="Phone"
            value={resume.personal.phone}
            onChange={(value) => handlePersonalChange('phone', value)}
            placeholder="+1 (555) 000-0000"
          />
          <InputField
            label="Location"
            value={resume.personal.location}
            onChange={(value) => handlePersonalChange('location', value)}
            placeholder="City, Country"
          />
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Links</label>
            <div className="space-y-2">
              <input
                type="url"
                value={resume.personal.links.linkedin}
                onChange={(event) => handleLinkChange('linkedin', event.target.value)}
                placeholder="LinkedIn URL"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm"
              />
              <input
                type="url"
                value={resume.personal.links.github}
                onChange={(event) => handleLinkChange('github', event.target.value)}
                placeholder="GitHub URL"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm"
              />
              <input
                type="url"
                value={resume.personal.links.website}
                onChange={(event) => handleLinkChange('website', event.target.value)}
                placeholder="Website URL"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-sm"
              />
            </div>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <label className="block text-sm font-semibold text-slate-700">Profile Image (Base64)</label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => handlePersonalChange('avatarBase64', '')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Clear Image
              </button>
            </div>
            <textarea
              value={resume.personal.avatarBase64}
              onChange={(event) => handlePersonalChange('avatarBase64', event.target.value)}
              placeholder="data:image/png;base64,... yoki faqat base64 string kiriting"
              rows={3}
              className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {avatarSrc && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                <img src={avatarSrc} alt="Avatar preview" className="h-14 w-14 rounded-xl object-cover ring-2 ring-cyan-200" />
                <p className="text-sm text-slate-600">Rasm tayyor. Preview sahifasida chiroyli joylashadi.</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <TextAreaField
            label="Professional Summary"
            value={resume.personal.summary}
            onChange={(value) => handlePersonalChange('summary', value)}
            placeholder="Brief overview of your professional background and goals"
          />
        </div>
      </section>

      <Section<Experience>
        title="Experiences"
        items={resume.experiences}
        onAdd={() => addItem('experiences')}
        onRemove={(id) => removeItem('experiences', id)}
        renderItem={(item) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={item.company}
                onChange={(event) => updateItem('experiences', item.id, 'company', event.target.value)}
                placeholder="Company Name"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-semibold"
              />
              <input
                type="text"
                value={item.role}
                onChange={(event) => updateItem('experiences', item.id, 'role', event.target.value)}
                placeholder="Job Title"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-semibold"
              />
            </div>
            <input
              type="text"
              value={item.location}
              onChange={(event) => updateItem('experiences', item.id, 'location', event.target.value)}
              placeholder="Location"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={item.startDate}
                onChange={(event) => updateItem('experiences', item.id, 'startDate', event.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
              <input
                type="date"
                value={item.endDate}
                onChange={(event) => updateItem('experiences', item.id, 'endDate', event.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
            </div>
            <TextAreaField value={item.description} onChange={(value) => updateItem('experiences', item.id, 'description', value)} placeholder="Job description and achievements" rows={3} />
          </div>
        )}
      />

      <Section<Project>
        title="Projects"
        items={resume.projects}
        onAdd={() => addItem('projects')}
        onRemove={(id) => removeItem('projects', id)}
        renderItem={(item) => (
          <div className="space-y-4">
            <input
              type="text"
              value={item.name}
              onChange={(event) => updateItem('projects', item.id, 'name', event.target.value)}
              placeholder="Project Name"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-semibold"
            />
            <TextAreaField value={item.description} onChange={(value) => updateItem('projects', item.id, 'description', value)} placeholder="Project description" rows={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                value={item.liveLink}
                onChange={(event) => updateItem('projects', item.id, 'liveLink', event.target.value)}
                placeholder="Live Link"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
              <input
                type="url"
                value={item.githubLink}
                onChange={(event) => updateItem('projects', item.id, 'githubLink', event.target.value)}
                placeholder="GitHub Link"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
            </div>
          </div>
        )}
      />

      <Section<Education>
        title="Education"
        items={resume.education}
        onAdd={() => addItem('education')}
        onRemove={(id) => removeItem('education', id)}
        renderItem={(item) => (
          <div className="space-y-4">
            <input
              type="text"
              value={item.institution}
              onChange={(event) => updateItem('education', item.id, 'institution', event.target.value)}
              placeholder="Institution Name"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-semibold"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={item.degree}
                onChange={(event) => updateItem('education', item.id, 'degree', event.target.value)}
                placeholder="Degree"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
              <input
                type="text"
                value={item.fieldOfStudy}
                onChange={(event) => updateItem('education', item.id, 'fieldOfStudy', event.target.value)}
                placeholder="Field of Study"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={item.startDate}
                onChange={(event) => updateItem('education', item.id, 'startDate', event.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
              <input
                type="date"
                value={item.endDate}
                onChange={(event) => updateItem('education', item.id, 'endDate', event.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              />
            </div>
            <TextAreaField value={item.description} onChange={(value) => updateItem('education', item.id, 'description', value)} placeholder="Additional details" rows={2} />
          </div>
        )}
      />

      <Section<Skill>
        title="Skills"
        items={resume.skills}
        onAdd={() => addItem('skills')}
        onRemove={(id) => removeItem('skills', id)}
        renderItem={(item) => (
          <div className="space-y-4">
            <input
              type="text"
              value={item.category}
              onChange={(event) => updateItem('skills', item.id, 'category', event.target.value)}
              placeholder="Category (e.g., Frontend)"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-semibold"
            />
            <input
              type="text"
              value={item.skills}
              onChange={(event) => updateItem('skills', item.id, 'skills', event.target.value)}
              placeholder="Skills (comma-separated)"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
            />
          </div>
        )}
      />

      <Section<Language>
        title="Languages"
        items={resume.languages}
        onAdd={() => addItem('languages')}
        onRemove={(id) => removeItem('languages', id)}
        renderItem={(item) => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={item.language}
                onChange={(event) => updateItem('languages', item.id, 'language', event.target.value)}
                placeholder="Language"
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-semibold"
              />
              <select
                value={item.level}
                onChange={(event) => updateItem('languages', item.id, 'level', event.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Fluent">Fluent</option>
              </select>
            </div>
          </div>
        )}
      />
    </div>
  );
};

type PreviewViewProps = {
  resume: ResumeData;
};

const PreviewView = ({ resume }: PreviewViewProps) => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    if (start && end) return `${start} - ${end}`;
    if (start && !end) return `${start} - Present`;
    if (!start && end) return end;
    return '';
  };

  const toExternalUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSavePreview = async () => {
    if (!previewRef.current || isSaving) return;
    setIsSaving(true);
    setSaveError('');

    try {
      const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
      const previewRect = previewRef.current.getBoundingClientRect();
      const clickableLinks = Array.from(previewRef.current.querySelectorAll('a[href]'))
        .map((anchor) => {
          const href = anchor.getAttribute('href') || '';
          const rect = anchor.getBoundingClientRect();
          return {
            href,
            x: rect.left - previewRect.left,
            y: rect.top - previewRect.top,
            width: rect.width,
            height: rect.height,
          };
        })
        .filter((item) => item.href && item.width > 0 && item.height > 0);

      const fileBaseName = (resume.personal.fullName || 'resume')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const fileName = `${fileBaseName || 'resume'}-preview.pdf`;
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = dataUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load preview image for PDF'));
      });

      const pageMargin = 10;
      const cardInset = 2;
      const contentX = pageMargin + cardInset;
      const contentY = pageMargin + cardInset;
      const contentWidth = pageWidth - (pageMargin + cardInset) * 2;
      const contentHeight = pageHeight - (pageMargin + cardInset) * 2;

      const renderWidth = contentWidth;
      const renderHeight = (img.height * renderWidth) / img.width;
      const totalPages = Math.max(1, Math.ceil(renderHeight / contentHeight));

      const drawPageFrame = () => {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(pageMargin, pageMargin, pageWidth - pageMargin * 2, pageHeight - pageMargin * 2, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.3);
        pdf.rect(pageMargin, pageMargin, pageWidth - pageMargin * 2, pageHeight - pageMargin * 2, 'S');
      };

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        drawPageFrame();
        const imageY = contentY - pageIndex * contentHeight;
        pdf.addImage(dataUrl, 'PNG', contentX, imageY, renderWidth, renderHeight, undefined, 'FAST');

        if (previewRect.width > 0 && previewRect.height > 0) {
          const scale = renderWidth / previewRect.width;
          const pageImageStart = pageIndex * contentHeight;
          const pageImageEnd = pageImageStart + contentHeight;

          clickableLinks.forEach((item) => {
            const linkYInImage = item.y * scale;
            const linkHeight = item.height * scale;
            const linkEnd = linkYInImage + linkHeight;
            const isVisible = linkEnd > pageImageStart && linkYInImage < pageImageEnd;
            if (!isVisible) return;

            const clippedTop = Math.max(linkYInImage, pageImageStart);
            const clippedBottom = Math.min(linkEnd, pageImageEnd);
            const visibleHeight = clippedBottom - clippedTop;
            if (visibleHeight <= 0) return;

            const linkX = contentX + item.x * scale;
            const linkY = contentY + (clippedTop - pageImageStart);
            const linkWidth = item.width * scale;

            pdf.link(linkX, linkY, linkWidth, visibleHeight, { url: item.href });
          });
        }
      }

      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to save preview image:', error);
      setSaveError('PDF save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasLinks = resume.personal.links.linkedin || resume.personal.links.github || resume.personal.links.website;
  const avatarSrc = toImageSrc(resume.personal.avatarBase64);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleSavePreview}
          disabled={isSaving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? 'Saving PDF...' : 'Save PDF'}
        </button>
      </div>
      {saveError && <p className="mb-3 text-right text-sm font-medium text-red-600">{saveError}</p>}

      <div ref={previewRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white sm:p-8 md:p-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              {resume.personal.fullName && <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">{resume.personal.fullName}</h1>}
              {resume.personal.title && <p className="mt-2 text-lg text-blue-300 sm:text-xl md:text-2xl">{resume.personal.title}</p>}

              <div className="mt-6 space-y-2 text-slate-300">
                {resume.personal.location && <p>Location: {resume.personal.location}</p>}
                {resume.personal.phone && <p>Phone: {resume.personal.phone}</p>}
                {resume.personal.email && <p>Email: {resume.personal.email}</p>}
              </div>

              {hasLinks && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {resume.personal.links.linkedin && (
                    <a href={toExternalUrl(resume.personal.links.linkedin)} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-white">
                      LinkedIn
                    </a>
                  )}
                  {resume.personal.links.github && (
                    <a href={toExternalUrl(resume.personal.links.github)} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-white">
                      GitHub
                    </a>
                  )}
                  {resume.personal.links.website && (
                    <a href={toExternalUrl(resume.personal.links.website)} target="_blank" rel="noreferrer" className="text-blue-300 hover:text-white">
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>

            {avatarSrc && (
              <div className="self-start rounded-2xl border border-white/30 bg-white/10 p-1.5 backdrop-blur">
                <img src={avatarSrc} alt="Profile" className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8 md:p-12">
        {resume.personal.summary && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b-2 border-blue-600">ABOUT</h2>
            <p className="text-slate-700 leading-relaxed">{resume.personal.summary}</p>
          </div>
        )}

        {resume.experiences.some((experience) => experience.company || experience.role) && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">EXPERIENCE</h2>
            <div className="space-y-6">
              {resume.experiences.map(
                (experience) =>
                  (experience.company || experience.role) && (
                    <div key={experience.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          {experience.company && <h3 className="text-lg font-bold text-slate-900">{experience.company}</h3>}
                          {experience.role && <p className="text-blue-600 font-semibold">{experience.role}</p>}
                        </div>
                        {formatDateRange(experience.startDate, experience.endDate) && (
                          <span className="text-sm text-slate-500">{formatDateRange(experience.startDate, experience.endDate)}</span>
                        )}
                      </div>
                      {experience.location && <p className="text-sm text-slate-600 mt-1">{experience.location}</p>}
                      {experience.description && <p className="text-slate-700 mt-2">{experience.description}</p>}
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {resume.projects.some((project) => project.name || project.description) && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">PROJECTS</h2>
            <div className="space-y-6">
              {resume.projects.map(
                (project) =>
                  (project.name || project.description) && (
                    <div key={project.id}>
                      {project.name && <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>}
                      {project.description && <p className="text-slate-700 mt-2">{project.description}</p>}
                      <div className="mt-2 flex gap-4">
                        {project.liveLink && (
                          <a href={toExternalUrl(project.liveLink)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                            Live Link
                          </a>
                        )}
                        {project.githubLink && (
                          <a href={toExternalUrl(project.githubLink)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {resume.education.some((item) => item.institution || item.degree) && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">EDUCATION</h2>
            <div className="space-y-6">
              {resume.education.map(
                (item) =>
                  (item.institution || item.degree) && (
                    <div key={item.id}>
                      {item.institution && <h3 className="text-lg font-bold text-slate-900">{item.institution}</h3>}
                      <div className="flex justify-between items-start mt-1">
                        {(item.degree || item.fieldOfStudy) && (
                          <p className="text-blue-600 font-semibold">
                            {item.degree}
                            {item.degree && item.fieldOfStudy ? ' ' : ''}
                            {item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ''}
                          </p>
                        )}
                        {formatDateRange(item.startDate, item.endDate) && (
                          <span className="text-sm text-slate-500">{formatDateRange(item.startDate, item.endDate)}</span>
                        )}
                      </div>
                      {item.description && <p className="text-slate-700 mt-2">{item.description}</p>}
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {resume.skills.some((item) => item.category || item.skills) && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">SKILLS</h2>
            <div className="space-y-4">
              {resume.skills.map(
                (item) =>
                  (item.category || item.skills) && (
                    <div key={item.id}>
                      {item.category && <h3 className="font-semibold text-slate-900">{item.category}</h3>}
                      {item.skills && <p className="text-slate-700">{item.skills}</p>}
                    </div>
                  ),
              )}
            </div>
          </div>
        )}

        {resume.languages.some((item) => item.language) && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b-2 border-blue-600">LANGUAGES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resume.languages.map(
                (item) =>
                  item.language && (
                    <div key={item.id} className="flex justify-between">
                      <span className="font-semibold text-slate-900">{item.language}</span>
                      <span className="text-slate-600">{item.level}</span>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

const ResumeBuilder = () => {
  const [view, setView] = useState<ViewMode>('form');
  const [resume, setResume] = useState<ResumeData>(initialResume);

  const handlePersonalChange: FormHandlers['handlePersonalChange'] = (field, value) => {
    setResume((previous) => ({
      ...previous,
      personal: {
        ...previous.personal,
        [field]: value,
      },
    }));
  };

  const handleLinkChange: FormHandlers['handleLinkChange'] = (field, value) => {
    setResume((previous) => ({
      ...previous,
      personal: {
        ...previous.personal,
        links: {
          ...previous.personal.links,
          [field]: value,
        },
      },
    }));
  };

  const addItem: FormHandlers['addItem'] = (section) => {
    setResume((previous) => ({
      ...previous,
      [section]: [...previous[section], { id: Date.now(), ...emptySectionItem[section] }],
    }));
  };

  const removeItem: FormHandlers['removeItem'] = (section, id) => {
    setResume((previous) => {
      const filtered = previous[section].filter((item) => item.id !== id);
      return {
        ...previous,
        [section]: filtered.length > 0 ? filtered : [{ id: Date.now(), ...emptySectionItem[section] }],
      };
    });
  };

  const updateItem: FormHandlers['updateItem'] = (section, id, field, value) => {
    setResume((previous) => ({
      ...previous,
      [section]: previous[section].map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent sm:text-3xl">
              Resume Builder
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Create your professional resume in minutes</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-100/80 p-1 md:w-auto md:min-w-[270px]">
            <button
              onClick={() => setView('form')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:text-base ${
                view === 'form'
                  ? 'bg-white text-slate-900 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.6)]'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
              type="button"
            >
              Edit
            </button>
            <button
              onClick={() => setView('preview')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all sm:text-base ${
                view === 'preview'
                  ? 'bg-white text-slate-900 shadow-[0_8px_24px_-14px_rgba(15,23,42,0.6)]'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
              }`}
              type="button"
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {view === 'form' ? (
          <FormView
            resume={resume}
            handlers={{ handlePersonalChange, handleLinkChange, addItem, removeItem, updateItem }}
          />
        ) : (
          <PreviewView resume={resume} />
        )}
      </div>
    </div>
  );
};

export default ResumeBuilder;

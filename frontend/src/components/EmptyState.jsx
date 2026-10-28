import Reveal from './Reveal';

export default function EmptyState({ title, text, children }) {
  return (
    <Reveal>
      <div className="card px-6 py-[70px] text-center">
        <h2 className="mb-2 text-[26px]">{title}</h2>
        <p className="mb-6 text-mist">{text}</p>
        {children}
      </div>
    </Reveal>
  );
}

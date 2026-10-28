export default function Stars({ rating }) {
  return (
    <span
      className="stars text-base"
      style={{ '--p': `${(rating.stars / 5) * 100}%` }}
      role="img"
      aria-label={`${rating.stars} out of 5 stars`}
    >
      ★★★★★
    </span>
  );
}

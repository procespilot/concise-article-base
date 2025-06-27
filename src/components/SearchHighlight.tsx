
interface SearchHighlightProps {
  text: string;
  searchTerm: string;
  className?: string;
}

const SearchHighlight = ({ text, searchTerm, className = "" }: SearchHighlightProps) => {
  if (!searchTerm) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export default SearchHighlight;

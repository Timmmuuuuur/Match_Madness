import type { LearningBlock } from '@shared/types';

interface LearningProseProps {
  blocks: LearningBlock[];
  className?: string;
}

function Block({ block }: { block: LearningBlock }) {
  switch (block.type) {
    case 'heading':
      if (block.level === 2) {
        return <h2 className="learn-h2">{block.text}</h2>;
      }
      return <h3 className="learn-h3">{block.text}</h3>;

    case 'paragraph':
      return <p className="learn-p" dangerouslySetInnerHTML={{ __html: block.text }} />;

    case 'table':
      return (
        <div className="learn-table-wrap">
          <table className="learn-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} dangerouslySetInnerHTML={{ __html: h }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'callout':
      return (
        <aside className={`learn-callout learn-callout--${block.variant}`}>
          <div className="learn-callout-inner" dangerouslySetInnerHTML={{ __html: block.text }} />
        </aside>
      );

    case 'list':
      return (
        <ul className="learn-list">
          {block.items.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );

    case 'rule':
      return (
        <div className="learn-rule">
          <span className="learn-rule-badge">Rule</span>
          <h4 className="learn-rule-title">{block.title}</h4>
          <p className="learn-rule-text" dangerouslySetInnerHTML={{ __html: block.text }} />
        </div>
      );

    case 'example':
      return (
        <figure className="learn-example">
          <blockquote className="learn-example-fr">{block.fr}</blockquote>
          <figcaption className="learn-example-en">{block.en}</figcaption>
          {block.note && <p className="learn-example-note">{block.note}</p>}
        </figure>
      );

    default:
      return null;
  }
}

export function LearningProse({ blocks, className }: LearningProseProps) {
  return (
    <div className={`learn-prose${className ? ` ${className}` : ''}`}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

import styles from './ExerciseVisual.module.css';

const inferVisualType = (visual) => {
  if (visual?.type) return visual.type;
  if (visual?.svgMarkup || visual?.svg || visual?.content) return 'svg';
  return 'image';
};

const normalizeVisuals = ({ visuals, image, imageUrl, diagram, diagramUrl, svg, svgMarkup, caption, alt, label }) => {
  const items = [];
  const sourceList = Array.isArray(visuals) ? visuals : visuals ? [visuals] : [];

  sourceList.forEach((visual, index) => {
    if (!visual) return;
    if (typeof visual === 'string') {
      items.push({ id: `visual-${index}`, type: 'image', src: visual });
      return;
    }

    items.push({
      id: visual.id || `visual-${index}`,
      type: inferVisualType(visual),
      src: visual.src || visual.url || visual.image || visual.imageUrl || visual.diagram || visual.diagramUrl || null,
      markup: visual.svgMarkup || visual.svg || visual.content || null,
      alt: visual.alt || alt || 'Ilustratie exercitiu',
      label: visual.label || label || null,
      caption: visual.caption || caption || null,
    });
  });

  if (image || imageUrl || diagram || diagramUrl || svg || svgMarkup) {
    items.push({
      id: 'legacy-visual',
      type: svg || svgMarkup ? 'svg' : 'image',
      src: image || imageUrl || diagram || diagramUrl || null,
      markup: svgMarkup || svg || null,
      alt: alt || 'Ilustratie exercitiu',
      label: label || null,
      caption: caption || null,
    });
  }

  return items.filter((item) => item.src || item.markup);
};

const ExerciseVisual = (props) => {
  const visuals = normalizeVisuals(props);

  if (!visuals.length) return null;

  return (
    <div className={styles.stack}>
      {visuals.map((visual) => (
        <figure key={visual.id} className={styles.figure}>
          {visual.label && <span className={styles.label}>{visual.label}</span>}

          <div className={styles.frame}>
            {visual.type === 'svg' && visual.markup ? (
              <div className={styles.svgFrame} dangerouslySetInnerHTML={{ __html: visual.markup }} />
            ) : (
              <img className={styles.image} src={visual.src} alt={visual.alt} loading="lazy" />
            )}
          </div>

          {visual.caption && <figcaption className={styles.caption}>{visual.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
};

export default ExerciseVisual;

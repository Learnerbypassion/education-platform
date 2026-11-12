const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none -z-10" aria-hidden="true">
      {/* Soft ambient radial focus that preserves the cube / box grid across the entire page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_60%,rgba(255,255,255,0.3)_100%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,transparent_60%,rgba(9,10,15,0.5)_100%)] pointer-events-none" />
    </div>
  );
};

export default HeroBackground;

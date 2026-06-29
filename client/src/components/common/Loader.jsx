import './Loader.css';

const Loader = ({ size = 'md', text = '' }) => (
  <div className={`loader-container loader-${size}`}>
    <div className="loader-spinner" />
    {text && <p className="loader-text">{text}</p>}
  </div>
);

export default Loader;

import './styles.css';
import React from 'react';

const NosieTitle = (props: {title: string}) => {
  const { title } = props;
  return (
      <div className="noise" style={{ width: '300px', height: '100%' }}>
            <h2>{title}</h2>
      </div>
  );
};

export default NosieTitle;
import './styles.css';
import React from 'react';

const NosieTitle = (props: {title: string}) => {
  const { title } = props;
  return (
      <div className="noise">
            <h1>{title}</h1>
      </div>
  );
};

export default NosieTitle;
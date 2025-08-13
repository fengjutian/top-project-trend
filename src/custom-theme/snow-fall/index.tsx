import Snowfall from "react-snowfall";
import React from 'react';

const SnowfallBg = () => {
  return (
    <Snowfall
      color="#fff"
      radius={[0.5, 0.8]}
      snowflakeCount={300}
      rotationSpeed={[-0.5, 1]}
      wind={[-1.5, 6.0]}
      opacity={[0.5, 1]}
    />
  );
};

export default SnowfallBg
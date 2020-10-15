import React from 'react';
import PropTypes from 'prop-types';

const statBackground = {
    width: '80%',
    background: 'gray'
};

const StatShow = (props) => (
    <div className="flex-container left-border">
        <div style={{ flex: 1, textAlign: 'right' }}>
            {props.stats.map((stat) => (
                <div className="mw-row-3">{stat.name}</div>
            ))}
        </div>
        <div style={{ flex: 4 }}>
            {props.stats.map((stat) => (
                <div style={statBackground}>
                    <div className="mw-banner" style={{ width: stat.value / stat.all, background: stat.color }}/>
                </div>
            ))}
        </div>
        <div style={{ flex: 1 }}>
            {props.stats.map((stat) => (
                <div className="mw-row-3">{stat.value}|{stat.all}</div>
            ))}
        </div>
    </div>
);

StatShow.propTypes = {
    stats: PropTypes.array
};

const StatShowTR = (props) => (
    <tr>
        <td>{props.name}</td>
        <td style={statBackground}><div style={{ width: props.value / props.all, background: props.color }}/></td>
        <td>{props.value}|{props.all}</td>
    </tr>
);

StatShowTR.propTypes = {
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    all: PropTypes.number.isRequired
};

export default StatShow;

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
const randomColor = require('randomcolor');

const styles = {
    nameCell: { textAlign: 'left' },
    backCell: { background: 'gray', height: '0.6em' },
    valueCell: { height: '100%' },
    taskCell: { height: '100%' },
    numberCell: { textAlign: 'right' }
};

const StatRow = ({ classes: { nameCell, backCell, valueCell, taskCell, numberCell },
    statRow: { name, task, value, all, taskColor, valueColor }, onClickStatBar }) =>
    <tr>
        <td className={nameCell}>{name}</td>
        <td>
            <div className={backCell} onClick={onClickStatBar}>
                <div className={valueCell}
                    style={{ width: `${value * 100 / all}%`, background: valueColor || randomColor() }}>
                    <div className={taskCell}
                        style={{ width: `${value ? (task * 100 / value) : 100}%`, background: taskColor || randomColor() }}>
                    </div>
                </div>
            </div>
        </td>
        <td className={numberCell}>{task}|{value}</td>
    </tr>;

StatRow.propTypes = {
    classes: PropTypes.object.isRequired,
    statRow: PropTypes.object.isRequired,
    onClickStatBar: PropTypes.func.isRequired
};

export default withStyles(styles)(StatRow);
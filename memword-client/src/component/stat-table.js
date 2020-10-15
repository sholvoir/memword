import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import StatRow from './stat-row';

const styles = {
    table: { width: '100%' },
    statCol: { width: '100%' }
};

const StatTable = ({ classes: { table, statCol }, statRows, onClickStatBar}) =>
    <table className={table}>
        <colgroup>
            <col />
            <col className={statCol} />
            <col />
        </colgroup>
        <tbody>
            {statRows.map((statRow, i) => <StatRow statRow={statRow} key={i} onClickStatBar={onClickStatBar} />)}
        </tbody>
    </table>;

StatTable.propTypes = {
    classes: PropTypes.object.isRequired,
    statRows: PropTypes.array.isRequired,
    onClickStatBar: PropTypes.func.isRequired
};

export default withStyles(styles)(StatTable);

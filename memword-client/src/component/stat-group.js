import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import StatTable from './stat-table';
import { statItems, tstatToStatItems } from '../service/mem'

const styles = {
    itemGrid: { padding: '6px' },
    paper: { padding: '6px' }
};

const StatGroup = ({ classes: { itemGrid, paper }, tstatTask, tstatValue, onClickStatBar }) => {
    const itemStat = tstatToStatItems(tstatTask, tstatValue);
    return itemStat && <Grid container>
        {statItems.map(item => <Grid item xs={12} sm={6} md={4} className={itemGrid} key={item}>
            <Paper className={paper}><StatTable statRows={itemStat[item]} onClickStatBar={onClickStatBar} /></Paper>
        </Grid>)}
    </Grid>
};

StatGroup.propTypes = {
    classes: PropTypes.object.isRequired,
    tstatTask: PropTypes.object,
    tstatValue: PropTypes.object,
    onClickStatBar: PropTypes.func.isRequired
};

export default withStyles(styles)(StatGroup);
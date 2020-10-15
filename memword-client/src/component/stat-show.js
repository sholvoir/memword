import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import StatGroup from './stat-group';
import { taskType, taskTypes, getEpisode} from '../service/mem';

const styles = {
    container: {flex: 1},
    title: { background: 'Gainsboro', padding: '5px 10px' }
};

const StatShow = ({ classes: { container, title }, statData, onClickStatBar }) => taskTypes
    .filter(ttype => statData[`${ttype}_value`].all)
    .map(ttype => {
        const filterFunc = task => taskType(task) == ttype;
        const getTypeTasks = async () => onClickStatBar(await getEpisode(filterFunc));
        return <Paper key={ttype} className={container}>
            <div className={title} onClick={getTypeTasks}>
                {ttype.toUpperCase()} {statData[`${ttype}_value`].all}
            </div>
            <StatGroup tstatTask={statData[`${ttype}_task`]}
                tstatValue={statData[`${ttype}_value`]} onClickStatBar={onClickStatBar} />
        </Paper>});

StatShow.propTypes = {
    statData: PropTypes.object.isRequired,
    onClickStatBar: PropTypes.func.isRequired
};

export default withStyles(styles)(StatShow);
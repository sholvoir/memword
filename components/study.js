import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { getDict, taskDictID, taskType, study } from '../service/mem';

const styles = {
    container: { flex: 1, display: 'flex', flexDirection: 'column', height: '100%' },
    title: { display: 'flex' },
    body: { flex: 1 },
    tail: { display: 'flex', '&>button': { flexGrow: 1, flexShrink: 1, margin: '3px', padding: '1px' } },
    spellDiv: { fontSize: '2em' }
};

class Study extends React.Component {
    state = {
        index: 0,
        phase: 'q', //'a'
        sound: false,
        dict: null
    };
    handleKeyPress = (event) => {
        event.preventDefault();
        switch (event.keyCode) {
            case 66: case 98: case 67: case 99: this.handleSpeakIt(); break;
            case 32: this.handleShowAnswer(); break;
            case 78: case 88: case 110: case 120: this.handleIKnown(); break;
            case 77: case 90: case 109: case 122: this.handleDontKnow(); break;
            case 46: case 62: this.handleNext();
        }
    };
    handleSpeakIt = () => this.setState({ sound: true });
    handleShowAnswer = () => this.setState({phase: 'a'});
    handleIKnown = () => {
        study(this.props.tasks[this.state.index]);
        if (this.state.phase == 'q') {
            this.setState({ phase: 'a' });
            setTimeout(this.handleNext, 5000);
        } else this.handleNext();
    };
    handleDontKnow = () => {
        this.props.tasks[this.state.index].level = 0;
        this.handleIKnown();
    };
    handleNext = () => this.setState(state => ({ index: state.index + 1, phase: 'q', sound: false, dict: null }));
    render() {
        const { classes: { container, title, body, tail, spellDiv }, tasks, onFinish } = this.props;
        const { index, phase, sound, dict } = this.state;
        if (index >= tasks.length) return (onFinish(), <div/>);
        const task = tasks[index];
        if (!dict) getDict(taskDictID(task)).then(dict => this.setState({ dict }));
        const ttype = taskType(task);

        this.shouldSound = dict && dict.audio && dict.audio.length &&
            (sound || phase == 'a' || phase == 'q' && ttype == 'listen');
        const shouldSpell = dict && (phase == 'a' || phase == 'q' && ttype == 'read');
        const shouldMean = dict && (phase == 'a' || phase == 'q' && (ttype == 'speak' || ttype == 'write'));
        
        return task && <div className={container} onKeyPress={this.handleKeyPress}>
            <div className={title}><div style={{flex: 1}}>{index+1}/{tasks.length}</div><div>Level: {task.level}</div></div>
            <div className={body}>
                {shouldSpell && <div className={spellDiv}>{dict.word}</div>}
                {this.shouldSound && <div>{dict.phonetic}</div>}
                {shouldMean && (dict.picture ? <img src={dict.picture} /> : <div><pre>{dict.translation}</pre></div>)}
            </div>
            <div className={tail}>
                <Button variant="contained" onClick={this.handleSpeakIt} title="Hot Key: B/C">Read</Button>
                <Button variant="contained" onClick={this.handleShowAnswer} title="Hot key: Space">Answer</Button>
                <Button variant="contained" onClick={this.handleIKnown} title="Hot key: X/N" color="primary">Known</Button>
                <Button variant="contained" onClick={this.handleDontKnow} title="Hot key: Z/M" color="secondary">Don't</Button>
                <Button variant="contained" onClick={this.handleNext} title="Hot key: .">Ignore</Button>
            </div>
            <audio ref={ref => this.player = ref} />
        </div>;
    }
    componentDidUpdate() {
        if (this.shouldSound && this.player) { this.player.src = this.state.dict.audio; this.player.play() };
    }
}

Study.propTypes = {
    classes: PropTypes.object.isRequired,
    tasks: PropTypes.array.isRequired,
    onFinish: PropTypes.func.isRequired
};

export default withStyles(styles)(Study);
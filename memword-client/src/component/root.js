
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from './app-bar';
import StatShow from './stat-show';
import About from './about';
import ActiveEmailSend from './active-email-sent';
import Study from './study';
import Dict from './dict';
import { statInitValue, login, renew, getTaskFromServer, getStat,
    isTokenExpired, openDatabase, setAccessToken, getEmail } from '../service/mem';

const styles = {
    root: { height: 'calc(100vh - 190px)', display: 'flex', flexDirection: 'column' },
    body: { flex: 1, paddingTop: '10px', display: 'flex' }
};

class Root extends React.Component {
    state = {
        loca: 'about', /*'home','study','dict','imexport */
        isLogin: false,
        stat: statInitValue(),
        tasks: null
    };
    handleClickLogin = async (email) => (await login(email)).accepted.includes(email) && this.setState({ loca: 'activeEmailSent' });
    handleClickLogout = () => { };
    handleClickUpdateTasks = async () => (await getTaskFromServer(), this.setState({ loca: 'stat', stat: await getStat() }));
    handleClickStatBar = (tasks) => this.setState({ loca: 'study', tasks });
    handleStudyFinish = async () => this.setState({ loca: 'stat', stat: await getStat() });
    render() {
        const { classes: { root, body } } = this.props;
        const { loca, isLogin, stat, tasks } = this.state;
        const home = () => {
            switch (loca) {
                case 'about': return <About />;
                case 'stat': return <StatShow statData={stat} onClickStatBar={this.handleClickStatBar} />;
                case 'activeEmailSent': return <ActiveEmailSend />;
                case 'study': return <Study tasks={tasks} onFinish={this.handleStudyFinish}/>
                case 'dict': return <Dict/>
            }
        };
        return <div className={root}>
            <AppBar isLogin={isLogin}
                onClickLogin={this.handleClickLogin}
                onClickLogout={this.handleClickLogout}
                onClickUpdateTasks={this.handleClickUpdateTasks} />
            <div className={body}>{home()}</div>
        </div>;
    }
    async componentDidMount() {
        const token = new URLSearchParams(window.location.search).get('token');
        if (token) {
            setAccessToken(token);
            window.location.assign(window.location.origin + window.location.pathname);
        } else if (!isTokenExpired()) {
            this.setState({ isLogin: true });
            await renew();
            await openDatabase(getEmail());
            this.setState({ stat: await getStat(), loca: 'stat' });
        }
    }
}

Root.propTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Root);
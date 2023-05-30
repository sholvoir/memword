import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import { getEmail } from '../service/mem';

const styles = {
    grow: { flexGrow: 1 },
    email: { color: 'white', padding: '0 5px', background: 'rgba(255,255,255,0.1)' }
};

class MAppBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            email: getEmail() || ''
        };
    }
    handleToggle = () => this.setState({ open: !this.state.open });
    handleClose = () => this.setState({ open: false });
    handleUpdateDict = () => {
        this.handleClose();
    };
    handleUpdateTasks = () => {
        this.handleClose();
        this.props.onClickUpdateTasks();
    }
    handleClickLogout = () => {
        this.handleClose();
        this.props.onClickLogout();
    }
    handleClickLogin = () => this.props.onClickLogin(this.state.email);
    handleChange = event => this.setState({email: event.target.value});
    render() {
        const { open, email } = this.state;
        const { classes, isLogin, onClickLogin } = this.props;
        return (
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" color="inherit">
                        MEMWORD
                    </Typography>
                    <div className={classes.grow}></div>
                    {!isLogin && <InputBase className={classes.email} value={email} onChange={this.handleChange}/>}
                    {!isLogin && <Button color="inherit" onClick={this.handleClickLogin}>Login</Button>}
                    {isLogin && <Button color="inherit"
                        buttonRef={node => this.anchorEl = node}
                        aria-owns="login-out-menu"
                        aria-haspopup="true"
                        onClick={this.handleToggle}>
                        {email}
                    </Button>}
                    {isLogin && <Menu id="login-out-menu" anchorEl={this.anchorEl}
                        getContentAnchorEl={undefined}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                        transformOrigin={{ horizontal: 'right', vertical: 'top'}}
                        open={open}
                        onClose={this.handleClose}>
                        <MenuItem onClick={this.handleUpdateDict}>Update Dict</MenuItem>
                        <MenuItem onClick={this.handleUpdateTasks}>Update Tasks</MenuItem>
                        <MenuItem onClick={this.handleClickLogout}>Logout</MenuItem>
                    </Menu>}
                </Toolbar>
            </AppBar>
        );
    }
}

MAppBar.propTypes = {
    classes: PropTypes.object.isRequired,
    onClickLogin: PropTypes.func.isRequired,
    onClickLogout: PropTypes.func.isRequired,
    onClickUpdateTasks: PropTypes.func.isRequired,
    isLogin: PropTypes.bool.isRequired
};

export default withStyles(styles)(MAppBar);
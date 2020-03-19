import React, { Component } from 'react';
import Login from './Login';
import Register from './Register';
import { connect } from "react-redux";
import { Route, Switch, Link, withRouter } from 'react-router-dom'
import {
  Button,
} from "reactstrap";
import PropTypes from "prop-types";
import { buttonClicked } from "../actions/uiActions";
import './style.css';
import store from '../store';
import { isAuth } from '../actions/authActions'
import { Redirect } from 'react-router-dom'
import { appStatusType } from '../constants'

var divStyle = {
  color: 'white'
};

export class HomePage extends Component {

  componentDidMount() {
    // Check if session cookie is present
    store.dispatch(isAuth());
  }

  static propTypes = {
    button: PropTypes.bool,
    isAuthenticated: PropTypes.bool,
  };

  render() {
    const { pathname } = this.props.location;
    console.log("pathname===>", pathname)
    if ((!this.props.appStatus || this.props.appStatus === appStatusType.OTP_SENT) && pathname != '/login') {
      return <Redirect to="/login" />
    }

    if (this.props.appStatus === appStatusType.REGISTERED && pathname != '/profile') {
      return <Redirect to="/profile" />
    }

    if (this.props.appStatus === appStatusType.OTP_VERIFIED && pathname != '/register') {
      return <Redirect to="/register" />
    }

    return (
      <div className="container">
        <div className="main">
          {/* <h1 style={divStyle}> <strong>MERN</strong> Sessions Auth App </h1>
          <br/>
            <h5 style={divStyle}>Minimalistic Sessions based Authentication app <span role="img" aria-label="lock">🔒 </span><br></br>Built with React + Redux, NodeJS, Express, MongoDB and Bootstrap</h5>
            <h5 style={divStyle}>Uses Cookies <span role="img" aria-label="lock">🍪 </span></h5>
          <br/> */}
          <div>

            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
            </Switch>

            {this.props.button && <Link className='divStyle' to="/login">
              <Button size="lg" color="light">Start</Button>
            </Link>}
            {/* 
             {this.props.button && <Link className='divStyle' to="/register">
               <Button  size="lg"  color="light">Register</Button>
             </Link>} */}

          </div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => ({ //Maps state to redux store as props
  button: state.ui.button,
  isAuthenticated: state.auth.isAuthenticated,
  appStatus: state.auth.appStatus
});

export default connect(mapStateToProps)(withRouter(HomePage));

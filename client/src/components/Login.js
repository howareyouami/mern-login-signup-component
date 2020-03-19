import React, { Component } from 'react'
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardTitle,
  CardSubtitle,
  CardBody,
  Alert,
  Spinner
} from "reactstrap";
import { connect } from "react-redux"; // API to connect component state to redux store
import PropTypes from "prop-types";
import { buttonClicked, isLoading } from "../actions/uiActions";
import { login } from "../actions/authActions";
import { appStatusType } from '../constants'
import { Link } from 'react-router-dom'
import './style.css';



class Login extends Component {

  state = {
    email: "",
    password: "",
    msg: "",
    otp: ""
  }

  static propTypes = {
    buttonClicked: PropTypes.func.isRequired,
    isLoading: PropTypes.func.isRequired,
    button: PropTypes.bool,
    login: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
    status: PropTypes.object.isRequired,
    loading: PropTypes.bool
  };

  componentDidMount() {
    this.props.buttonClicked();
  }

  componentDidUpdate(prevProps) {
    const status = this.props.status;

    if (status !== prevProps.status) {

      if (status.id === "LOGIN_FAIL") {
        this.setState({ msg: status.statusMsg });
      }
    }
  };


  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();

    const { email } = this.state;

    const user = { email };
    this.props.isLoading();
    this.props.login(user);
  };


  render() {

    let className = 'divStyle';
    if (!this.props.button) {
      className = 'formStyle';
    }
    return (
      <div className={className}>

        <Card>
          <CardBody >
            <CardTitle> <h2><strong>Welcome, please enter your E-mail</strong></h2></CardTitle>
            {/* <CardSubtitle className="text-muted">Don't have an account?
                <Link to="/register"> Register. </Link></CardSubtitle> */}
            <br />
            {this.state.msg ? (
              <Alert color="danger">{this.state.msg}</Alert>
            ) : null}
            <Form onSubmit={this.onSubmit} >
              <FormGroup>

                {!this.props.showOtp && <>
                  <Label for="email">E-mail</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    size="lg"
                    placeholder="you@youremail.com"
                    className="mb-3"
                    onChange={this.onChange}
                  /></>}
                {this.props.showOtp && <><Label for="otp">OTP</Label>
                  <Input
                    name="otp"
                    id="otp"
                    size="lg"
                    placeholder="Enter your OTP"
                    className="mb-3"
                    onChange={this.onChange}
                  /></>}
                <Button size="lg" color="dark" style={{ marginTop: "2rem" }} block>
                  {this.props.loading ?
                    <span >Checking... <Spinner size="sm" color="light" /></span> : <span>Lets go</span>}
                </Button>
              </FormGroup>
            </Form>
          </CardBody>
        </Card>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({ //Maps state element in redux store to props
  //location of element in the state is on the right and key is on the left
  button: state.ui.button, //store.getState().ui.button another way to get button bool
  isAuthenticated: state.auth.isAuthenticated,
  status: state.status,
  loading: state.ui.loading,
  showOtp: state.auth.appStatus === appStatusType.OTP_SENT
});

export default connect(mapStateToProps, { login, isLoading, buttonClicked })(Login);

import axios from "axios";
import { returnStatus } from "./statusActions";

import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  AUTH_SUCCESS,
  AUTH_FAIL,
  LOGOUT_SUCCESS,
  IS_LOADING,
  CHANGE_APP_STATUS
} from "./types";

import { appStatusType } from '../constants'

axios.defaults.baseURL = "http://localhost:5000";

// axios.defaults.baseURL = "https://demos.shawndsilva.com/sessions-auth-app"

//Check if user is already logged in
export const isAuth = () => (dispatch) => {

  axios
    .get("/api/users/authchecker", {
      withCredentials: true
    })
    .then((res) =>
      dispatch({
        type: AUTH_SUCCESS,
        payload: res.data
      })
    )
    .catch((err) => {
      dispatch({
        type: AUTH_FAIL
      });
    });

}

//Register New User
export const register = ({
  firstName,
  lastName,
  refCode,
  userId }) => (dispatch) => {
    // Headers
    const headers = {
      headers: {
        "Content-Type": "application/json"
      }
    };

    // Request body
    const body = JSON.stringify({ firstName, lastName, refCode, userId });
    axios
      .post("/api/users/register", body, headers)
      .then((res) => {
        dispatch(returnStatus(res.data, res.status, REGISTER_SUCCESS));
        dispatch({ type: CHANGE_APP_STATUS, payload: res.data })
        dispatch({ type: IS_LOADING })
      })
      .catch((err) => {
        dispatch(returnStatus(err.response.data, err.response.status, 'REGISTER_FAIL'))
        dispatch({
          type: REGISTER_FAIL
        });
        dispatch({ type: IS_LOADING })
      });
  };

//Login User
export const login = ({ email, password }) => (dispatch) => {
  // Headers
  const headers = {
    headers: {
      "Content-Type": "application/json"
    }
  };

  // Request body
  const body = JSON.stringify({ email, password });

  axios
    .post("/api/users/login", body, headers)
    .then((res) => {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });
      dispatch({ type: CHANGE_APP_STATUS, payload: appStatusType.OTP_SENT })
      dispatch({ type: IS_LOADING });
    }
    )
    .catch((err) => {
      dispatch(returnStatus(err.response.data, err.response.status, 'LOGIN_FAIL'))
      dispatch({
        type: LOGIN_FAIL
      });
      dispatch({ type: IS_LOADING })
    });
};


//Login User
export const otpVerify = ({ otp, userId }) => (dispatch) => {
  axios
    .post("/api/users/otpVerify", { otp, userId })
    .then((res) => {
      console.log("res", res)
      dispatch({ type: CHANGE_APP_STATUS, payload: res.data })
      dispatch({ type: IS_LOADING });
    }
    )
    .catch((err) => {
      dispatch(returnStatus(err.response.data, err.response.status, 'LOGIN_FAIL'))
      // dispatch({
      //   type: LOGIN_FAIL
      // });
      dispatch({ type: IS_LOADING })
    });
};

//Logout User and Destroy session
export const logout = () => (dispatch) => {

  axios
    .delete("/api/users/logout", { withCredentials: true })
    .then((res) =>
      dispatch({
        type: LOGOUT_SUCCESS,
      })
    )
    .catch((err) => {
      console.log(err);
    });

}
import * as React from "react";
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState } from '../../store';
import { bindActionCreators, Dispatch } from 'redux';
import { AlertType, Field as ModelField, RegisterViewModel } from '../../models';
import * as AccountState from '../../store/Account';
import * as SessionState from '../../store/Session';
import * as AlertState from '../../store/Alert';
import { InjectedFormProps } from 'redux-form';
import { reset } from "redux-form";
import Loadable from 'react-loadable';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const loading = () => {
    return <div><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>
};

const AsyncRegisterForm = Loadable({
    loader: () => import(/* webpackChunkName: "RegisterForm" */ '../Account/RegisterForm'),
    modules: ['../Account/RegisterForm'],
    webpack: () => [require.resolveWeak('../Account/RegisterForm')],
    loading: loading,
})
type UserMenuProps = AccountState.AccountState
    & {
        accountActions: typeof AccountState.actionCreators,
        alertActions: typeof AlertState.actionCreators,
        sessionActions: typeof SessionState.actionCreators,
    }
    & RouteComponentProps<{}>;

interface AdditionalProps {
    onCancel: () => void;
    fields: ModelField[];
    formButton?: string;
}

type FormProps = InjectedFormProps & AdditionalProps;

export class Register extends React.Component<UserMenuProps, FormProps> {

    render() {
        return <div className="container pt-4">
            <div className="row justify-content-center pt-4">
                <div className="col-12 col-sm-8 col-md-6 col-lg-5">
                    <h2 className="text-center display-4">Register.</h2>
                    <AsyncRegisterForm form='registerForm'
                        enableReinitialize={true}
                        onSubmit={(values: RegisterViewModel, dispatch) => {
                                this.props.accountActions.register(values,
                                    () => {
                                        this.props.history.push('/');
                                        this.props.alertActions.sendAlert('Your account is created.', AlertType.success, true);
                                        dispatch(reset('registerForm'))
                                        this.props.sessionActions.loadToken();
                                    },
                                    (error) => {
                                        this.props.alertActions.sendAlert(error.error_description, AlertType.danger, true);
                                    }
                                )
                        }} />
                    <div className="bottom text-center">
                        I already have a Login? <Link to="/signin">Sign In</Link>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.account, // Selects which state properties are merged into the component's props
    (dispatch: Dispatch<AccountState.AccountState> | Dispatch<AlertState.AlertState> | Dispatch<SessionState.SessionState>) => { // Selects which action creators are merged into the component's props
        return {
            accountActions: bindActionCreators(AccountState.actionCreators, dispatch),
            alertActions: bindActionCreators(AlertState.actionCreators, dispatch),
            sessionActions: bindActionCreators(SessionState.actionCreators, dispatch),
        };
    },
)(Register) as typeof Register;







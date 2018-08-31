import '../../styles/formStepper.scss';
import * as React from "react";
import { RouteComponentProps } from 'react-router-dom';
import { ApplicationState } from '../../store';
import { connect } from 'react-redux';
import * as SessionState from '../../store/Session';
import * as ProfileState from '../../store/Profile';
import { bindActionCreators, Dispatch } from 'redux';
import * as AlertState from '../../store/Alert';
import { IndexViewModel, AlertType, Field as ModelField } from '../../models';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { InjectedFormProps } from 'redux-form';
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import Loadable from 'react-loadable';

const loading = () => {
    return <div><FontAwesomeIcon icon={faSpinner} spin size="2x" /></div>
};

const ProfileImageForm = Loadable({
    loader: () => import(/* webpackChunkName: "ProfileImageForm" */'./ProfileImageForm'),
    modules: ['./ProfileImageForm'],
    webpack: () => [require.resolveWeak('./ProfileImageForm')],
    loading: loading,
})
const ProfileNameForm = Loadable({
    loader: () => import(/* webpackChunkName: "ProfileNameForm" */'./ProfileNameForm'),
    modules: ['./ProfileNameForm'],
    webpack: () => [require.resolveWeak('./ProfileNameForm')],
    loading: loading,
})

type ProfileProps =
    ProfileState.ProfileState
    & SessionState.SessionState
    & {
        profileActions: typeof ProfileState.actionCreators,
        alertActions: typeof AlertState.actionCreators,
        sessionActions: typeof SessionState.actionCreators
    }
    & RouteComponentProps<{}>;
// At runtime, Redux will merge together...


class EditProfile extends React.Component<ProfileProps, any> {
    steps = [
        { name: 'Personal Info', icon: faUser },
        { name: 'Upload Profile Image', icon: faImage },
    ]
    state = {
        page: 1,
        showPreviousBtn: false,
        showNextBtn: true,
        compState: 0,
        navState: this.getNavStates(0, this.steps.length),
        isLoading: false
    };

    nextPage = () => {
        this.setState(currentState => ({ page: currentState.page + 1 }));
        this.setNavState(this.state.compState + 1)
        window.scrollTo(0, 0)
    }

    previousPage = () => {
        this.setState(currentState => ({ page: currentState.page - 1 }));
        if (this.state.compState > 0) {
            this.setNavState(this.state.compState - 1)
        }
        window.scrollTo(0, 0)
    }
    componentDidMount() {
        this.props.profileActions.getProfile()
    }

    getNavStates(indx, length) {
        let styles = [];
        for (let i = 0; i < length; i++) {
            if (i < indx) {
                styles.push('done')
            }
            else if (i === indx) {
                styles.push('doing')
            }
            else {
                styles.push('todo')
            }
        }
        return { current: indx, styles: styles }
    }

    checkNavState = (currentStep) => {
        if (currentStep > 0 && currentStep < this.steps.length - 1) {
            this.setState({
                showPreviousBtn: true,
                showNextBtn: true
            })
        }
        else if (currentStep === 0) {
            this.setState({
                showPreviousBtn: false,
                showNextBtn: true
            })
        }
        else {
            this.setState({
                showPreviousBtn: true,
                showNextBtn: false
            })
        }
    }

    setNavState = (next) => {
        this.setState({ navState: this.getNavStates(next, this.steps.length) })
        if (next < this.steps.length) {
            this.setState({ compState: next })
        }
        this.checkNavState(next);
    }

    handleKeyDown = (evt) => {
        if (evt.which === 13) {
            this.nextPage()
        }
    }

    moveToPage = (evt) => {
        if (evt.currentTarget.value <= this.state.compState || evt.currentTarget.value == 1 || evt.currentTarget.value == 0) {
            if (evt.currentTarget.value === (this.steps.length - 1) &&
                this.state.compState === (this.steps.length - 1)) {
                this.setNavState(this.steps.length)
                this.setState({ page: this.steps.length })
            }
            else {
                this.setNavState(evt.currentTarget.value)
                this.setState({ page: evt.currentTarget.value + 1 })
            }
        }
        window.scrollTo(0, 0)
    }

    getClassName = (className, i) => {
        return className + "-" + this.state.navState.styles[i];
    }

    getIcon = (className, i) => {
        if (i < this.state.compState) {
            return faCheck
        } else {
            return className
        }
    }

    render() {
        const { profile } = this.props;
        const { page, isLoading } = this.state;
        return isLoading ? <div className="container pt-4" style={{ height: "70vh" }}><FontAwesomeIcon className="svg-inline--fa fa-w-16 fa-lg" size="1x" style={{ position: "absolute", top: "7vh", left: "50%", fontSize: "45px" }} icon={faSpinner} spin /></div> :
            <div className="container pt-4">
                <div key="checkoutheader" className="text-center pt-4">
                    <h2 className="display-4">Profile.</h2>
                </div>
                <div key="checkoutSteps" className="row multi-step" onKeyDown={this.handleKeyDown} >
                    <div className="col-12">
                        <ol className="progtrckr">
                            {this.steps.map((s, i) => (
                                <li className={this.getClassName("progtrckr", i)} onClick={(e) => this.moveToPage(e)} key={i} value={i}>
                                    <FontAwesomeIcon className="prog-icon svg-inline--fa fa-w-16 fa-lg" size="1x" icon={this.getIcon(this.steps[i].icon, i)} />
                                    <span className="step-title">{this.steps[i].name}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                <div className="row justify-content-center pt-4">
                    <div className="col-12 col-sm-8 col-md-8 col-lg-6 form-wrapper">
                    {isLoading && <FontAwesomeIcon className="svg-inline--fa fa-w-16 fa-lg" size="1x" style={{ position: "absolute", top: "10vh", left: "50%", fontSize: "45px" }} icon={faSpinner} spin />}
                    {page === 1 && <ProfileNameForm
                        onSubmit={(values: IndexViewModel) => {
                            this.props.profileActions.updateProfile(values, () => {
                                this.props.alertActions.sendAlert('Your profile image was saved successfully.', AlertType.success, true);
                                this.nextPage
                            });
                        }}
                    />}
                    {page === 2 &&
                        <ProfileImageForm
                            previousPage={this.previousPage}
                            onSubmit={
                                (values: IndexViewModel) => {
                                    window.scrollTo(0, 0)
                                    this.setState({ isLoading: true });
                                    this.props.profileActions.updateProfile(values, () => {
                                        this.props.alertActions.sendAlert('Your profile image was saved successfully.', AlertType.success, true);
                                        this.nextPage
                                    });
                                }}
                        />}
                </div>
                </div>
            </div>;
    }
}



export default connect(
    (state: ApplicationState) => state.profile,
    (dispatch: Dispatch<ProfileState.ProfileState> | Dispatch<SessionState.SessionState> | Dispatch<AlertState.AlertState>) => {
        return {
            profileActions: bindActionCreators(ProfileState.actionCreators, dispatch),
            alertActions: bindActionCreators(AlertState.actionCreators, dispatch)
        }
    }
)(EditProfile) as typeof EditProfile;
